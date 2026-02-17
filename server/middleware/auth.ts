/**
 * API Key authentication middleware.
 *
 * Protects /api/v1/* endpoints with Bearer token authentication.
 * The API key is configured via PROXY_API_KEY environment variable.
 *
 * If PROXY_API_KEY is not set, authentication is disabled (open access).
 * Dashboard and account management endpoints are NOT protected.
 */
export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;

  // Only protect /api/v1/* endpoints (chat completions, models, queue)
  if (!path.startsWith('/api/v1/')) return;

  const apiKey = process.env.PROXY_API_KEY;

  // If no API key configured, skip auth (open access mode)
  if (!apiKey) return;

  const authorization = getRequestHeader(event, 'authorization');

  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing Authorization header. Use: Authorization: Bearer <your-api-key>',
    });
  }

  // Support both "Bearer <key>" and raw "<key>" formats
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : authorization.trim();

  if (token !== apiKey) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid API key',
    });
  }
});
