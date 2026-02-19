/**
 * POST /api/v1/images/edits
 *
 * OpenAI-compatible image edit endpoint.
 * Sends an image + text prompt to Gemini and gets an edited image back.
 *
 * Accepts either:
 * - JSON body with { image (base64 or data URI), prompt, model, n, size }
 * - Multipart form data with image file, prompt, model, n, size
 *
 * Uses the injection path with [TEXT, IMAGE] response modalities.
 * The input image is included as a multimodal content part.
 */
import type { OpenAIImagesResponse } from '~~/server/types/openai';
import type { RequestContext } from '~~/server/lib/browser/types';
import { enqueueRequest } from '~~/server/lib/browser/queue';
import { ResponseModality } from '~~/server/types/aistudio';
import {
  AuthenticationError,
  RateLimitError,
  NoAccountsError,
} from '~~/server/lib/browser/errors';

// ── Model Aliases ───────────────────────────────────────────────────────
const IMAGE_EDIT_MODEL_ALIASES: Record<string, string> = {
  'dall-e-2': 'gemini-2.5-flash-image',
  'gpt-image-1': 'gemini-2.5-flash-image',
};

const DEFAULT_IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image';

// ── Size → Aspect Ratio Mapping (shared with generations) ───────────────
const SIZE_TO_ASPECT_RATIO: Record<string, string> = {
  '1024x1024': '1:1', '1792x1024': '16:9', '1024x1792': '9:16',
  '512x512': '1:1', '256x256': '1:1',
  '1:1': '1:1', '3:4': '3:4', '4:3': '4:3', '9:16': '9:16', '16:9': '16:9',
  'square': '1:1', 'portrait': '9:16', 'landscape': '16:9', 'wide': '16:9', 'tall': '9:16',
};

function buildImagePrompt(prompt: string, size?: string): string {
  if (!size) return prompt;
  const aspectRatio = SIZE_TO_ASPECT_RATIO[size.toLowerCase()];
  if (!aspectRatio || aspectRatio === '1:1') return prompt;
  return `Generate this image in ${aspectRatio} aspect ratio. ${prompt}`;
}

export default defineEventHandler(async (event) => {
  const reqId = `imgedit-${crypto.randomUUID().substring(0, 8)}`;

  // Try to parse as multipart form data first, then fall back to JSON
  let prompt = '';
  let model = DEFAULT_IMAGE_EDIT_MODEL;
  let n = 1;
  let size: string | undefined;
  let imageData: string | null = null;
  let imageMimeType = 'image/png';

  const contentType = getHeader(event, 'content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await readMultipartFormData(event);
    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid multipart form data' });
    }

    for (const part of formData) {
      const name = part.name;
      if (name === 'image') {
        imageMimeType = part.type ?? 'image/png';
        imageData = part.data.toString('base64');
      } else if (name === 'prompt') {
        prompt = part.data.toString('utf-8');
      } else if (name === 'model') {
        model = part.data.toString('utf-8');
      } else if (name === 'n') {
        n = parseInt(part.data.toString('utf-8'), 10) || 1;
      } else if (name === 'size') {
        size = part.data.toString('utf-8');
      }
    }
  } else {
    // JSON body
    const body = await readBody<{
      image: string;
      prompt: string;
      model?: string;
      n?: number;
      size?: string;
    }>(event);

    prompt = body.prompt;
    model = body.model ?? DEFAULT_IMAGE_EDIT_MODEL;
    n = body.n ?? 1;
    size = body.size;

    if (body.image) {
      // Accept data URIs or raw base64
      if (body.image.startsWith('data:')) {
        const commaIdx = body.image.indexOf(',');
        if (commaIdx >= 0) {
          const header = body.image.substring(0, commaIdx);
          const mimeMatch = header.match(/^data:([^;]+)/);
          imageMimeType = mimeMatch?.[1] ?? 'image/png';
          imageData = body.image.substring(commaIdx + 1);
        }
      } else {
        imageData = body.image;
      }
    }
  }

  if (!prompt) {
    throw createError({ statusCode: 400, statusMessage: 'prompt is required' });
  }
  if (!imageData) {
    throw createError({ statusCode: 400, statusMessage: 'image is required' });
  }

  n = Math.min(Math.max(n, 1), 4);

  // Resolve model aliases
  const resolvedModel = IMAGE_EDIT_MODEL_ALIASES[model] ?? model;

  // Apply aspect ratio hint from size parameter
  const finalPrompt = buildImagePrompt(prompt, size);

  // Build request context with the image as input and IMAGE response modality
  const context: RequestContext = {
    reqId,
    model: resolvedModel,
    prompt: finalPrompt,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageData}` } },
        { type: 'text', text: finalPrompt },
      ],
    }],
    images: [{
      mimeType: imageMimeType,
      data: imageData,
    }],
    stream: false,
    temperature: 1,
    // CRITICAL: Tell the model to return images
    responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE],
  };

  try {
    const result = await enqueueRequest(context);

    // Check if we got images back
    if (!result.images || result.images.length === 0) {
      throw createError({
        statusCode: 422,
        statusMessage: result.text
          ? `Model returned text instead of edited image: ${result.text.substring(0, 200)}`
          : 'Model did not return any images. The edit prompt may have been filtered.',
      });
    }

    const images = result.images.slice(0, n);

    const response: OpenAIImagesResponse = {
      created: Math.floor(Date.now() / 1000),
      data: images.map(img => ({
        b64_json: img.data,
        revised_prompt: prompt,
      })),
    };

    setResponseHeader(event, 'X-Request-Id', reqId);
    return response;

  } catch (error) {
    // Re-throw H3 errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[ImageEdit:${reqId}] Error:`, msg);

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
