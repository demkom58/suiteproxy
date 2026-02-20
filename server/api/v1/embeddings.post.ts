/**
 * POST /api/v1/embeddings
 *
 * OpenAI-compatible embeddings endpoint.
 * Uses the Gemini REST API with SAPISID cookie auth (NOT api_key)
 * to call embedContent/batchEmbedContents.
 *
 * CRITICAL: The api_key from AI Studio belongs to Google's internal project
 * (project 823511539352). Calling generativelanguage.googleapis.com with it
 * returns 403 "API not enabled". We bypass this by using SAPISID cookie auth
 * from the user's Google session, which authenticates as the user — not the project.
 */
import type { OpenAIEmbeddingsRequest, OpenAIEmbeddingsResponse } from '~~/server/types/openai';
import { getGoogleApiCredentials, callGeminiRestApi, type GoogleApiCredentials } from '~~/server/utils/google-api';
import { getErrorMessage } from '~~/server/utils/helpers';

// ── Model Aliases ───────────────────────────────────────────────────────
const MODEL_ALIASES: Record<string, string> = {
  'text-embedding-ada-002': 'text-embedding-004',
  'text-embedding-3-small': 'text-embedding-004',
  'text-embedding-3-large': 'text-embedding-004',
};

const DEFAULT_EMBEDDING_MODEL = 'text-embedding-004';

export default defineEventHandler(async (event) => {
  const body = await readBody<OpenAIEmbeddingsRequest>(event);

  if (!body.input) {
    throw createError({ statusCode: 400, statusMessage: 'input is required' });
  }
  if (!body.model) {
    throw createError({ statusCode: 400, statusMessage: 'model is required' });
  }

  // Normalize input to array
  const inputs = Array.isArray(body.input) ? body.input : [body.input];
  if (inputs.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'input must not be empty' });
  }

  // Resolve model alias
  const resolvedModel = MODEL_ALIASES[body.model] ?? body.model;
  const modelPath = resolvedModel.startsWith('models/')
    ? resolvedModel
    : `models/${resolvedModel}`;

  // Get authenticated credentials (SAPISID cookie auth)
  const bearer = getHeader(event, 'authorization')?.replace('Bearer ', '');
  const creds = getGoogleApiCredentials(bearer);

  try {
    if (inputs.length === 1) {
      // Single embedding
      const embedding = await callEmbedContent(creds, modelPath, inputs[0]!);
      const response: OpenAIEmbeddingsResponse = {
        object: 'list',
        data: [{
          object: 'embedding',
          embedding,
          index: 0,
        }],
        model: resolvedModel,
        usage: {
          prompt_tokens: estimateTokens(inputs[0]!),
          total_tokens: estimateTokens(inputs[0]!),
        },
      };
      return response;
    }

    // Batch embed
    const embeddings = await callBatchEmbedContents(creds, modelPath, inputs);
    let totalTokens = 0;
    const response: OpenAIEmbeddingsResponse = {
      object: 'list',
      data: embeddings.map((emb, i) => {
        totalTokens += estimateTokens(inputs[i] ?? '');
        return {
          object: 'embedding' as const,
          embedding: emb,
          index: i,
        };
      }),
      model: resolvedModel,
      usage: {
        prompt_tokens: totalTokens,
        total_tokens: totalTokens,
      },
    };
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    const msg = getErrorMessage(error);
    console.error(`[Embeddings] Error:`, msg);
    throw createError({ statusCode: 502, statusMessage: msg });
  }
});

// ── Google AI Embedding API (SAPISID auth) ──────────────────────────────

async function callEmbedContent(
  creds: GoogleApiCredentials,
  model: string,
  text: string,
): Promise<number[]> {
  const resp = await callGeminiRestApi(`${model}:embedContent`, {
    model,
    content: { parts: [{ text }] },
  }, creds);

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`[Embeddings] API error ${resp.status}: ${errText.substring(0, 300)}`);
    throw new Error(`Embedding API error ${resp.status}: ${errText.substring(0, 200)}`);
  }

  const data = await resp.json() as { embedding?: { values?: number[] } };
  if (!data.embedding?.values) {
    throw new Error('Embedding API returned no values');
  }
  return data.embedding.values;
}

async function callBatchEmbedContents(
  creds: GoogleApiCredentials,
  model: string,
  texts: string[],
): Promise<number[][]> {
  const resp = await callGeminiRestApi(`${model}:batchEmbedContents`, {
    requests: texts.map(text => ({
      model,
      content: { parts: [{ text }] },
    })),
  }, creds);

  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`[Embeddings] Batch API error ${resp.status}: ${errText.substring(0, 300)}`);
    throw new Error(`Batch embedding API error ${resp.status}: ${errText.substring(0, 200)}`);
  }

  const data = await resp.json() as { embeddings?: Array<{ values?: number[] }> };
  if (!data.embeddings) {
    throw new Error('Batch embedding API returned no embeddings');
  }
  return data.embeddings.map(e => e.values ?? []);
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
