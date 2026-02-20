/**
 * POST /api/v1/chat/completions
 *
 * OpenAI-compatible chat completions endpoint.
 * Uses browser UI automation (Camoufox + Playwright) to interact with AI Studio.
 *
 * Supports:
 * - Streaming (SSE) and non-streaming responses
 * - Model switching (per-request model selection)
 * - Thinking models (reasoning_effort parameter)
 * - Temperature, top_p, max_tokens, stop sequences
 * - Multi-account with rate limit awareness
 */
import type {
  OpenAIChatRequest,
  OpenAIChatResponse,
  OpenAIContentPart,
  OpenAIToolDef,
  OpenAIToolCall,
} from '~~/server/types/openai';
import type {
  RequestContext,
  InlineImage,
  GeminiFunctionDeclaration,
  GeminiFunctionCallResult,
  ResponseFormatConfig,
} from '~~/server/lib/browser/types';
import { enqueueRequest, enqueueStreamingRequest } from '~~/server/lib/browser/queue';
import { ResponseModality } from '~~/server/types/aistudio';
import {
  AuthenticationError,
  RateLimitError,
  NoAccountsError,
  ClientDisconnectedError,
} from '~~/server/lib/browser/errors';
import { logRequestStart, logRequestEnd, logRequestUpdate } from '~~/server/utils/request-log';

// ── Model Aliases ───────────────────────────────────────────────────────
const MODEL_ALIASES: Record<string, string> = {
  'gpt-4o': 'gemini-2.5-flash-preview',
  'gpt-4': 'gemini-2.5-pro-preview',
  'gpt-4-turbo': 'gemini-2.5-pro-preview',
  'gpt-3.5-turbo': 'gemini-2.0-flash',
  'claude-3-opus': 'gemini-2.5-pro-preview',
  'claude-3-sonnet': 'gemini-2.5-flash-preview',
};

