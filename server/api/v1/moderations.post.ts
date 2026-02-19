/**
 * POST /api/v1/moderations
 *
 * OpenAI-compatible content moderation endpoint.
 * Returns a stub response that always marks content as safe.
 * Many OpenAI SDKs call this automatically — we need it to not error.
 */
import type { OpenAIModerationsRequest, OpenAIModerationsResponse } from '~~/server/types/openai';

// All moderation categories from the OpenAI spec
const CATEGORIES = [
  'harassment',
  'harassment/threatening',
  'hate',
  'hate/threatening',
  'illicit',
  'illicit/violent',
  'self-harm',
  'self-harm/intent',
  'self-harm/instructions',
  'sexual',
  'sexual/minors',
  'violence',
  'violence/graphic',
] as const;

export default defineEventHandler(async (event) => {
  const body = await readBody<OpenAIModerationsRequest>(event);

  if (!body.input) {
    throw createError({ statusCode: 400, statusMessage: 'input is required' });
  }

  // Normalize input to array
  const inputs = Array.isArray(body.input) ? body.input : [body.input];

  // Build results — always unflagged (we don't do actual moderation)
  const categories: Record<string, boolean> = {};
  const categoryScores: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    categories[cat] = false;
    categoryScores[cat] = 0.0;
  }

  const response: OpenAIModerationsResponse = {
    id: `modr-${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`,
    model: body.model ?? 'text-moderation-latest',
    results: inputs.map(() => ({
      flagged: false,
      categories: { ...categories },
      category_scores: { ...categoryScores },
    })),
  };

  return response;
});
