/**
 * GET /api/v1/models
 *
 * Lists available Gemini models from Google's internal API.
 * This endpoint uses direct API calls (no BotGuard needed for ListModels).
 */
import { useDb, generateTripleHash, getSapiFromCookie } from '~~/server/utils/suite';
import type { AccountRecord, SuitemakerCreds } from '~~/shared/types';

export default defineEventHandler(async (event) => {
  const db = useDb();

  const bearer = getHeader(event, 'authorization')?.replace('Bearer ', '');
  const accRow = (bearer
    ? db.query('SELECT * FROM accounts WHERE id = ?').get(bearer)
    : db.query('SELECT * FROM accounts ORDER BY last_sync DESC LIMIT 1').get()
  ) as AccountRecord | undefined;

  if (!accRow) {
    throw createError({ statusCode: 503, statusMessage: 'No accounts connected' });
  }

  const creds: SuitemakerCreds = JSON.parse(accRow.creds);
  const sapisid = getSapiFromCookie(creds.cookie);

  if (!sapisid) {
    throw createError({ statusCode: 401, statusMessage: 'Session Expired (No SAPISID)' });
  }

  const userAgent = creds.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0';
  const url = 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/ListModels';
  const authHash = await generateTripleHash(sapisid);

  const doFetch = async (authUser: string) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHash,
        'X-Goog-Api-Key': creds.api_key,
        'X-Goog-AuthUser': authUser,
        'X-User-Agent': 'grpc-web-javascript/0.1',
        'X-Goog-Ext-519733851-bin': 'CAASA1JVQRgBMAE4BEAA',
        'Content-Type': 'application/json+protobuf',
        'Origin': 'https://aistudio.google.com',
        'Referer': 'https://aistudio.google.com/',
        'User-Agent': userAgent,
        'Cookie': creds.cookie,
      },
      body: '[]',
    });
  };

  try {
    // Try with stored authUser, fallback to "0"
    let response = await doFetch(creds.authUser || '0');

    if ((response.status === 401 || response.status === 403) && creds.authUser !== '0') {
      console.warn(`[ListModels] AuthUser ${creds.authUser} failed. Retrying with 0...`);
      response = await doFetch('0');
    }

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
        return {
          id,
          object: 'model',
          owned_by: 'google',
          description: String(m[3] ?? m[1] ?? `Google ${id} model`),
          ...caps,
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
}

function getModelCapabilities(modelId: string): ModelCapabilities {
  const m = modelId.toLowerCase();

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
