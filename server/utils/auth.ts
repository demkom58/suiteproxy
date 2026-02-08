/**
 * Auth utilities for session token creation and validation.
 *
 * Uses HMAC-SHA256 to derive a session token from the API key.
 * Stateless — no database or server-side session storage needed.
 */
import { createHmac } from 'node:crypto';

const SESSION_SALT = 'suiteproxy-session-v1';

/**
 * Create a deterministic session token from the API key.
 * This token is stored as an httpOnly cookie for dashboard sessions.
 */
export function createSessionToken(apiKey: string): string {
  return createHmac('sha256', SESSION_SALT)
    .update(apiKey)
    .digest('hex');
}

/**
 * Check if auth is enabled (PROXY_API_KEY is set).
 */
export function isAuthEnabled(): boolean {
  return !!process.env.PROXY_API_KEY;
}