export default defineEventHandler(async (event) => {
  const body = await readBody<OpenAIChatRequest>(event);

  if (!body.model) {
    throw createError({ statusCode: 400, statusMessage: 'model is required' });
  }

  if (!body.messages || body.messages.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'messages is required' });
  }

  // Resolve model aliases
  const resolvedModel = MODEL_ALIASES[body.model] ?? body.model;

  // Resolve HTTP image URLs to data URIs so both textarea and injection paths can use them
  await resolveImageUrls(body.messages);

  // Parse messages: separate system instruction, extract images, build prompt
  const parsed = parseMessages(body.messages);

  // Parse tools array for all tool types
  const toolConfig = parseTools(body.tools);

  // Parse response_format → structured output config
  const responseFormat = parseResponseFormat(body.response_format);

  // Normalize stop sequences
  const stopSequences = body.stop
    ? (Array.isArray(body.stop) ? body.stop : [body.stop])
    : undefined;

  // Auto-detect image-capable models and enable image output modality
  const imageCapable = isImageCapableModel(resolvedModel);

  // Build request context
  const reqId = `req-${crypto.randomUUID().substring(0, 8)}`;
  const context: RequestContext = {
    reqId,
    model: resolvedModel,
    prompt: parsed.prompt,
    messages: body.messages,
    systemInstruction: parsed.systemInstruction,
    stream: body.stream ?? false,
    temperature: body.temperature,
    maxTokens: body.max_output_tokens ?? body.max_tokens,
    topP: body.top_p,
    stopSequences,
    reasoningEffort: body.reasoning_effort,
    images: parsed.images.length > 0 ? parsed.images : undefined,
    enableGoogleSearch: toolConfig.enableGoogleSearch || undefined,
    enableUrlContext: toolConfig.enableUrlContext || undefined,
    enableCodeExecution: toolConfig.enableCodeExecution || undefined,
    functionDeclarations: toolConfig.functionDeclarations.length > 0
      ? toolConfig.functionDeclarations
      : undefined,
    responseFormat,
    // Enable image output for image-capable models so they can return inline images
    responseModalities: imageCapable
      ? [ResponseModality.TEXT, ResponseModality.IMAGE]
      : undefined,
  };

  // ── Request Logging ──────────────────────────────────────────────────
  const features: string[] = [];
  if (toolConfig.enableGoogleSearch) features.push('search');
  if (toolConfig.enableUrlContext) features.push('url_context');
  if (toolConfig.enableCodeExecution) features.push('code_exec');
  if (toolConfig.functionDeclarations.length > 0) features.push('functions');
  if (responseFormat) features.push(responseFormat.type);
  if (imageCapable) features.push('image_gen');
  logRequestStart({
    id: reqId,
    method: 'POST',
    path: '/v1/chat/completions',
    model: resolvedModel,
    stream: body.stream ?? false,
    features,
    account: null, // account is selected later in the queue
  });

  // ── Streaming Path ──────────────────────────────────────────────────
  if (body.stream) {
    setResponseHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked',
      'X-Request-Id': reqId,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          logRequestUpdate(reqId, { status: 'streaming' });
          console.log(`[Completions:${reqId}] ReadableStream started, iterating generator...`);
          for await (const chunk of enqueueStreamingRequest(context)) {
            console.log(`[Completions:${reqId}] Streaming chunk: ${chunk.length} bytes`);
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          logRequestEnd(reqId, { statusCode: 200 });
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          logRequestEnd(reqId, { statusCode: 500, error: errMsg });
          console.error(`[Completions:${reqId}] Stream error:`, errMsg);

          // Send error as SSE event
          const errorChunk = {
            id: reqId,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: resolvedModel,
            choices: [{
              index: 0,
              delta: { content: `\n\n[Error: ${errMsg}]` },
              finish_reason: 'stop',
            }],
          };
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(errorChunk)}\n\ndata: [DONE]\n\n`),
          );
        } finally {
          controller.close();
        }
      },
    });

    // Return ReadableStream directly — H3 v1.8+ supports this natively
    return stream;
  }

  // ── Non-Streaming Path ──────────────────────────────────────────────
  try {
    const result = await enqueueRequest(context);

    // Estimate token usage from text lengths (~4 chars per token for English)
    const promptTokens = estimateTokens(parsed.prompt);
    const completionTokens = estimateTokens(result.text);

    // Build tool_calls from Gemini function call results (if any)
    const toolCalls = buildToolCalls(result.functionCalls);
    const hasToolCalls = toolCalls && toolCalls.length > 0;

    // Build content: string for text-only, array of parts for multimodal (text + images)
    // When model returns tool_calls, content may be null (model chose to call a function instead of responding)
    const content = hasToolCalls && !result.text
      ? null
      : buildResponseContent(result.text, result.images);

    const response: OpenAIChatResponse = {
      id: `chatcmpl-${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: resolvedModel,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content,
          // Include thinking/reasoning text if present (DeepSeek/Gemini convention)
          ...(result.thinkingText ? { reasoning_content: result.thinkingText } : {}),
          // Include tool_calls when model requests function calls
          ...(hasToolCalls ? { tool_calls: toolCalls } : {}),
        },
        finish_reason: hasToolCalls ? 'tool_calls' : result.finishReason,
      }],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
      },
    };

    logRequestEnd(reqId, {
      statusCode: 200,
      inputTokens: promptTokens,
      outputTokens: completionTokens,
    });

    setResponseHeader(event, 'X-Request-Id', reqId);
    return response;

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Completions:${reqId}] Error:`, msg);

    let statusCode = 502;
    // Map typed errors to HTTP status codes
    if (error instanceof AuthenticationError) statusCode = 401;
    else if (error instanceof RateLimitError) statusCode = 429;
    else if (error instanceof NoAccountsError) statusCode = 503;
    else if (error instanceof ClientDisconnectedError) statusCode = 499;
    else if (msg.includes('expired') || msg.includes('login') || msg.includes('auth')) statusCode = 401;
    else if (msg.includes('rate limit') || msg.includes('429') || msg.includes('quota')) statusCode = 429;
    else if (msg.includes('No available account') || msg.includes('No accounts')) statusCode = 503;

    logRequestEnd(reqId, { statusCode, error: msg });
    throw createError({ statusCode, statusMessage: msg });
  }
});

// ── Message Parsing ─────────────────────────────────────────────────────

interface ParsedMessages {
  /** Prompt text to type into the AI Studio textarea */
  prompt: string;
  /** System instruction to set via the UI panel (separated from prompt) */
  systemInstruction: string | undefined;
  /** Images extracted from image_url content parts */
  images: Array<{ mimeType: string; data: string }>;
}

/**
 * Parse OpenAI messages into prompt text, system instruction, and images.
 *
 * - System messages are extracted separately for the AI Studio system instruction panel
 * - Image URLs (data: URIs) are extracted for file upload
 * - Remaining messages are formatted as a prompt string for the textarea
 */
function parseMessages(messages: OpenAIChatRequest['messages']): ParsedMessages {
  const systemMessages = messages.filter(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  // Extract system instruction (for the UI panel)
  const systemInstruction = systemMessages.length > 0
    ? systemMessages.map(m => extractTextContent(m.content)).join('\n')
    : undefined;

  // Extract all images from messages
  const images = extractImages(messages);

  // Build prompt from non-system messages
  const prompt = buildPrompt(nonSystemMessages);

  return { prompt, systemInstruction, images };
}

/**
 * Build a prompt string from non-system messages.
 * Single user message → send directly (most common case).
 * Multi-turn → format with role labels.
 */
function buildPrompt(messages: OpenAIChatRequest['messages']): string {
  if (messages.length === 0) return '';

  // Single user message — send directly without role labels
  if (messages.length === 1 && messages[0]?.role === 'user') {
    return extractTextContent(messages[0]!.content);
  }

  // Multi-turn conversation — format with role labels
  const parts: string[] = [];

  for (const msg of messages) {
    const content = extractTextContent(msg.content);
    const roleLabel = msg.role === 'user' ? 'User' : 'Assistant';
    parts.push(`[${roleLabel}]\n${content}`);
  }

  // Add a final [Assistant] prompt if the last message is from the user
  if (messages.length > 0 && messages[messages.length - 1]?.role === 'user') {
    parts.push('[Assistant]');
  }

  return parts.join('\n\n');
}

/**
 * Extract text content from a message's content field.
 * Handles string, null, and array content (multimodal).
 */
function extractTextContent(content: OpenAIChatRequest['messages'][0]['content']): string {
  if (content === null || content === undefined) return '';
  if (typeof content === 'string') return content;

  return content
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('\n');
}

/**
 * Resolve HTTP/HTTPS image URLs to data: URIs in-place.
 * Called before message parsing so both the textarea path (ctx.images)
 * and injection path (ctx.messages → prompt-builder) get the resolved data.
 *
 * Fetches images concurrently with a 30s timeout per image.
 */
async function resolveImageUrls(messages: OpenAIChatRequest['messages']): Promise<void> {
  const tasks: Array<{ part: { type: 'image_url'; image_url: { url: string } }; url: string }> = [];

  for (const msg of messages) {
    if (!msg.content || typeof msg.content === 'string') continue;
    for (const part of msg.content) {
      if (part.type !== 'image_url') continue;
      const url = part.image_url.url;
      // Only fetch HTTP(S) URLs — data: URIs are already resolved
      if (url.startsWith('http://') || url.startsWith('https://')) {
        tasks.push({ part: part as { type: 'image_url'; image_url: { url: string } }, url });
      }
    }
  }

  if (tasks.length === 0) return;

  console.log(`[Completions] Resolving ${tasks.length} HTTP image URL(s)...`);

  const results = await Promise.allSettled(
    tasks.map(async (task) => {
      const resp = await fetch(task.url, {
        signal: AbortSignal.timeout(30_000),
        headers: { 'Accept': 'image/*' },
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} fetching ${task.url.substring(0, 80)}`);
      }
      const buffer = await resp.arrayBuffer();
      const mimeType = resp.headers.get('content-type')?.split(';')[0]?.trim() ?? 'image/png';
      const base64 = Buffer.from(buffer).toString('base64');
      // Mutate the message part in-place to a data: URI
      task.part.image_url.url = `data:${mimeType};base64,${base64}`;
    }),
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i]!;
    if (result.status === 'rejected') {
      console.warn(`[Completions] Failed to fetch image: ${result.reason}`);
    }
  }
}

