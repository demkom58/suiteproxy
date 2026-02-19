/**
 * POST /api/v1/images/generations
 *
 * OpenAI-compatible image generation endpoint.
 * Uses Gemini's native image generation capability via AI Studio.
 *
 * The default model is gemini-2.5-flash-image (free "Nano Banana" model)
 * which can output both text and images. We extract only the image data
 * from the response.
 *
 * Response format:
 * - Always returns b64_json (base64-encoded image data)
 * - URL format is not supported (no image hosting)
 */
import type { OpenAIImagesRequest, OpenAIImagesResponse } from '~~/server/types/openai';
import type { RequestContext } from '~~/server/lib/browser/types';
import { enqueueRequest } from '~~/server/lib/browser/queue';
import { ResponseModality } from '~~/server/types/aistudio';
import {
  AuthenticationError,
  RateLimitError,
  NoAccountsError,
} from '~~/server/lib/browser/errors';

// ── Model Aliases for Image Generation ──────────────────────────────────
const IMAGE_MODEL_ALIASES: Record<string, string> = {
  'dall-e-2': 'gemini-2.5-flash-image',
  'dall-e-3': 'gemini-2.5-flash-image',
  'gpt-image-1': 'gemini-2.5-flash-image',
};

// Default model — gemini-2.5-flash-image is free and outputs text + images
const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';

// ── Size → Aspect Ratio Mapping ─────────────────────────────────────────
// OpenAI uses "WxH" sizes, we map to aspect ratio instructions for Gemini.
// AI Studio supports: 1:1, 3:4, 4:3, 9:16, 16:9
const SIZE_TO_ASPECT_RATIO: Record<string, string> = {
  // OpenAI standard sizes
  '1024x1024': '1:1',
  '1792x1024': '16:9',
  '1024x1792': '9:16',
  '512x512': '1:1',
  '256x256': '1:1',
  // Direct aspect ratio values (extension)
  '1:1': '1:1',
  '3:4': '3:4',
  '4:3': '4:3',
  '9:16': '9:16',
  '16:9': '16:9',
  // Common aliases
  'square': '1:1',
  'portrait': '9:16',
  'landscape': '16:9',
  'wide': '16:9',
  'tall': '9:16',
};

/**
 * Build the final prompt, optionally prepending an aspect ratio instruction.
 * Gemini image models respond to natural language aspect ratio hints.
 */
function buildImagePrompt(prompt: string, size?: string): string {
  if (!size) return prompt;

  const aspectRatio = SIZE_TO_ASPECT_RATIO[size.toLowerCase()];
  if (!aspectRatio || aspectRatio === '1:1') return prompt; // 1:1 is default, no hint needed

  return `Generate this image in ${aspectRatio} aspect ratio. ${prompt}`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<OpenAIImagesRequest>(event);

  if (!body.prompt) {
    throw createError({ statusCode: 400, statusMessage: 'prompt is required' });
  }

  // Resolve model aliases
  const requestedModel = body.model || DEFAULT_IMAGE_MODEL;
  const resolvedModel = IMAGE_MODEL_ALIASES[requestedModel] ?? requestedModel;

  const n = Math.min(Math.max(body.n ?? 1, 1), 4);

  // Build prompt with optional aspect ratio hint from size parameter
  const finalPrompt = buildImagePrompt(body.prompt, body.size);

  // Build request context — single-turn, with IMAGE response modality
  const reqId = `img-${crypto.randomUUID().substring(0, 8)}`;
  const context: RequestContext = {
    reqId,
    model: resolvedModel,
    prompt: finalPrompt,
    messages: [{ role: 'user', content: finalPrompt }],
    stream: false, // Image generation is always non-streaming
    temperature: 1,
    // CRITICAL: Tell the model to return images, not just text.
    // Without this, image-capable models output text descriptions instead.
    responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
  };

  try {
    const result = await enqueueRequest(context);

    // Check if we got images back
    // gemini-2.5-flash-image returns text + images; we extract just the images
    if (!result.images || result.images.length === 0) {
      throw createError({
        statusCode: 422,
        statusMessage: result.text
          ? `Model returned text instead of image: ${result.text.substring(0, 200)}`
          : 'Model did not return any images. The prompt may have been filtered or the model does not support image generation.',
      });
    }

    // Build response — take up to n images
    const images = result.images.slice(0, n);

    const response: OpenAIImagesResponse = {
      created: Math.floor(Date.now() / 1000),
      data: images.map(img => ({
        b64_json: img.data,
        revised_prompt: body.prompt,
      })),
    };

    setResponseHeader(event, 'X-Request-Id', reqId);
    return response;

  } catch (error) {
    // Re-throw H3 errors (already formatted)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[ImageGen:${reqId}] Error:`, msg);

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


