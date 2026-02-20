// Network Interceptor v4 — external replay for true streaming.
//
// ARCHITECTURE:
//
// NON-STREAMING:
//   page.route() → route.continue() → page.on('response') → response.body()
//   → parse server-side. Fast and reliable.
//
// STREAMING (external replay):
//   page.route() intercepts the GenerateContent request.
//   Instead of passing it to the browser, we:
//   1. Extract URL, headers, and body from route.request()
//   2. Make our OWN fetch() from Node.js to the same Google endpoint
//   3. Stream the response body using ReadableStream
//   4. Incrementally parse gRPC-web JSON chunks and yield them
//   5. Fulfill the browser route with the complete response when done
//
// Why external replay?
//   - page.route() catches ALL transports at network level (reliable)
//   - Playwright's response.body() and route.fetch() both buffer fully (no streaming)
//   - In-browser XHR/fetch patches don't catch gRPC-web's Rv polyfill
//   - Node.js fetch() with ReadableStream gives us true streaming access
//   - We replay the EXACT same request (same cookies, headers, auth) so Google can't tell

import type { Page, BrowserContext, Route, Response as PlaywrightResponse, Request as PlaywrightRequest } from 'playwright-core';
import type { InlineImage, InlineAudio, GeminiFunctionCallResult } from './types';
import { getErrorMessage } from '~~/server/utils/helpers';

// ── Types ───────────────────────────────────────────────────────────────

export type { InlineImage };

export interface StreamChunk {
  text: string;
  thinking?: string;
  done: boolean;
  error?: string;
  finishReason?: string;
  /** Inline images returned by image-generation models (base64 encoded). */
  images?: InlineImage[];
  /** Inline audio returned by TTS models (base64 encoded). */
  audioChunks?: InlineAudio[];
  /** Function calls requested by the model. */
  functionCalls?: GeminiFunctionCallResult[];
}

interface BufferChunk extends StreamChunk {
  reqId: string;
  timestamp: number;
  source: 'replay' | 'response';
}

// ── Module state ────────────────────────────────────────────────────────

let chunkBuffer: BufferChunk[] = [];
let captureActive = false;
let captureReqId = '';
let captureMode: 'streaming' | 'non-streaming' = 'non-streaming';
let routeInstalled = false;

// Signals that the route handler saw the request go through
let routeFired = false;

// ── Helpers ─────────────────────────────────────────────────────────────

/** Push a chunk to the shared buffer with consistent conditional spreading. */
function pushChunk(
  reqId: string,
  source: 'replay' | 'response',
  data: {
    text?: string; thinking?: string; done?: boolean; error?: string;
    images?: InlineImage[]; audioChunks?: InlineAudio[]; functionCalls?: GeminiFunctionCallResult[];
  },
): void {
  chunkBuffer.push({
    text: data.text ?? '',
    thinking: data.thinking,
    images: data.images?.length ? data.images : undefined,
    audioChunks: data.audioChunks?.length ? data.audioChunks : undefined,
    functionCalls: data.functionCalls?.length ? data.functionCalls : undefined,
    done: data.done ?? false,
    error: data.error,
    reqId,
    timestamp: Date.now(),
    source,
  });
}

/** Categorize extracted content parts into typed buckets. */
function categorizeContentParts(parts: ContentPart[]): {
  text: string; thinking: string;
  images: InlineImage[]; audioChunks: InlineAudio[]; functionCalls: GeminiFunctionCallResult[];
} {
  let text = '';
  let thinking = '';
  const images: InlineImage[] = [];
  const audioChunks: InlineAudio[] = [];
  const functionCalls: GeminiFunctionCallResult[] = [];
  for (const part of parts) {
    if (part.functionCall) functionCalls.push(part.functionCall);
    else if (part.image) images.push(part.image);
    else if (part.audio) audioChunks.push(part.audio);
    else if (part.isThinking) thinking += part.text;
    else text += part.text;
  }
  return { text, thinking, images, audioChunks, functionCalls };
}

/** Check if categorized content has any meaningful data. */
function hasContent(c: { text: string; thinking: string; images: InlineImage[]; audioChunks: InlineAudio[]; functionCalls: GeminiFunctionCallResult[] }): boolean {
  return !!(c.text || c.thinking || c.images.length || c.audioChunks.length || c.functionCalls.length);
}

