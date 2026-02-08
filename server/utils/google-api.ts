/**
 * Google API Client — makes authenticated calls to Google APIs using SAPISID auth.
 *
 * This module provides a way to call Google APIs (both MakerSuiteService RPC and
 * the generativelanguage.googleapis.com REST API) using cookie/SAPISID authentication
 * instead of API keys.
 *
 * CRITICAL: The api_key stored in account credentials belongs to Google's internal
 * AI Studio project (823511539352), NOT the user's project. The REST API at
 * generativelanguage.googleapis.com returns 403 when called with that key.
 * But it works fine with SAPISID cookie auth from the user's Google session.
 */
import { useDb, generateTripleHash, getSapiFromCookie } from './suite';
import type { AccountRecord, SuitemakerCreds, ProxyConfig, ProxyEntry } from '~~/shared/types';

export interface GoogleApiCredentials {
  cookie: string;
  sapisid: string;
  apiKey: string;
  authUser: string;
  userAgent: string;
  /** Proxy URL for fetch() calls (e.g. "http://user:pass@host:port"). Null = direct. */
  proxyUrl: string | null;
}

/**
 * Get credentials for making authenticated Google API calls.
 * Picks the least-recently-used, non-rate-limited account.
 *
 * @param bearer - Optional: specific account ID to use
 */
export function getGoogleApiCredentials(bearer?: string): GoogleApiCredentials {
  const db = useDb();

  const accRow = (bearer
    ? db.query('SELECT * FROM accounts WHERE id = ?').get(bearer)
    : db.query('SELECT * FROM accounts WHERE limited_until < ? ORDER BY last_sync ASC LIMIT 1').get(Date.now())
  ) as AccountRecord | undefined;

  if (!accRow) {
    throw createError({ statusCode: 503, statusMessage: 'No available accounts' });
  }

  const creds: SuitemakerCreds = JSON.parse(accRow.creds);
  const sapisid = getSapiFromCookie(creds.cookie);

  if (!sapisid) {
    throw createError({ statusCode: 401, statusMessage: 'Session Expired (No SAPISID)' });
  }

  // Parse proxy config and select a proxy for API calls
  const proxyUrl = resolveProxyUrl(accRow.proxy);

  return {
    cookie: creds.cookie,
    sapisid,
    apiKey: creds.api_key,
    authUser: creds.authUser || '0',
    userAgent: creds.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
    proxyUrl,
  };
}

// ── Proxy Helpers ───────────────────────────────────────────────────────

/**
 * Select a proxy from the chain based on rotation strategy.
 * Mirrors the logic in browser/index.ts for consistency.
 */
function selectProxy(proxyConfig: ProxyConfig): ProxyEntry | null {
  if (!proxyConfig.enabled || !proxyConfig.chain?.length) return null;

  const rotation = proxyConfig.rotation ?? 'none';
  if (rotation === 'random') {
    return proxyConfig.chain[Math.floor(Math.random() * proxyConfig.chain.length)]!;
  }
  if (rotation === 'round-robin') {
    const idx = (globalThis._proxyRoundRobinIdx ?? 0) % proxyConfig.chain.length;
    globalThis._proxyRoundRobinIdx = idx + 1;
    return proxyConfig.chain[idx]!;
  }
  return proxyConfig.chain[0]!; // 'none' — use first
}

/**
 * Convert a ProxyEntry to a URL string for Bun's native fetch `proxy` option.
 * Format: "protocol://[user:pass@]host:port"
 */
function proxyEntryToUrl(entry: ProxyEntry): string {
  const auth = entry.username
    ? `${encodeURIComponent(entry.username)}${entry.password ? ':' + encodeURIComponent(entry.password) : ''}@`
    : '';
  return `${entry.protocol}://${auth}${entry.host}:${entry.port}`;
}

/**
 * Parse the account's proxy JSON column and resolve to a proxy URL for fetch().
 * Returns null if proxy is disabled or empty.
 */