/**
 * Extract images from all messages (flat array for textarea path's uploadImages).
 * By this point, HTTP URLs have already been resolved to data: URIs by resolveImageUrls().
 */
function extractImages(
  messages: OpenAIChatRequest['messages'],
): Array<{ mimeType: string; data: string }> {
  const images: Array<{ mimeType: string; data: string }> = [];

  for (const msg of messages) {
    if (!msg.content || typeof msg.content === 'string') continue;

    for (const part of msg.content) {
      if (part.type !== 'image_url') continue;

      const url = part.image_url.url;
      // Parse data: URI — data:<mimeType>;base64,<base64data>
      const dataMatch = url.match(/^data:([^;]+);base64,(.+)$/);
      if (dataMatch) {
        images.push({
          mimeType: dataMatch[1]!,
          data: dataMatch[2]!,
        });
      } else {
        // Should not happen after resolveImageUrls, but log just in case
        console.warn(`[Completions] Unresolved image URL (not data: URI): ${url.substring(0, 50)}...`);
      }
    }
  }

  return images;
}

// ── Tool / Config Parsing ────────────────────────────────────────────────

interface ToolConfig {
  enableGoogleSearch: boolean;
  enableUrlContext: boolean;
  enableCodeExecution: boolean;
  functionDeclarations: GeminiFunctionDeclaration[];
}