// ── Incremental streaming parser ────────────────────────────────────────
// Parses the gRPC-web response format: [[chunk1, chunk2, ...]]
// Each chunk at depth 3 is a complete JSON array we can extract text from.

interface IncrementalParserState {
  parsedChunkCount: number;
}

interface ContentPart {
  text: string;
  isThinking: boolean;
  image?: InlineImage;
  audio?: InlineAudio;
  functionCall?: GeminiFunctionCallResult;
}

// ── Function Call Wire Format Parser ────────────────────────────────────
// Gemini gRPC-web response encodes function calls in positional arrays.
// FunctionCall: [name, [[[key, valueParam], ...]]]
// FunctionCallParameter: [null, number?, string?, bool?, object?, array?]
//   - position 1 = number value
//   - position 2 = string value
//   - position 3 = bool value
//   - position 4 = object (list of [key, FunctionCallParameter] tuples)
//   - position 5 = array { elements: [FunctionCallParameter, ...] }

function parseFunctionCallParamValue(param: unknown[]): unknown {
  if (!Array.isArray(param)) return null;
  // position 1: number
  if (param[1] !== null && param[1] !== undefined && typeof param[1] === 'number') return param[1];
  // position 2: string
  if (param[2] !== null && param[2] !== undefined && typeof param[2] === 'string') return param[2];
  // position 3: bool
  if (param[3] !== null && param[3] !== undefined && typeof param[3] === 'boolean') return param[3];
  // position 4: object (list of [key, FunctionCallParameter] tuples)
  if (param[4] !== null && param[4] !== undefined && Array.isArray(param[4])) {
    const obj: Record<string, unknown> = {};
    for (const entry of param[4] as unknown[][]) {
      if (Array.isArray(entry) && entry.length >= 2 && typeof entry[0] === 'string') {
        obj[entry[0] as string] = parseFunctionCallParamValue(entry[1] as unknown[]);
      }
    }
    return obj;
  }
  // position 5: array { elements: [FunctionCallParameter, ...] }
  if (param[5] !== null && param[5] !== undefined && Array.isArray(param[5])) {
    const arrData = param[5] as unknown[];
    // FunctionCallParameterArray has elements at position 0
    const elements = arrData[0];
    if (Array.isArray(elements)) {
      return elements.map(el => parseFunctionCallParamValue(el as unknown[]));
    }
    return [];
  }
  return null;
}

function parseFunctionCallFromWire(fcArr: unknown[]): GeminiFunctionCallResult | null {
  if (!Array.isArray(fcArr) || fcArr.length < 1 || typeof fcArr[0] !== 'string') return null;

  const name = fcArr[0] as string;
  const args: Record<string, unknown> = {};

  // fcArr[1] = tuple[list[FunctionCallArg]] = [[  [key, valueParam], [key, valueParam], ...  ]]
  if (Array.isArray(fcArr[1]) && Array.isArray(fcArr[1][0])) {
    const argsList = fcArr[1][0] as unknown[][];
    for (const arg of argsList) {
      if (Array.isArray(arg) && arg.length >= 2 && typeof arg[0] === 'string') {
        args[arg[0] as string] = parseFunctionCallParamValue(arg[1] as unknown[]);
      }
    }
  }

  return { name, args };
}

