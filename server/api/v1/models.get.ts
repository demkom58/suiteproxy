/**
 * GET /api/v1/models
 *
 * Lists available Gemini models from Google's internal API.
 * Uses callMakerSuiteRpc for authenticated access via SAPISID cookie auth.
 */
import { getGoogleApiCredentials, callMakerSuiteRpc } from '~~/server/utils/google-api';

export default defineEventHandler(async (event) => {
  const bearer = getHeader(event, 'authorization')?.replace('Bearer ', '');
  const creds = getGoogleApiCredentials(bearer);

  try {
    const response = await callMakerSuiteRpc('ListModels', [], creds);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ListModels] Upstream Error ${response.status}: ${errorText.substring(0, 300)}`);
      throw createError({ statusCode: response.status, statusMessage: 'Upstream Error' });
    }

    const rawText = await response.text();
    const jsonText = rawText.replace(/^\)]}'\n/, '');

    let data: unknown;
    try {
      data = JSON.parse(jsonText);
    } catch {
      console.error('[ListModels] JSON Parse Error');
      return { object: 'list', data: [] };
    }

    const modelsList = findModelsArray(data);

    if (modelsList.length === 0) {
      console.warn('[ListModels] No models found in response');
      return { object: 'list', data: [] };
    }

    return {
      object: 'list',
      data: modelsList.map((m: unknown[]) => {
        const fullId = String(m[0] ?? '');
        const id = fullId.split('/').pop() ?? fullId;
        const caps = getModelCapabilities(id);

        // Extract paid status from raw response:
        // field[77] === 2 → paid-only (Imagen, Veo, image-preview)
        // field[27] === null → paid-only generation models (Imagen, Veo)
        const field77 = m.length > 77 ? m[77] : undefined;
        const field27 = m[27];
        const isPaid = field77 === 2 || field27 === null;

        return {
          id,
          object: 'model',
          owned_by: 'google',
          description: String(m[3] ?? m[1] ?? `Google ${id} model`),
          ...caps,
          is_paid: isPaid,
        };
      }),
    };
  } catch (e: unknown) {
    const err = e as { statusCode?: number; message?: string };
    console.error('[ListModels] Exception:', err.message);
    throw createError({ statusCode: err.statusCode || 500 });
  }
});

// ── Model Capabilities ─────────────────────────────────────────────────

interface ModelCapabilities {
  /** Maximum context window (input tokens) */
  context_window: number;
  /** Maximum output tokens */
  max_output_tokens: number;
  /** Whether the model supports thinking/reasoning */
  supports_thinking: boolean;
  /** Type of thinking control: 'toggle_budget' | 'level' | null */
  thinking_type: 'toggle_budget' | 'level' | null;
  /** Model category for thinking configuration */
  thinking_category: string;
  /** Whether the model supports vision (image input) */
  supports_vision: boolean;
  /** Whether the model supports Google Search grounding */
  supports_search_grounding: boolean;
  /** Whether the model supports native image generation (output) */
  supports_image_generation: boolean;
  /** Whether the model supports text-to-speech */
  supports_tts: boolean;
  /** Whether the model supports audio transcription (speech-to-text) */
  supports_audio_transcription: boolean;
  /** Whether the model supports text embeddings */
  supports_embeddings: boolean;
}

function getModelCapabilities(modelId: string): ModelCapabilities {
  const m = modelId.toLowerCase();

  // Check if model supports native image generation
  // Currently: gemini-2.0-flash-exp, gemini-2.5-flash/pro with -image suffix,
  // and gemini-3 models with image capability
  const supportsImageGen = m.includes('image')
    || (m.includes('gemini-2.0') && m.includes('flash') && m.includes('exp'));

  // Check TTS support — only dedicated TTS models
  const supportsTTS = m.includes('tts');

  // Check embedding support — text-embedding models
  const supportsEmbeddings = m.includes('embedding');

  // Audio transcription — most multimodal Gemini models support audio input
  const supportsAudioTranscription = !supportsTTS && !supportsEmbeddings
    && (m.includes('gemini-2') || m.includes('gemini-3'));

  // TTS models — special case: minimal capabilities, TTS only
  if (supportsTTS) {
    return {
      context_window: 32_768,
      max_output_tokens: 8_192,
      supports_thinking: false,
      thinking_type: null,
      thinking_category: 'NON_THINKING',
      supports_vision: false,
      supports_search_grounding: false,
      supports_image_generation: false,
      supports_tts: true,
      supports_audio_transcription: false,
      supports_embeddings: false,
    };
  }

  // Embedding models — special case
  if (supportsEmbeddings) {
    return {
      context_window: 2_048,
      max_output_tokens: 0,
      supports_thinking: false,
      thinking_type: null,
      thinking_category: 'NON_THINKING',
      supports_vision: false,
      supports_search_grounding: false,
      supports_image_generation: false,
      supports_tts: false,
      supports_audio_transcription: false,
      supports_embeddings: true,
    };
  }

  // Gemini 3 Pro
  if (m.includes('gemini-3') && m.includes('pro')) {
    return {
      context_window: 1_048_576,
      max_output_tokens: 65_536,
      supports_thinking: true,
      thinking_type: 'level',
      thinking_category: 'THINKING_LEVEL_PRO',
      supports_vision: true,
      supports_search_grounding: true,
      supports_image_generation: supportsImageGen,
      supports_tts: false,
      supports_audio_transcription: supportsAudioTranscription,
      supports_embeddings: false,
    };
  }

  // Gemini 3 Flash
  if (m.includes('gemini-3') && m.includes('flash')) {
    return {
      context_window: 1_048_576,
      max_output_tokens: 65_536,
      supports_thinking: true,
      thinking_type: 'level',
      thinking_category: 'THINKING_LEVEL_FLASH',
      supports_vision: true,
      supports_search_grounding: true,
      supports_image_generation: supportsImageGen,
      supports_tts: false,
      supports_audio_transcription: supportsAudioTranscription,
      supports_embeddings: false,
    };
  }

  // Gemini 2.5 Pro
  if (m.includes('gemini-2.5') && m.includes('pro')) {
    return {
      context_window: 1_048_576,
      max_output_tokens: 65_536,
      supports_thinking: true,
      thinking_type: 'toggle_budget',
      thinking_category: 'THINKING_PRO_25',
      supports_vision: true,
      supports_search_grounding: true,
      supports_image_generation: supportsImageGen,
      supports_tts: false,
      supports_audio_transcription: supportsAudioTranscription,
      supports_embeddings: false,
    };
  }

  // Gemini 2.5 Flash
  if (m.includes('gemini-2.5') && m.includes('flash')) {
    return {
      context_window: 1_048_576,
      max_output_tokens: 65_536,
      supports_thinking: true,
      thinking_type: 'toggle_budget',
      thinking_category: 'THINKING_FLASH_25',
      supports_vision: true,
      supports_search_grounding: true,
      supports_image_generation: supportsImageGen,
      supports_tts: false,
      supports_audio_transcription: supportsAudioTranscription,
      supports_embeddings: false,
    };
  }

  // Gemini 2.0 Flash
  if (m.includes('gemini-2.0') && m.includes('flash')) {
    return {
      context_window: 1_048_576,
      max_output_tokens: 8_192,
      supports_thinking: false,
      thinking_type: null,
      thinking_category: 'NON_THINKING',
      supports_vision: true,
      supports_search_grounding: true,
      supports_image_generation: supportsImageGen,
      supports_tts: false,
      supports_audio_transcription: supportsAudioTranscription,
      supports_embeddings: false,
    };
  }

  // Gemini 1.5 Pro
  if (m.includes('gemini-1.5') && m.includes('pro')) {
    return {
      context_window: 2_097_152,
      max_output_tokens: 8_192,
      supports_thinking: false,
      thinking_type: null,
      thinking_category: 'NON_THINKING',
      supports_vision: true,
      supports_search_grounding: true,
      supports_image_generation: false,
      supports_tts: false,
      supports_audio_transcription: supportsAudioTranscription,
      supports_embeddings: false,
    };
  }

  // Gemini 1.5 Flash
  if (m.includes('gemini-1.5') && m.includes('flash')) {
    return {
      context_window: 1_048_576,
      max_output_tokens: 8_192,
      supports_thinking: false,
      thinking_type: null,
      thinking_category: 'NON_THINKING',
      supports_vision: true,
      supports_search_grounding: true,
      supports_image_generation: false,
      supports_tts: false,
      supports_audio_transcription: supportsAudioTranscription,
      supports_embeddings: false,
    };
  }

  // Default (unknown model)
  return {
    context_window: 1_048_576,
    max_output_tokens: 8_192,
    supports_thinking: false,
    thinking_type: null,
    thinking_category: 'NON_THINKING',
    supports_vision: true,
    supports_search_grounding: true,
    supports_image_generation: supportsImageGen,
    supports_tts: false,
    supports_audio_transcription: false,
    supports_embeddings: false,
  };
}

/**
 * Recursively search for the models array in the nested response structure.
 * Models array looks like: [ ["models/gemini-...", ...], ["models/...", ...] ]
 */
function findModelsArray(obj: unknown): unknown[][] {
  if (!Array.isArray(obj)) return [];

  if (
    obj.length > 0 &&
    Array.isArray(obj[0]) &&
    typeof obj[0][0] === 'string' &&
    (obj[0][0] as string).startsWith('models/')
  ) {
    return obj as unknown[][];
  }

  for (const item of obj) {
    if (Array.isArray(item)) {
      const found = findModelsArray(item);
      if (found.length > 0) return found;
    }
  }

  return [];
}