/**
 * Parse the tools array into structured config.
 * Detects Google Search, URL Context, Code Execution, and Function Calling tools.
 *
 * Supported formats:
 * - Google native: { google_search: {} }, { google_search_retrieval: {} }
 * - Google native: { url_context: {} }
 * - Google native: { code_execution: {} }
 * - OpenAI function tools: { type: "function", function: { name, description, parameters } }
 * - Special function names: "googleSearch", "google_search", "urlContext", "url_context", "codeExecution", "code_execution"
 */
function parseTools(tools: OpenAIChatRequest['tools']): ToolConfig {
  const config: ToolConfig = {
    enableGoogleSearch: false,
    enableUrlContext: false,
    enableCodeExecution: false,
    functionDeclarations: [],
  };

  if (!tools || tools.length === 0) return config;

  for (const tool of tools) {
    if (!tool || typeof tool !== 'object') continue;

    const t = tool as Record<string, unknown>;

    // Google native: { google_search_retrieval: {} } or { googleSearchRetrieval: {} }
    if ('google_search_retrieval' in t || 'googleSearchRetrieval' in t) {
      config.enableGoogleSearch = true;
      continue;
    }
    // Google native: { google_search: {} } or { googleSearch: {} }
    if ('google_search' in t || 'googleSearch' in t) {
      config.enableGoogleSearch = true;
      continue;
    }
    // Google native: { url_context: {} } or { urlContext: {} }
    if ('url_context' in t || 'urlContext' in t) {
      config.enableUrlContext = true;
      continue;
    }
    // Google native: { code_execution: {} } or { codeExecution: {} }
    if ('code_execution' in t || 'codeExecution' in t) {
      config.enableCodeExecution = true;
      continue;
    }

    // OpenAI function tool format: { type: "function", function: { name, ... } }
    if (t.type === 'function' && t.function && typeof t.function === 'object') {
      const fn = t.function as Record<string, unknown>;
      const fnName = String(fn.name ?? '');

      // Check for special tool names that map to Google features
      if (fnName === 'googleSearch' || fnName === 'google_search') {
        config.enableGoogleSearch = true;
        continue;
      }
      if (fnName === 'urlContext' || fnName === 'url_context') {
        config.enableUrlContext = true;
        continue;
      }
      if (fnName === 'codeExecution' || fnName === 'code_execution') {
        config.enableCodeExecution = true;
        continue;
      }

      // Regular function tool → map to Gemini functionDeclaration
      config.functionDeclarations.push({
        name: fnName,
        description: fn.description ? String(fn.description) : undefined,
        parameters: fn.parameters as Record<string, unknown> | undefined,
      });
    }
  }

  return config;
}

