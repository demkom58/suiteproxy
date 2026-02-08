/**
 * Unified authentication middleware.
 *
 * Protects ALL /api/* endpoints (except allowlisted paths) using PROXY_API_KEY.
 * Supports three auth methods (checked in order):
 *   1. Bearer token header  — `Authorization: Bearer <key>` (API clients, extension)
 *   2. X-API-Key header     — `X-API-Key: <key>` (extension, simple clients)
 *   3. Session cookie        — `sp_session=<hmac>` (dashboard browser sessions)
 *
 * If PROXY_API_KEY is not set, authentication is disabled (open access).
 *
 * Allowlisted paths (never require auth):
 *   - /api/health           — monitoring / uptime checks
 *   - /api/auth/*           — login/logout/check endpoints
 */
import { createSessionToken } from '~~/server/utils/auth';

const PUBLIC_PATHS = [
  '/api/health',
  '/api/auth/',
  '/api/script/',      // Tampermonkey userscript (no secrets)
];

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;

  // Only protect /api/* routes
  if (!path.startsWith('/api/')) return;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => path.startsWith(p) || path === p.replace(/\/$/, ''))) return;

  // CORS preflight requests never carry auth — always allow
  if (event.method === 'OPTIONS') return;

  const apiKey = process.env.PROXY_API_KEY;

  // If no API key configured, skip auth (open access mode)
  if (!apiKey) return;

  // Method 1: Bearer token
  const authorization = getRequestHeader(event, 'authorization');
  if (authorization) {
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : authorization.trim();
    if (token === apiKey) return;
  }

  // Method 2: X-API-Key header
  const xApiKey = getRequestHeader(event, 'x-api-key');
  if (xApiKey && xApiKey === apiKey) return;

  // Method 3: Session cookie
  const sessionCookie = getCookie(event, 'sp_session');
  if (sessionCookie && sessionCookie === createSessionToken(apiKey)) return;

  throw createError({
    statusCode: 401,
    statusMessage: 'Authentication required',
  });
});