function extractContentParts(
  arr: unknown,
  maxDepth = 20,
): ContentPart[] {
  const results: ContentPart[] = [];

  function walk(item: unknown, depth: number): void {
    if (depth > maxDepth || !Array.isArray(item)) return;

    // Text part pattern: [null, "text content", ...]
    // Position 0 = null, position 1 = text string
    if (item.length >= 2 && item[0] === null && typeof item[1] === 'string') {
      const content = item[1] as string;
      if (content.length > 0) {
        // Filter metadata strings from gRPC response — be conservative to avoid
        // dropping real model output. Only filter obvious metadata patterns.
        // Token/session IDs: always start with "v1_" prefix
        if (content.startsWith('v1_')) return;
        // Model resource names: "models/gemini-..."
        if (content.startsWith('models/') && !content.includes(' ')) return;
        // Google API endpoints: must be a pure URL (no spaces = not prose)
        if (content.startsWith('http') && !content.includes(' ')) return;
        // Google internal domains: only filter if it looks like a bare domain/URL (no spaces)
        if (content.includes('.google.') && !content.includes(' ')) return;
        // Base64 data blobs: long strings of only base64 characters
        if (content.length > 200) {
          const cleaned = content.replace(/\s/g, '');
          if (/^[A-Za-z0-9+/=_-]+$/.test(cleaned)) return;
        }
        const isThinking = item[12] === 1;
        results.push({ text: content, isThinking });
      }
      return;
    }

    // Inline data part pattern: [null, null, ["<mimeType>", "<base64data>"]]
    // Position 0 = null (no text), position 1 = null, position 2 = Blob [mimeType, data]
    // The Blob proto: field 1 = mime_type (pos 0), field 2 = data (pos 1)
    // Used for both image and audio inline data from the model.
    if (
      item.length >= 3
      && item[0] === null
      && item[1] === null
      && Array.isArray(item[2])
      && item[2].length >= 2
      && typeof item[2][0] === 'string'
      && typeof item[2][1] === 'string'
    ) {
      const mimeType = item[2][0] as string;
      const data = item[2][1] as string;

      if (mimeType.startsWith('image/') && data.length > 100) {
        results.push({ text: '', isThinking: false, image: { mimeType, data } });
        return;
      }

      if (mimeType.startsWith('audio/') && data.length > 100) {
        results.push({ text: '', isThinking: false, audio: { mimeType, data } });
        return;
      }
    }

    // Function call part pattern (GeneratePart positional format):
    // Position 10 = FunctionCall: ["function_name", [[[key, valueParam], ...]]]
    // where valueParam = [null, number?, string?, bool?, object?, array?]
    // Detected by: array length >= 11, item[10] is array, item[10][0] is string (name)
    if (
      item.length >= 11
      && item[0] === null
      && Array.isArray(item[10])
      && typeof item[10][0] === 'string'
    ) {
      const fc = parseFunctionCallFromWire(item[10] as unknown[]);
      if (fc) {
        results.push({ text: '', isThinking: false, functionCall: fc });
        return;
      }
    }

    for (let i = 0; i < item.length; i++) {
      if (Array.isArray(item[i])) walk(item[i], depth + 1);
    }
  }

  walk(arr, 0);
  return results;
}

/** Extract only text parts (backward-compatible wrapper). */
function extractTextParts(
  arr: unknown,
  maxDepth = 20,
): Array<{ text: string; isThinking: boolean }> {
  return extractContentParts(arr, maxDepth)
    .filter(p => !p.image && !p.functionCall)
    .map(p => ({ text: p.text, isThinking: p.isThinking }));
}

/**
 * Find complete array elements at depth 3 in the accumulated response text.
 * The gRPC-web format is: [[chunk1, chunk2, ...]] where each chunk is an array.
 * We track which chunks we've already parsed to only return new ones.
 */
function findNewCompleteParts(fullText: string, state: IncrementalParserState): string[] {
  const results: string[] = [];
  let depth = 0;
  let inString = false;
  let escape = false;
  let elementStart = -1;
  let chunkIndex = 0;
  const targetDepth = 2; // depth 3 elements (0-indexed: outer=1, inner=2, chunk=3)

  for (let i = 0; i < fullText.length; i++) {
    const ch = fullText[i]!;
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '[') {
      depth++;
      if (depth === targetDepth + 1) elementStart = i;
    } else if (ch === ']') {
      if (depth === targetDepth + 1 && elementStart >= 0) {
        chunkIndex++;
        if (chunkIndex > state.parsedChunkCount) {
          results.push(fullText.substring(elementStart, i + 1));
          state.parsedChunkCount = chunkIndex;
        }
      }
      depth--;
    }
  }
  return results;
}

/**
 * Parse newly-arrived complete chunks from the accumulated response.
 * Returns extracted text and thinking content from only the NEW chunks.
 */
function parseIncrementalChunks(
  fullText: string,
  state: IncrementalParserState,
): { text: string; thinking: string; images: InlineImage[]; audioChunks: InlineAudio[]; functionCalls: GeminiFunctionCallResult[] } {
  const allParts: ContentPart[] = [];
  const newParts = findNewCompleteParts(fullText, state);
  for (const part of newParts) {
    try {
      const parsed: unknown = JSON.parse(part);
      if (Array.isArray(parsed)) {
        allParts.push(...extractContentParts(parsed));
      }
    } catch { /* incomplete JSON — skip */ }
  }
  return categorizeContentParts(allParts);
}

