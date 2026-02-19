/**
 * POST /api/v1/completions
 *
 * OpenAI-compatible legacy completions endpoint.
 * Wraps the prompt as a single user message and delegates to the chat
 * completions queue, then unwraps the response.
 *
 * Used by many tools that still target the legacy completions API:
 * LM Studio, text-generation-webui, some coding tools, etc.
 */
import type { OpenAICompletionsRequest, OpenAICompletionsResponse } from '~~/server/types/openai';
import type { RequestContext } from '~~/server/lib/browser/types';
import { enqueueRequest, enqueueStreamingRequest } from '~~/server/lib/browser/queue';
import {
  AuthenticationError,
  RateLimitError,
  NoAccountsError,
  ClientDisconnectedError,
} from '~~/server/lib/browser/errors';

// ── Model Aliases (same as chat completions) ────────────────────────────
const MODEL_ALIASES: Record<string, string> = {
  'gpt-4o': 'gemini-2.5-flash-preview',
  'gpt-4': 'gemini-2.5-pro-preview',
  'gpt-4-turbo': 'gemini-2.5-pro-preview',
  'gpt-3.5-turbo': 'gemini-2.0-flash',
  'gpt-3.5-turbo-instruct': 'gemini-2.0-flash',
  'text-davinci-003': 'gemini-2.0-flash',
  'text-davinci-002': 'gemini-2.0-flash',
  'claude-3-opus': 'gemini-2.5-pro-preview',
  'claude-3-sonnet': 'gemini-2.5-flash-preview',
};

export default defineEventHandler(async (event) => {
  const body = await readBody<OpenAICompletionsRequest>(event);

  if (!body.model) {
    throw createError({ statusCode: 400, statusMessage: 'model is required' });
  }

  if (!body.prompt) {
    throw createError({ statusCode: 400, statusMessage: 'prompt is required' });
  }

  // Handle prompt as string or string[] — take first if array
  const promptText = Array.isArray(body.prompt) ? body.prompt[0] ?? '' : body.prompt;

  // Resolve model aliases
  const resolvedModel = MODEL_ALIASES[body.model] ?? body.model;

  // Normalize stop sequences
  const stopSequences = body.stop
    ? (Array.isArray(body.stop) ? body.stop : [body.stop])
    : undefined;

  // Build request context — wrap prompt as a single user message
  const reqId = `cmpl-${crypto.randomUUID().substring(0, 8)}`;
  const context: RequestContext = {
    reqId,
    model: resolvedModel,
    prompt: promptText,
    messages: [{ role: 'user', content: promptText }],
    stream: body.stream ?? false,
    temperature: body.temperature,
    maxTokens: body.max_tokens,
    topP: body.top_p,
    stopSequences,
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

    const chatId = `cmpl-${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`;
    const created = Math.floor(Date.now() / 1000);
    const model = resolvedModel.startsWith('models/') ? resolvedModel : `models/${resolvedModel}`;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of enqueueStreamingRequest(context)) {
            // Parse the SSE chat completion chunk and re-format as a completions chunk
            // The generator yields raw SSE strings like "data: {...}\n\n"
            // We need to transform them to completions format
            if (chunk.startsWith('data: [DONE]')) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              continue;
            }

            if (chunk.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(chunk.slice(6)) as {
                  choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }>;
                };
                const delta = parsed.choices?.[0]?.delta;
                const text = delta?.content ?? '';

                if (text || parsed.choices?.[0]?.delta?.reasoning_content === undefined) {
                  const completionChunk = {
                    id: chatId,
                    object: 'text_completion',
                    created,
                    model,
                    choices: [{
                      text,
                      index: 0,
                      logprobs: null,
                      finish_reason: null as string | null,
                    }],
                  };

                  // Check if the original had a finish_reason
                  const origChoice = (parsed as { choices?: Array<{ finish_reason?: string | null }> }).choices?.[0];
                  if (origChoice?.finish_reason) {
                    completionChunk.choices[0]!.finish_reason = origChoice.finish_reason;
                  }

                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify(completionChunk)}\n\n`),
                  );
                }
              } catch {
                // If we can't parse, pass through as-is
                controller.enqueue(new TextEncoder().encode(chunk));
              }
            }
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          console.error(`[Completions:${reqId}] Stream error:`, errMsg);
          const errorChunk = {
            id: chatId,
            object: 'text_completion',
            created,
            model,
            choices: [{
              text: `\n\n[Error: ${errMsg}]`,
              index: 0,
              logprobs: null,
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

    return stream;
  }

  // ── Non-Streaming Path ──────────────────────────────────────────────
  try {
    const result = await enqueueRequest(context);

    // Build text: optionally echo the prompt
    const responseText = body.echo
      ? promptText + result.text
      : result.text;

    // Estimate token usage
    const promptTokens = estimateTokens(promptText);
    const completionTokens = estimateTokens(result.text);

    const response: OpenAICompletionsResponse = {
      id: `cmpl-${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`,
      object: 'text_completion',
      created: Math.floor(Date.now() / 1000),
      model: resolvedModel,
      choices: [{
        text: responseText,
        index: 0,
        logprobs: null,
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
    console.error(`[LegacyCompletions:${reqId}] Error:`, msg);

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

    throw createError({ statusCode: 502, statusMessage: msg });
  }
});

/**
 * Estimate token count from text length (~4 chars per token for English).
 */
function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
