/**
 * POST /api/v1/audio/speech
 *
 * OpenAI-compatible text-to-speech endpoint.
 * Uses AI Studio's dedicated TTS page for speech generation via the request queue.
 *
 * Gemini TTS models: gemini-2.5-flash-preview-tts, gemini-2.5-pro-preview-tts
 * Available voices: Puck, Charon, Kore, Fenrir, Leda, Aoede, and 24 more.
 * OpenAI voices (alloy, echo, fable, onyx, nova, shimmer) are mapped to Gemini voices.
 *
 * Returns: Raw audio binary (WAV by default).
 * The OpenAI API returns raw audio — NOT a JSON response.
 */
import type { OpenAIAudioSpeechRequest } from '~~/server/types/openai';
import type { RequestContext } from '~~/server/lib/browser/types';
import { enqueueRequest } from '~~/server/lib/browser/queue';
import { TTS_MODEL_ALIASES } from '~~/server/lib/browser/tts-controller';
import {
  AuthenticationError,
  RateLimitError,
  NoAccountsError,
} from '~~/server/lib/browser/errors';

export default defineEventHandler(async (event) => {
  const body = await readBody<OpenAIAudioSpeechRequest>(event);

  if (!body.input) {
    throw createError({ statusCode: 400, statusMessage: 'input is required' });
  }
  if (!body.voice) {
    throw createError({ statusCode: 400, statusMessage: 'voice is required' });
  }

  const reqId = `tts-${crypto.randomUUID().substring(0, 8)}`;

  // Resolve model
  const requestedModel = body.model || 'tts-1';
  const resolvedModel = TTS_MODEL_ALIASES[requestedModel] ?? requestedModel;

  // Build request context with TTS config
  const context: RequestContext = {
    reqId,
    model: resolvedModel,
    prompt: body.input,
    messages: [{ role: 'user', content: body.input }],
    stream: false, // TTS is always non-streaming
    ttsConfig: {
      voice: body.voice,
    },
  };

  try {
    const result = await enqueueRequest(context);

    // Check if we got audio back
    if (!result.audioChunks || result.audioChunks.length === 0) {
      throw createError({
        statusCode: 422,
        statusMessage: 'TTS model did not return any audio data',
      });
    }

    const audio = result.audioChunks[0]!;

    // Decode base64 audio to binary
    const audioBuffer = Buffer.from(audio.data, 'base64');

    // Determine content type based on requested format
    const formatMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      opus: 'audio/opus',
      aac: 'audio/aac',
      flac: 'audio/flac',
      wav: 'audio/wav',
      pcm: 'audio/pcm',
    };
    const requestedFormat = body.response_format ?? 'wav';
    const contentType = formatMap[requestedFormat] ?? audio.mimeType;

    // OpenAI speech API returns raw audio binary, not JSON
    setResponseHeader(event, 'Content-Type', contentType);
    setResponseHeader(event, 'X-Request-Id', reqId);
    setResponseHeader(event, 'Transfer-Encoding', 'chunked');

    return audioBuffer;

  } catch (error) {
    // Re-throw H3 errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[TTS:${reqId}] Error:`, msg);

    if (error instanceof AuthenticationError) {
      throw createError({ statusCode: 401, statusMessage: msg });
    }
    if (error instanceof RateLimitError) {
      throw createError({ statusCode: 429, statusMessage: msg });
    }
    if (error instanceof NoAccountsError) {
      throw createError({ statusCode: 503, statusMessage: msg });
    }

    throw createError({ statusCode: 502, statusMessage: msg });
  }
});