/**
 * Parse complete response body into chunks (for non-streaming).
 * Extracts text, thinking content, inline images, and function calls.
 */
function parseResponseChunks(body: string): Array<{ text: string; thinking: string; images?: InlineImage[]; audioChunks?: InlineAudio[]; functionCalls?: GeminiFunctionCallResult[] }> {
  const chunks: Array<{ text: string; thinking: string; images?: InlineImage[]; audioChunks?: InlineAudio[]; functionCalls?: GeminiFunctionCallResult[] }> = [];
  try {
    const outer: unknown = JSON.parse(body);
    if (!Array.isArray(outer) || outer.length === 0) return chunks;
    const inner: unknown = outer[0];
    if (!Array.isArray(inner)) return chunks;

    for (const chunk of inner) {
      if (!Array.isArray(chunk)) continue;

      const parts = extractContentParts(chunk);
      const c = categorizeContentParts(parts);
      if (hasContent(c)) {
        chunks.push({
          text: c.text,
          thinking: c.thinking,
          ...(c.images.length > 0 ? { images: c.images } : {}),
          ...(c.audioChunks.length > 0 ? { audioChunks: c.audioChunks } : {}),
          ...(c.functionCalls.length > 0 ? { functionCalls: c.functionCalls } : {}),
        });
      }
    }
  } catch { /* parse error */ }
  return chunks;
}

// ── External Replay (streaming) ─────────────────────────────────────────

/**
 * Replay the intercepted request from Node.js and stream the response.
 * This is the core of the v4 approach — we make our own fetch() with the
 * exact same headers/body, and incrementally parse the streaming response.
 */
