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
import type { AccountRecord, SuitemakerCreds } from '~~/shared/types';

export interface GoogleApiCredentials {
  cookie: string;
  sapisid: string;
  apiKey: string;
  authUser: string;
  userAgent: string;
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

  return {
    cookie: creds.cookie,
    sapisid,
    apiKey: creds.api_key,
    authUser: creds.authUser || '0',
    userAgent: creds.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
  };
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
 * Call a MakerSuiteService RPC endpoint with SAPISID auth.
 */
export async function callMakerSuiteRpc(
  endpoint: string,
  body: unknown,
  creds: GoogleApiCredentials,
): Promise<Response> {
  const url = `https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/${endpoint}`;
  const headers = await buildGoogleApiHeaders(creds);
  headers['X-User-Agent'] = 'grpc-web-javascript/0.1';
  headers['X-Goog-Ext-519733851-bin'] = 'CAASA1JVQRgBMAE4BEAA';
  headers['Content-Type'] = 'application/json+protobuf';

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  // Retry with authUser=0 if auth fails
  if ((response.status === 401 || response.status === 403) && creds.authUser !== '0') {
    console.warn(`[MakerSuiteRPC] AuthUser ${creds.authUser} failed (${response.status}). Retrying with 0...`);
    const retryCreds = { ...creds, authUser: '0' };
    const retryHeaders = await buildGoogleApiHeaders(retryCreds);
    retryHeaders['X-User-Agent'] = 'grpc-web-javascript/0.1';
    retryHeaders['X-Goog-Ext-519733851-bin'] = 'CAASA1JVQRgBMAE4BEAA';
    retryHeaders['Content-Type'] = 'application/json+protobuf';

    return fetch(url, {
      method: 'POST',
      headers: retryHeaders,
      body: JSON.stringify(body),
    });
  }

  return response;
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
  const headers = await buildGoogleApiHeaders(creds);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  // Retry with authUser=0 if auth fails
  if ((response.status === 401 || response.status === 403) && creds.authUser !== '0') {
    console.warn(`[GoogleAPI] AuthUser ${creds.authUser} failed (${response.status}). Retrying with 0...`);
    const retryCreds = { ...creds, authUser: '0' };
    const retryHeaders = await buildGoogleApiHeaders(retryCreds);

    return fetch(url, {
      method: 'POST',
      headers: retryHeaders,
      body: JSON.stringify(body),
    });
  }

  return response;
}
