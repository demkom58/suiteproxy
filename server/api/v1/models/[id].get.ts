/**
 * GET /api/v1/models/:id
 *
 * Retrieve a specific model by ID.
 * Many SDKs call this endpoint to validate that a model exists before using it.
 *
 * Proxies the request to the models list endpoint and filters by ID.
 */
import { getErrorMessage } from '~~/server/utils/helpers';

export default defineEventHandler(async (event) => {
  const modelId = getRouterParam(event, 'id');

  if (!modelId) {
    throw createError({ statusCode: 400, statusMessage: 'Model ID is required' });
  }

  // Fetch the full models list using the same logic as /v1/models
  // We call our own endpoint internally to avoid duplicating the RPC logic
  try {
    const modelsResponse = await $fetch<{ object: string; data: Array<{ id: string; object: string; owned_by: string; [key: string]: unknown }> }>('/api/v1/models', {
      headers: {
        // Forward the authorization header if present
        ...(getHeader(event, 'authorization')
          ? { authorization: getHeader(event, 'authorization')! }
          : {}),
      },
    });

    const model = modelsResponse.data.find(
      m => m.id === modelId || m.id === `models/${modelId}`,
    );

    if (!model) {
      throw createError({
        statusCode: 404,
        statusMessage: `Model '${modelId}' not found`,
      });
    }

    return model;
  } catch (error) {
    // Re-throw H3 errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }

    const msg = getErrorMessage(error);
    console.error(`[ModelGet] Error fetching model ${modelId}:`, msg);
    throw createError({ statusCode: 502, statusMessage: msg });
  }
});
