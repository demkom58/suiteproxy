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
import type { OpenAIChatRequest, OpenAIChatResponse } from '~~/server/types/openai';
import type { RequestContext } from '~~/server/lib/browser/types';
import { enqueueRequest, enqueueStreamingRequest } from '~~/server/lib/browser/queue';
import {
  AuthenticationError,
  RateLimitError,
  NoAccountsError,
  ClientDisconnectedError,
} from '~~/server/lib/browser/errors';

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

  // Parse messages: separate system instruction, extract images, build prompt
  const parsed = parseMessages(body.messages);

  // Parse tools array for Google Search grounding
  const enableGoogleSearch = detectGoogleSearchTool(body.tools);

  // Normalize stop sequences
  const stopSequences = body.stop
    ? (Array.isArray(body.stop) ? body.stop : [body.stop])
    : undefined;

  // Build request context
  const reqId = `req-${crypto.randomUUID().substring(0, 8)}`;
  const context: RequestContext = {
    reqId,
    model: resolvedModel,
    prompt: parsed.prompt,
    systemInstruction: parsed.systemInstruction,
    stream: body.stream ?? false,
    temperature: body.temperature,
    maxTokens: body.max_output_tokens ?? body.max_tokens,
    topP: body.top_p,
    stopSequences,
    reasoningEffort: body.reasoning_effort,
    images: parsed.images.length > 0 ? parsed.images : undefined,
    enableGoogleSearch: enableGoogleSearch || undefined,
  };

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
          console.log(`[Completions:${reqId}] ReadableStream started, iterating generator...`);
          for await (const chunk of enqueueStreamingRequest(context)) {
            console.log(`[Completions:${reqId}] Streaming chunk: ${chunk.length} bytes`);
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
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

    const response: OpenAIChatResponse = {
      id: `chatcmpl-${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: resolvedModel,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: result.text,
        },
        finish_reason: result.finishReason,
      }],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
      },
    };

    setResponseHeader(event, 'X-Request-Id', reqId);
    return response;

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Completions:${reqId}] Error:`, msg);

    // Map typed errors to HTTP status codes
    if (error instanceof AuthenticationError) {
      throw createError({ statusCode: 401, statusMessage: msg });
    }
    if (error instanceof RateLimitError) {
      throw createError({ statusCode: 429, statusMessage: msg });
    }
    if (error instanceof NoAccountsError) {
      throw createError({ statusCode: 503, statusMessage: msg });
    }
    if (error instanceof ClientDisconnectedError) {
      throw createError({ statusCode: 499, statusMessage: msg });
    }

    // Fallback: string-based matching for non-typed errors
    if (msg.includes('expired') || msg.includes('login') || msg.includes('auth')) {
      throw createError({ statusCode: 401, statusMessage: msg });
    }
    if (msg.includes('rate limit') || msg.includes('429') || msg.includes('quota')) {
      throw createError({ statusCode: 429, statusMessage: msg });
    }
    if (msg.includes('No available account') || msg.includes('No accounts')) {
      throw createError({ statusCode: 503, statusMessage: 'No accounts available. Please sync an account first.' });
    }

    throw createError({ statusCode: 502, statusMessage: msg });
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
 * Handles both string content and array content (multimodal).
 */
function extractTextContent(content: OpenAIChatRequest['messages'][0]['content']): string {
  if (typeof content === 'string') return content;

  return content
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map(part => part.text)
    .join('\n');
}

/**
 * Extract images from all messages.
 * Supports data: URIs in image_url content parts.
 * Format: data:<mimeType>;base64,<data>
 */
function extractImages(
  messages: OpenAIChatRequest['messages'],
): Array<{ mimeType: string; data: string }> {
  const images: Array<{ mimeType: string; data: string }> = [];

  for (const msg of messages) {
    if (typeof msg.content === 'string') continue;

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
        console.warn(`[Completions] Unsupported image URL format (only data: URIs supported): ${url.substring(0, 50)}...`);
      }
    }
  }

  return images;
}

/**
 * Detect if the request includes a Google Search grounding tool.
 * Checks for both OpenAI-style function tools and Google's native tool format.
 */
function detectGoogleSearchTool(tools: unknown[] | undefined): boolean {
  if (!tools || tools.length === 0) return false;

  for (const tool of tools) {
    if (!tool || typeof tool !== 'object') continue;

    const t = tool as Record<string, unknown>;

    // Google native format: { google_search_retrieval: {} }
    if ('google_search_retrieval' in t) return true;
    if ('googleSearchRetrieval' in t) return true;

    // Google native format: { google_search: {} }
    if ('google_search' in t) return true;
    if ('googleSearch' in t) return true;

    // OpenAI function format: { type: "function", function: { name: "googleSearch" } }
    if (t.type === 'function' && t.function && typeof t.function === 'object') {
      const fn = t.function as Record<string, unknown>;
      if (fn.name === 'googleSearch' || fn.name === 'google_search') return true;
    }
  }

  return false;
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
