/**
 * POST /api/auth/logout
 *
 * Clears the session cookie.
 */
export default defineEventHandler((event) => {
  deleteCookie(event, 'sp_session', { path: '/' });
  return { success: true };
});
