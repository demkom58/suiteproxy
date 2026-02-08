/**
 * Global client-side auth guard.
 *
 * On every navigation, checks /api/auth/check to see if the user is authenticated.
 * If not, redirects to /login. The login page itself is excluded.
 *
 * This runs only on the client side — server-side API protection is handled
 * by the server middleware.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Don't guard the login page itself
  if (to.path === '/login') return;

  // Only run on client side
  if (import.meta.server) return;

  try {
    const { authenticated } = await $fetch<{ authenticated: boolean; auth_enabled: boolean }>('/api/auth/check');
    if (!authenticated) {
      return navigateTo('/login');
    }
  } catch {
    // If check fails (network error), let it through — server middleware will catch it
  }
});
