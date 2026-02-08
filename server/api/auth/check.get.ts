/**
 * GET /api/auth/check
 *
 * Returns the current auth status without requiring authentication.
 * Used by the client-side middleware to decide whether to redirect to /login.
 *
 * Response:
 *   - { authenticated: true }  — valid session or auth disabled
 *   - { authenticated: false, auth_enabled: true } — needs login
 */
import { createSessionToken, isAuthEnabled } from '~~/server/utils/auth';

export default defineEventHandler((event) => {
  // If auth is not enabled, everyone is authenticated
  if (!isAuthEnabled()) {
    return { authenticated: true, auth_enabled: false };
  }

  const apiKey = process.env.PROXY_API_KEY!;

  // Check Bearer token
  const authorization = getRequestHeader(event, 'authorization');
  if (authorization) {
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : authorization.trim();
    if (token === apiKey) {
      return { authenticated: true, auth_enabled: true };
    }
  }

  // Check X-API-Key header
  const xApiKey = getRequestHeader(event, 'x-api-key');
  if (xApiKey && xApiKey === apiKey) {
    return { authenticated: true, auth_enabled: true };
  }

  // Check session cookie
  const sessionCookie = getCookie(event, 'sp_session');
  if (sessionCookie && sessionCookie === createSessionToken(apiKey)) {
    return { authenticated: true, auth_enabled: true };
  }

  return { authenticated: false, auth_enabled: true };
});