function resolveProxyUrl(proxyJson: string | null): string | null {
  if (!proxyJson) return null;

  try {
    const config = JSON.parse(proxyJson) as ProxyConfig;
    const entry = selectProxy(config);
    if (!entry) return null;

    const url = proxyEntryToUrl(entry);
    console.log(`[GoogleAPI] Using proxy: ${entry.protocol}://${entry.host}:${entry.port}`);
    return url;
  } catch {
    return null;
  }
}

/**
 * Build authenticated headers for Google API calls.
 * Uses SAPISID hash auth (same as AI Studio browser session).
 */
export async function buildGoogleApiHeaders(creds: GoogleApiCredentials): Promise<Record<string, string>> {
  const authHash = await generateTripleHash(creds.sapisid);

  return {
    'Authorization': authHash,
    'X-Goog-Api-Key': creds.apiKey,
    'X-Goog-AuthUser': creds.authUser,
    'Content-Type': 'application/json',
    'Origin': 'https://aistudio.google.com',
    'Referer': 'https://aistudio.google.com/',
    'User-Agent': creds.userAgent,
    'Cookie': creds.cookie,
  };
}

/**
 * Fetch with authUser retry — retries with authUser=0 if the stored authUser returns 401/403.
 * Shared implementation for both MakerSuiteRpc and Gemini REST API calls.
 *
 * Uses Bun's native `proxy` option in fetch() to route through account's configured proxy.
 */
async function fetchWithAuthRetry(
  url: string,
  body: unknown,
  creds: GoogleApiCredentials,
  buildHeaders: (c: GoogleApiCredentials) => Promise<Record<string, string>>,
  label: string,
): Promise<Response> {
  const headers = await buildHeaders(creds);

  // Bun-native proxy support: pass proxy URL directly to fetch()
  const fetchOpts: RequestInit & { proxy?: string } = {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  };
  if (creds.proxyUrl) {
    fetchOpts.proxy = creds.proxyUrl;
  }

  const response = await fetch(url, fetchOpts);

  if ((response.status === 401 || response.status === 403) && creds.authUser !== '0') {
    console.warn(`[${label}] AuthUser ${creds.authUser} failed (${response.status}). Retrying with 0...`);
    const retryHeaders = await buildHeaders({ ...creds, authUser: '0' });
    const retryOpts: RequestInit & { proxy?: string } = {
      method: 'POST',
      headers: retryHeaders,
      body: JSON.stringify(body),
    };
    if (creds.proxyUrl) {
      retryOpts.proxy = creds.proxyUrl;
    }
    return fetch(url, retryOpts);
  }

  return response;
}

/**
 * Call a MakerSuiteService RPC endpoint with SAPISID auth.
 */
export async function callMakerSuiteRpc(
  endpoint: string,
  body: unknown,
  creds: GoogleApiCredentials,
): Promise<Response> {
  const url = `https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/${endpoint}`;

  return fetchWithAuthRetry(url, body, creds, async (c) => {
    const headers = await buildGoogleApiHeaders(c);
    headers['X-User-Agent'] = 'grpc-web-javascript/0.1';
    headers['X-Goog-Ext-519733851-bin'] = 'CAASA1JVQRgBMAE4BEAA';
    headers['Content-Type'] = 'application/json+protobuf';
    return headers;
  }, 'MakerSuiteRPC');
}

/**
 * Call the Gemini REST API (generativelanguage.googleapis.com) with SAPISID auth.
 * This bypasses the "API not enabled" 403 error since it authenticates as the user's
 * Google session, not as the AI Studio project.
 */
export async function callGeminiRestApi(
  path: string,
  body: unknown,
  creds: GoogleApiCredentials,
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/${path}`;
  return fetchWithAuthRetry(url, body, creds, buildGoogleApiHeaders, 'GoogleAPI');
}