async function replayAndStream(
  request: PlaywrightRequest,
  route: Route,
  reqId: string,
): Promise<void> {
  const url = request.url();
  const method = request.method();
  const headers = await request.allHeaders();
  const postData = request.postData();

  console.log(`[NetworkInterceptor:${reqId}] Replaying ${method} ${url.substring(0, 80)}...`);

  let fullResponseBody = '';

  try {
    // Make external fetch with the EXACT same request
    const fetchResponse = await fetch(url, {
      method,
      headers,
      body: postData ?? undefined,
      signal: AbortSignal.timeout(300_000),
    });

    if (!fetchResponse.ok) {
      const errorBody = await fetchResponse.text().catch(() => '');
      console.error(`[NetworkInterceptor:${reqId}] Replay failed: HTTP ${fetchResponse.status} — ${errorBody.substring(0, 500)}`);
      pushChunk(reqId, 'replay', { done: true, error: `HTTP ${fetchResponse.status}` });
      // Fulfill the browser with the error response
      await route.fulfill({
        status: fetchResponse.status,
        headers: Object.fromEntries(fetchResponse.headers.entries()),
        body: errorBody,
      });
      return;
    }

    if (!fetchResponse.body) {
      // No streaming body — read all at once
      const body = (await fetchResponse.text()).replace(/\0/g, '');
      fullResponseBody = body;
      const parsed = parseResponseChunks(body);
      for (const chunk of parsed) {
        if (chunk.text || chunk.thinking || chunk.images?.length || chunk.audioChunks?.length || chunk.functionCalls?.length) {
          pushChunk(reqId, 'replay', chunk);
        }
      }
      pushChunk(reqId, 'replay', { done: true });
    } else {
      // Stream the response body!
      const reader = fetchResponse.body.getReader();
      const decoder = new TextDecoder();
      const parserState: IncrementalParserState = { parsedChunkCount: 0 };
      let accumulated = '';
      let streamedText = '';
      let streamedThinking = '';
      const streamedImages: InlineImage[] = [];
      const streamedAudio: InlineAudio[] = [];
      const streamedFunctionCalls: GeminiFunctionCallResult[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        // Strip null bytes — gRPC-web binary framing can inject \0 characters
        // that break JSON.parse() with "Unrecognized token '\0'"
        accumulated += text.replace(/\0/g, '');

        // Parse any new complete chunks from the accumulated text
        const result = parseIncrementalChunks(accumulated, parserState);
        if (hasContent(result)) {
          streamedText += result.text;
          streamedThinking += result.thinking;
          streamedImages.push(...result.images);
          streamedAudio.push(...result.audioChunks);
          streamedFunctionCalls.push(...result.functionCalls);
          pushChunk(reqId, 'replay', result);
        }
      }

      // Final decode flush
      accumulated += decoder.decode().replace(/\0/g, '');
      const finalResult = parseIncrementalChunks(accumulated, parserState);
      if (hasContent(finalResult)) {
        streamedText += finalResult.text;
        streamedThinking += finalResult.thinking;
        streamedImages.push(...finalResult.images);
        streamedAudio.push(...finalResult.audioChunks);
        streamedFunctionCalls.push(...finalResult.functionCalls);
        pushChunk(reqId, 'replay', finalResult);
      }

      fullResponseBody = accumulated;

      // ── Safety fallback: full parse comparison ──
      // The incremental parser may miss content that the full parser catches.
      // Do a complete parse of the accumulated response and check for missing content.
      const fullParsed = parseResponseChunks(accumulated);
      let fullText = '';
      let fullThinking = '';
      const fullImages: InlineImage[] = [];
      const fullAudio: InlineAudio[] = [];
      const fullFunctionCalls: GeminiFunctionCallResult[] = [];
      for (const chunk of fullParsed) {
        fullText += chunk.text;
        fullThinking += chunk.thinking;
        if (chunk.images) fullImages.push(...chunk.images);
        if (chunk.audioChunks) fullAudio.push(...chunk.audioChunks);
        if (chunk.functionCalls) fullFunctionCalls.push(...chunk.functionCalls);
      }

      // If the full parser found more content than the incremental parser,
      // push the MISSING content as a final chunk before done.
      const missingText = fullText.length > streamedText.length
        ? fullText.substring(streamedText.length)
        : '';
      const missingThinking = fullThinking.length > streamedThinking.length
        ? fullThinking.substring(streamedThinking.length)
        : '';
      const missingImages = fullImages.slice(streamedImages.length);
      const missingAudio = fullAudio.slice(streamedAudio.length);
      const missingFunctionCalls = fullFunctionCalls.slice(streamedFunctionCalls.length);

      const missing = { text: missingText, thinking: missingThinking, images: missingImages, audioChunks: missingAudio, functionCalls: missingFunctionCalls };
      if (hasContent(missing)) {
        console.warn(
          `[NetworkInterceptor:${reqId}] Fallback parser recovered missing content: ` +
          `text=${missingText.length} chars, thinking=${missingThinking.length} chars, ` +
          `images=${missingImages.length}, audio=${missingAudio.length}, functionCalls=${missingFunctionCalls.length}`,
        );
        pushChunk(reqId, 'replay', missing);
      }

      pushChunk(reqId, 'replay', { done: true });
    }

    // Fulfill the browser route with the complete response
    // This lets AI Studio's UI update normally
    const responseHeaders: Record<string, string> = {};
    fetchResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    await route.fulfill({
      status: fetchResponse.status,
      headers: responseHeaders,
      body: fullResponseBody,
    });

    console.log(`[NetworkInterceptor:${reqId}] Replay complete: ${fullResponseBody.length} bytes streamed`);

  } catch (error) {
    const msg = getErrorMessage(error);
    console.error(`[NetworkInterceptor:${reqId}] Replay error: ${msg}`);
    pushChunk(reqId, 'replay', { done: true, error: msg });
    // Try to abort the route so the browser doesn't hang
    try {
      await route.abort('failed');
    } catch {
      // Route may already be handled
    }
  }
}

// ── Route Handler ───────────────────────────────────────────────────────