/**
 * Parse OpenAI response_format into our internal ResponseFormatConfig.
 * Supports: text, json_object, json_schema (with schema extraction).
 */
function parseResponseFormat(
  format: OpenAIChatRequest['response_format'],
): ResponseFormatConfig | undefined {
  if (!format) return undefined;
  if (format.type === 'text') return undefined; // text is the default, no config needed

  if (format.type === 'json_object') {
    return { type: 'json_object' };
  }

  if (format.type === 'json_schema' && 'json_schema' in format) {
    return {
      type: 'json_schema',
      schema: format.json_schema.schema,
    };
  }

  return undefined;
}

/**
 * Convert Gemini function call results into OpenAI tool_calls format.
 */
function buildToolCalls(
  functionCalls?: GeminiFunctionCallResult[],
): OpenAIToolCall[] | undefined {
  if (!functionCalls || functionCalls.length === 0) return undefined;

  return functionCalls.map((fc) => ({
    id: `call_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`,
    type: 'function' as const,
    function: {
      name: fc.name,
      arguments: JSON.stringify(fc.args),
    },
  }));
}

// ── Multimodal Response Builder ─────────────────────────────────────────

/**
 * Build response content. Returns a plain string for text-only responses
 * (most common case, backward-compatible). Returns an array of content parts
 * for multimodal responses (text + images from image-generation models).
 *
 * Images are encoded as data: URIs in image_url parts.
 */
function buildResponseContent(
  text: string,
  images?: InlineImage[],
): string | OpenAIContentPart[] {
  // Text-only — return plain string (most clients expect this)
  if (!images || images.length === 0) {
    return text;
  }

  // Multimodal — build array of content parts
  const parts: OpenAIContentPart[] = [];

  if (text) {
    parts.push({ type: 'text', text });
  }

  for (const img of images) {
    parts.push({
      type: 'image_url',
      image_url: { url: `data:${img.mimeType};base64,${img.data}` },
    });
  }

  return parts;
}

// ── Image Capability Detection ──────────────────────────────────────────

/**
 * Check if a model supports image output (native image generation).
 * These models need responseModalities=[TEXT, IMAGE] to return images.
 */
function isImageCapableModel(model: string): boolean {
  const m = model.toLowerCase();
  return m.includes('image')
    || m.includes('imagen')
    || (m.includes('gemini-2.0') && m.includes('flash') && m.includes('exp'));
}

// ── Token Estimation ────────────────────────────────────────────────────

/**
 * Estimate token count from text length.
 * Uses a heuristic: ~4 characters per token for English,
 * ~2 characters per token for CJK/emoji-heavy text.
 * This is an approximation — actual token counts depend on the tokenizer.
 */
function estimateTokens(text: string): number {
  if (!text) return 0;

  // Count CJK characters (each is roughly 1 token)
  const cjkPattern = /[\u4e00-\u9fff\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef]/g;
  const cjkMatches = text.match(cjkPattern);
  const cjkCount = cjkMatches?.length ?? 0;

  // Non-CJK characters: ~4 chars per token
  const nonCjkLength = text.length - cjkCount;
  const nonCjkTokens = Math.ceil(nonCjkLength / 4);

  return cjkCount + nonCjkTokens;
}
