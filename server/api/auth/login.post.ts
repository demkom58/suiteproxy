/**
 * POST /api/auth/login
 *
 * Validates the API key and sets an httpOnly session cookie.
 * Used by the dashboard login page and can also be used by the extension.
 *
 * Body: { key: string }
 * Response: { success: true } or 403 error
 */
import { createSessionToken, isAuthEnabled } from '~~/server/utils/auth';

export default defineEventHandler(async (event) => {
  // If auth is disabled, always succeed
  if (!isAuthEnabled()) {
    return { success: true, auth_enabled: false };
  }

  const body = await readBody<{ key?: string }>(event);
  const apiKey = process.env.PROXY_API_KEY!;

  if (!body?.key || body.key !== apiKey) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid API key',
    });
  }

  // Set session cookie (httpOnly, secure in production)
  const token = createSessionToken(apiKey);
  const isSecure = getRequestURL(event).protocol === 'https:';

  setCookie(event, 'sp_session', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
});