async function handleGenerateContentRoute(route: Route): Promise<void> {
  if (!captureActive) {
    await route.continue();
    return;
  }

  // Verify this is the ACTUAL MakerSuiteService/GenerateContent RPC,
  // not a jserror URL that happens to contain "GenerateContent" in its payload.
  // The real URL always comes from alkalimakersuite-pa.clients6.google.com.
  const requestUrl = route.request().url();
  if (!requestUrl.includes('MakerSuiteService/GenerateContent')) {
    // This is a false match (e.g., a jserror URL with "GenerateContent" in the error text)
    await route.continue();
    return;
  }

  const reqId = captureReqId;
  routeFired = true;

  if (captureMode === 'streaming') {
    // STREAMING: replay externally for real-time chunk access
    console.log(`[NetworkInterceptor:${reqId}] Route fired — replaying externally for streaming`);
    // Don't await — let it stream in the background while consumeStreamingChunks polls
    replayAndStream(route.request(), route, reqId).catch((error) => {
      const msg = getErrorMessage(error);
      console.error(`[NetworkInterceptor:${reqId}] replayAndStream error: ${msg}`);
      pushChunk(reqId, 'replay', { done: true, error: msg });
    });
  } else {
    // NON-STREAMING: pass through to browser, capture via response.body()
    console.log(`[NetworkInterceptor:${reqId}] Route fired — continuing for non-streaming`);
    await route.continue();
  }
}

async function handleGenerateContentResponse(response: PlaywrightResponse, reqId: string): Promise<void> {
  try {
    // Skip false matches (jserror URLs containing "GenerateContent")
    if (!response.url().includes('MakerSuiteService/GenerateContent')) return;

    const status = response.status();
    const bodyBuffer = await response.body();
    const bodyText = bodyBuffer.toString('utf-8').replace(/\0/g, '');

    console.log(`[NetworkInterceptor:${reqId}] Response complete: ${status}, ${bodyText.length} bytes`);

    if (status >= 400) {
      console.error(`[NetworkInterceptor:${reqId}] Error response: HTTP ${status} — body: ${bodyText.substring(0, 500)}`);
    }

    if (status >= 200 && status < 300) {
      const parsedChunks = parseResponseChunks(bodyText);
      for (const chunk of parsedChunks) {
        if (chunk.text || chunk.thinking || chunk.images?.length || chunk.audioChunks?.length || chunk.functionCalls?.length) {
          pushChunk(reqId, 'response', chunk);
        }
      }
      pushChunk(reqId, 'response', { done: true });
    } else {
      pushChunk(reqId, 'response', { done: true, error: `HTTP ${status}` });
    }
  } catch (error) {
    const msg = getErrorMessage(error);
    console.error(`[NetworkInterceptor:${reqId}] Response handler error: ${msg}`);
    pushChunk(reqId, 'response', { done: true, error: msg });
  }
}

// ── Public API ──────────────────────────────────────────────────────────

export async function installInterceptorOnContext(context: BrowserContext): Promise<void> {
  // Use regex for reliable matching — glob patterns must match the ENTIRE URL
  // Actual URL: https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateContent
  await context.route(/GenerateContent/, handleGenerateContentRoute);
  routeInstalled = true;
  console.log('[NetworkInterceptor] Installed route handler on context (regex: /GenerateContent/)');
}

export async function installInterceptor(page: Page): Promise<void> {
  if (!routeInstalled) {
    await page.route(/GenerateContent/, handleGenerateContentRoute);
    routeInstalled = true;
  }
}

export async function reinstallIfNeeded(page: Page): Promise<void> {
  if (!routeInstalled) {
    await installInterceptor(page);
  }
}

/**
 * Start capturing for a new request.
 * @param mode - 'streaming' replays the request externally for real-time chunks.
 *               'non-streaming' uses route.continue() + response.body() for full result.
 */
export async function startCapture(page: Page, reqId: string, mode: 'streaming' | 'non-streaming' = 'non-streaming'): Promise<void> {
  chunkBuffer = [];
  captureReqId = reqId;
  captureActive = true;
  captureMode = mode;
  routeFired = false;

  // For non-streaming, set up response listener to capture via response.body()
  if (mode === 'non-streaming') {
    const onResponse = async (response: PlaywrightResponse) => {
      if (!captureActive) return;
      if (!response.url().includes('MakerSuiteService/GenerateContent')) return;
      page.off('response', onResponse);
      await handleGenerateContentResponse(response, reqId);
    };
    page.on('response', onResponse);
    // Safety timeout to prevent listener leak
    setTimeout(() => { page.off('response', onResponse); }, 300_000);
  }
  // For streaming mode, the route handler will replay externally — no response listener needed

  console.log(`[NetworkInterceptor:${reqId}] Capture started (mode=${mode})`);
}

