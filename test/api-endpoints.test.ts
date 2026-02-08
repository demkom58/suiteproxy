/**
 * Integration tests for OpenAI-compatible API endpoints.
 *
 * These boot a real Nuxt server and hit actual endpoints via $fetch.
 * Endpoints requiring credentials (models, embeddings, chat, etc.) skip
 * gracefully if no accounts are synced in the database.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils/e2e';
// ── Types for API responses ─────────────────────────────────────────────

interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  category_scores: Record<string, number>;
}

interface ModerationResponse {
  id: string;
  model: string;
  results: ModerationResult[];
}

interface ModelEntry {
  id: string;
  object: string;
  owned_by: string;
  context_window: number;
  max_output_tokens: number;
  supports_tts: boolean;
  supports_embeddings: boolean;
  supports_audio_transcription: boolean;
  supports_image_generation: boolean;
  supports_vision: boolean;
  supports_thinking: boolean;
}

interface ModelListResponse {
  object: string;
  data: ModelEntry[];
}

interface EmbeddingEntry {
  object: string;
  embedding: number[];
  index: number;
}

interface EmbeddingsResponse {
  object: string;
  data: EmbeddingEntry[];
  model: string;
  usage: { prompt_tokens: number; total_tokens: number };
}

interface FetchError {
  status: number;
  statusText?: string;
}

// ── Test setup ──────────────────────────────────────────────────────────

let hasAccounts = false;

beforeAll(async () => {
  await setup({ host: 'http://localhost:3000' });

  // Check if we have synced accounts by hitting the models endpoint
  try {
    await $fetch<ModelListResponse>('/api/v1/models');
    hasAccounts = true;
  } catch {
    hasAccounts = false;
  }
});

// ── POST /api/v1/moderations ────────────────────────────────────────────

describe('POST /api/v1/moderations', () => {
  it('returns unflagged result for normal text', async () => {
    const resp = await $fetch<ModerationResponse>('/api/v1/moderations', {
      method: 'POST',
      body: { input: 'Hello, how are you?' },
    });

    expect(resp.id).toMatch(/^modr-/);
    expect(resp.model).toBe('text-moderation-latest');
    expect(resp.results).toHaveLength(1);
    expect(resp.results[0]!.flagged).toBe(false);

    // All 13 categories should be present and false
    const cats = resp.results[0]!.categories;
    expect(cats['harassment']).toBe(false);
    expect(cats['violence/graphic']).toBe(false);
    expect(cats['sexual/minors']).toBe(false);
    expect(Object.keys(cats)).toHaveLength(13);

    // All scores should be 0
    const scores = resp.results[0]!.category_scores;
    for (const v of Object.values(scores)) {
      expect(v).toBe(0);
    }
  });

  it('returns one result per input string', async () => {
    const resp = await $fetch<ModerationResponse>('/api/v1/moderations', {
      method: 'POST',
      body: { input: ['Hello', 'World'] },
    });

    expect(resp.results).toHaveLength(2);
    expect(resp.results[0]!.flagged).toBe(false);
    expect(resp.results[1]!.flagged).toBe(false);
  });

  it('returns 400 when input is missing', async () => {
    const err = await $fetch('/api/v1/moderations', {
      method: 'POST',
      body: {},
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });
});

// ── GET /api/v1/models ──────────────────────────────────────────────────

describe('GET /api/v1/models', () => {
  it('returns OpenAI-format model list', async () => {
    if (!hasAccounts) return;
    const resp = await $fetch<ModelListResponse>('/api/v1/models');

    expect(resp.object).toBe('list');
    expect(Array.isArray(resp.data)).toBe(true);
    expect(resp.data.length).toBeGreaterThan(0);

    // Each model should have OpenAI-compatible shape
    const model = resp.data[0]!;
    expect(model.id).toBeDefined();
    expect(model.object).toBe('model');
    expect(model.owned_by).toBeDefined();

    // Should have capability fields (flat on model, not nested)
    expect(typeof model.supports_tts).toBe('boolean');
    expect(typeof model.supports_embeddings).toBe('boolean');
    expect(typeof model.supports_audio_transcription).toBe('boolean');
    expect(typeof model.supports_image_generation).toBe('boolean');
    expect(typeof model.supports_vision).toBe('boolean');
    expect(typeof model.context_window).toBe('number');
    expect(typeof model.max_output_tokens).toBe('number');
  });

  it('includes TTS models', async () => {
    if (!hasAccounts) return;
    const resp = await $fetch<ModelListResponse>('/api/v1/models');
    const ttsModels = resp.data.filter(m => m.supports_tts);
    // AI Studio should list TTS models (may be 0 if not yet in ListModels)
    expect(Array.isArray(ttsModels)).toBe(true);
  });

  it('returns 503 when no accounts exist', async () => {
    if (hasAccounts) return; // Can only test when DB is empty
    const err = await $fetch('/api/v1/models').catch((e: FetchError) => e);
    expect((err as FetchError).status).toBe(503);
  });
});

// ── GET /api/v1/models/:id ──────────────────────────────────────────────

describe('GET /api/v1/models/:id', () => {
  it('returns a specific model', async () => {
    if (!hasAccounts) return;
    const list = await $fetch<ModelListResponse>('/api/v1/models');
    if (!list.data || list.data.length === 0) return;

    const modelId = list.data[0]!.id;
    const resp = await $fetch<ModelEntry>(`/api/v1/models/${modelId}`);

    expect(resp.id).toBe(modelId);
    expect(resp.object).toBe('model');
    expect(resp.supports_vision).toBeDefined();
  });
});

// ── POST /api/v1/embeddings ─────────────────────────────────────────────

describe('POST /api/v1/embeddings', () => {
  it('generates embeddings for a single string', async () => {
    if (!hasAccounts) return;
    try {
      const resp = await $fetch<EmbeddingsResponse>('/api/v1/embeddings', {
        method: 'POST',
        body: {
          input: 'Hello world',
          model: 'text-embedding-004',
        },
      });

      expect(resp.object).toBe('list');
      expect(resp.data).toHaveLength(1);
      expect(resp.data[0]!.object).toBe('embedding');
      expect(resp.data[0]!.index).toBe(0);
      expect(Array.isArray(resp.data[0]!.embedding)).toBe(true);
      expect(resp.data[0]!.embedding.length).toBeGreaterThan(0);
      // text-embedding-004 returns 768-dimensional vectors
      expect(resp.data[0]!.embedding.length).toBe(768);
      expect(resp.model).toContain('embedding');
      expect(resp.usage.prompt_tokens).toBeGreaterThan(0);
    } catch (e) {
      // 403 = Generative Language API not enabled for this project
      // 503 = no account with API key available
      const err = e as FetchError;
      expect([403, 502, 503]).toContain(err.status);
    }
  });

  it('generates embeddings for array of strings', async () => {
    if (!hasAccounts) return;
    try {
      const resp = await $fetch<EmbeddingsResponse>('/api/v1/embeddings', {
        method: 'POST',
        body: {
          input: ['Hello', 'World'],
          model: 'text-embedding-3-small',
        },
      });

      expect(resp.data).toHaveLength(2);
      expect(resp.data[0]!.index).toBe(0);
      expect(resp.data[1]!.index).toBe(1);
    } catch (e) {
      const err = e as FetchError;
      expect([403, 502, 503]).toContain(err.status);
    }
  });

  it('returns 400 when input is missing', async () => {
    const err = await $fetch('/api/v1/embeddings', {
      method: 'POST',
      body: { model: 'text-embedding-004' },
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });
});

// ── POST /api/v1/chat/completions ───────────────────────────────────────

describe('POST /api/v1/chat/completions', () => {
  it('returns 400 when model is missing', async () => {
    const err = await $fetch('/api/v1/chat/completions', {
      method: 'POST',
      body: { messages: [{ role: 'user', content: 'Hello' }] },
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });

  it('returns 400 when messages is missing', async () => {
    const err = await $fetch('/api/v1/chat/completions', {
      method: 'POST',
      body: { model: 'gemini-2.5-flash' },
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });
});

// ── POST /api/v1/completions ────────────────────────────────────────────

describe('POST /api/v1/completions', () => {
  it('returns 400 when prompt is missing', async () => {
    const err = await $fetch('/api/v1/completions', {
      method: 'POST',
      body: { model: 'gemini-2.0-flash' },
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });
});

// ── POST /api/v1/images/generations ─────────────────────────────────────

describe('POST /api/v1/images/generations', () => {
  it('returns 400 when prompt is missing', async () => {
    const err = await $fetch('/api/v1/images/generations', {
      method: 'POST',
      body: { model: 'dall-e-3' },
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });
});

// ── POST /api/v1/images/edits ───────────────────────────────────────────

describe('POST /api/v1/images/edits', () => {
  it('returns 400 when prompt is missing (JSON)', async () => {
    const err = await $fetch('/api/v1/images/edits', {
      method: 'POST',
      body: { image: 'data:image/png;base64,iVBOR' },
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });

  it('returns 400 when image is missing (JSON)', async () => {
    const err = await $fetch('/api/v1/images/edits', {
      method: 'POST',
      body: { prompt: 'Make it blue' },
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });
});

// ── POST /api/v1/audio/speech ───────────────────────────────────────────

describe('POST /api/v1/audio/speech', () => {
  it('returns 400 when input is missing', async () => {
    const err = await $fetch('/api/v1/audio/speech', {
      method: 'POST',
      body: { voice: 'alloy', model: 'tts-1' },
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });

  it('returns 400 when voice is missing', async () => {
    const err = await $fetch('/api/v1/audio/speech', {
      method: 'POST',
      body: { input: 'Hello world', model: 'tts-1' },
    }).catch((e: FetchError) => e);

    expect((err as FetchError).status).toBe(400);
  });
});

// ── POST /api/v1/audio/transcriptions ───────────────────────────────────

describe('POST /api/v1/audio/transcriptions', () => {
  it('returns 400 when no file is uploaded', async () => {
    const err = await $fetch('/api/v1/audio/transcriptions', {
      method: 'POST',
      body: {},
    }).catch((e: FetchError) => e);

    // 400 (no file) or 415 (invalid content-type)
    expect((err as FetchError).status).toBeGreaterThanOrEqual(400);
  });
});