export async function endCapture(_page: Page): Promise<void> {
  captureActive = false;
  routeFired = false;
}

export async function isCaptureActive(_page: Page): Promise<boolean> {
  return captureActive;
}

export function hasRouteFired(): boolean {
  return routeFired;
}

/**
 * Core chunk consumer — polls the buffer for chunks matching a request ID.
 * Shared implementation for both streaming (15ms poll) and non-streaming (10ms poll) paths.
 */
async function* consumeBufferChunks(
  reqId: string,
  pollMs: number,
  abortSignal?: AbortSignal,
  timeoutMs = 300_000,
  initialDataTimeoutMs = 120_000,
): AsyncGenerator<StreamChunk> {
  const startTime = Date.now();
  let gotAnyData = false;
  let lastActivityTime = Date.now();
  const SILENCE_TIMEOUT_MS = 60_000;

  while (true) {
    if (abortSignal?.aborted) {
      yield { text: '', done: true };
      return;
    }

    if (!gotAnyData && Date.now() - startTime > initialDataTimeoutMs) {
      console.warn(`[NetworkInterceptor:${reqId}] No data after ${initialDataTimeoutMs}ms`);
      yield { text: '', done: true, error: 'no_data' };
      return;
    }
    if (Date.now() - startTime > timeoutMs) {
      yield { text: '', done: true, error: 'Stream timeout' };
      return;
    }

    // Drain matching chunks from the buffer
    const matchingChunks: BufferChunk[] = [];
    const remaining: BufferChunk[] = [];
    for (const chunk of chunkBuffer) {
      if (chunk.reqId === reqId) matchingChunks.push(chunk);
      else remaining.push(chunk);
    }
    chunkBuffer = remaining;

    if (matchingChunks.length === 0) {
      if (gotAnyData && Date.now() - lastActivityTime > SILENCE_TIMEOUT_MS) {
        yield { text: '', done: true };
        return;
      }
      await new Promise(resolve => setTimeout(resolve, pollMs));
      continue;
    }

    lastActivityTime = Date.now();

    for (const chunk of matchingChunks) {
      if (chunk.error) { yield { text: '', done: true, error: chunk.error }; return; }
      if (chunk.done && !chunk.text && !chunk.thinking && !chunk.images?.length && !chunk.audioChunks?.length && !chunk.functionCalls?.length) { yield { text: '', done: true }; return; }
      if (chunk.functionCalls?.length) { gotAnyData = true; yield { text: '', functionCalls: chunk.functionCalls, done: false }; }
      if (chunk.images?.length) { gotAnyData = true; yield { text: '', images: chunk.images, done: false }; }
      if (chunk.audioChunks?.length) { gotAnyData = true; yield { text: '', audioChunks: chunk.audioChunks, done: false }; }
      if (chunk.text) { gotAnyData = true; yield { text: chunk.text, done: false }; }
      if (chunk.thinking) { gotAnyData = true; yield { text: '', thinking: chunk.thinking, done: false }; }
      if (chunk.done) { yield { text: '', done: true }; return; }
    }
  }
}

/**
 * Consume streaming chunks from the replay buffer (15ms poll for real-time feel).
 */
export async function* consumeStreamingChunks(
  _page: Page, reqId: string, abortSignal?: AbortSignal,
  timeoutMs = 300_000, initialDataTimeoutMs = 120_000,
): AsyncGenerator<StreamChunk> {
  yield* consumeBufferChunks(reqId, 15, abortSignal, timeoutMs, initialDataTimeoutMs);
}

/**
 * Consume chunks from the Node-side buffer for non-streaming (10ms poll).
 */
export async function* consumeChunks(
  _page: Page, reqId: string, abortSignal?: AbortSignal,
  timeoutMs = 300_000, initialDataTimeoutMs = 120_000,
): AsyncGenerator<StreamChunk> {
  yield* consumeBufferChunks(reqId, 10, abortSignal, timeoutMs, initialDataTimeoutMs);
}

export function resetInterceptorState(): void {
  chunkBuffer = [];
  captureActive = false;
  captureReqId = '';
  captureMode = 'non-streaming';
  routeInstalled = false;
  routeFired = false;
}
