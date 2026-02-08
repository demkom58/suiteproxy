/**
 * Drive Uploader — uploads images to Google Drive for AI Studio consumption.
 *
 * AI Studio doesn't embed images inline in GenerateContent requests.
 * Instead, it uploads them to Google Drive and references them by file ID
 * at part position [5] in the request body: [null, null, null, null, null, ["fileId"]]
 *
 * AUTHENTICATION:
 * The Drive API at content.googleapis.com requires an OAuth2 Bearer token.
 * - API keys alone don't work — Google rejects them with HTTP 401
 * - SAPISIDHASH doesn't work — it's only for alkalimakersuite-pa.clients6.google.com
 * - Cookies alone don't work — Drive API needs explicit Bearer tokens
 *
 * To obtain the Bearer token, we call MakerSuiteService's GenerateAccessToken
 * RPC from the SERVER (Node.js) with SAPISIDHASH + API key auth, exactly like
 * AI Studio's Angular framework does from the browser. The request body is
 * '["users/me"]' and the response is '["ya29.a0ATko..."]'.
 *
 * Once we have the Bearer token, we pass it into page.evaluate() for the actual
 * Drive upload (which also includes the API key in the URL, matching AI Studio).
 *
 * This module:
 * 1. Calls GenerateAccessToken RPC from Node.js to get an OAuth2 token
 * 2. Passes the token into page.evaluate() for Drive API calls
 * 3. Uploads base64 image data via the v3 multipart upload API
 * 4. Returns the file ID for embedding in PromptContent.fileId
 * 5. Provides cleanup via in-browser delete after the request completes
 */

import type { Page } from 'playwright-core';
import { generateTripleHash, getSapiFromCookie } from '~~/server/utils/suite';

const DRIVE_UPLOAD_URL = 'https://content.googleapis.com/upload/drive/v3/files';
const DRIVE_FILES_URL = 'https://content.googleapis.com/drive/v3/files';
const MAKERSUITE_RPC_BASE = 'https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService';
const GENERATE_ACCESS_TOKEN_URL = `${MAKERSUITE_RPC_BASE}/GenerateAccessToken`;
const GET_APP_FOLDER_URL = `${MAKERSUITE_RPC_BASE}/GetAppFolder`;
const API_KEY = 'AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs';

// ── OAuth2 Token Cache ──────────────────────────────────────────────────

/** Cached OAuth2 access token with expiry */
let cachedToken: { token: string; expiresAt: number } | null = null;

/** Cached app folder ID (per-account, rarely changes) */
let cachedAppFolder: { folderId: string; accountKey: string } | null = null;

/** Account credentials needed for the GenerateAccessToken RPC */
export interface DriveAuthCredentials {
  cookie: string;
  apiKey: string;
  authUser?: string;
  userAgent?: string;
}

/**
 * Get a valid OAuth2 access token for Drive API calls.
 * Makes a server-side (Node.js) fetch to the GenerateAccessToken RPC
 * with proper SAPISIDHASH + API key authentication.
 * Caches the token and refreshes it when expired (with 60s buffer).
 */
async function getAccessToken(creds: DriveAuthCredentials, reqId: string): Promise<string> {
  // Return cached token if still valid (60s buffer before expiry)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  console.log(`[DriveUploader:${reqId}] Fetching OAuth2 token via GenerateAccessToken RPC...`);

  const sapisid = getSapiFromCookie(creds.cookie);
  if (!sapisid) {
    throw new Error(`[DriveUploader:${reqId}] Cannot get access token: no SAPISID in cookies`);
  }

  const authHash = await generateTripleHash(sapisid);
  const authUser = creds.authUser || '0';
  const userAgent = creds.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0';

  const response = await fetch(GENERATE_ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': authHash,
      'X-Goog-Api-Key': creds.apiKey,
      'X-Goog-AuthUser': authUser,
      'X-User-Agent': 'grpc-web-javascript/0.1',
      'Content-Type': 'application/json+protobuf',
      'Origin': 'https://aistudio.google.com',
      'Referer': 'https://aistudio.google.com/',
      'User-Agent': userAgent,
      'Cookie': creds.cookie,
    },
    body: '["users/me"]',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown');
    throw new Error(`[DriveUploader:${reqId}] GenerateAccessToken failed: HTTP ${response.status} — ${errorText.substring(0, 300)}`);
  }

  const rawText = await response.text();
  // Strip the XSSI protection prefix if present
  const cleanText = rawText.replace(/^\)]}'\n/, '');

  // Response format: ["ya29.a0ATko..."] — single-element array with the token
  const token = extractAccessToken(cleanText);
  if (!token) {
    throw new Error(`[DriveUploader:${reqId}] Could not extract token from RPC response: ${cleanText.substring(0, 200)}`);
  }

  // Cache for 55 minutes (tokens typically last 1 hour)
  cachedToken = { token, expiresAt: Date.now() + 55 * 60 * 1000 };
  console.log(`[DriveUploader:${reqId}] OAuth2 token obtained (cached for 55min)`);

  return token;
}

/**
 * Extract the access token from the GenerateAccessToken RPC response.
 * Response is '["ya29.a0ATko..."]' — a single-element protobuf-JSON array.
 */
function extractAccessToken(body: string): string | null {
  try {
    const data = JSON.parse(body);
    if (Array.isArray(data) && typeof data[0] === 'string' && data[0].length > 20) {
      return data[0];
    }
    // Fallback: recurse to find any long string
    return findTokenInArray(data);
  } catch {
    return null;
  }
}

/** Recursively search a nested array for a string that looks like an access token */
function findTokenInArray(arr: unknown): string | null {
  if (typeof arr === 'string' && arr.length > 50) {
    return arr;
  }
  if (Array.isArray(arr)) {
    for (const item of arr) {
      const found = findTokenInArray(item);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get the AI Studio app folder ID in Google Drive.
 * AI Studio uploads images to a specific app folder, not the root.
 * Without this, uploaded files aren't accessible to GenerateContent.
 */
async function getAppFolderId(creds: DriveAuthCredentials, reqId: string): Promise<string> {
  // Return cached folder if same account
  const accountKey = creds.cookie.substring(0, 50); // Rough account identifier
  if (cachedAppFolder && cachedAppFolder.accountKey === accountKey) {
    return cachedAppFolder.folderId;
  }

  console.log(`[DriveUploader:${reqId}] Fetching app folder ID via GetAppFolder RPC...`);

  const sapisid = getSapiFromCookie(creds.cookie);
  if (!sapisid) {
    throw new Error(`[DriveUploader:${reqId}] Cannot get app folder: no SAPISID in cookies`);
  }

  const authHash = await generateTripleHash(sapisid);
  const authUser = creds.authUser || '0';
  const userAgent = creds.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0';

  const response = await fetch(GET_APP_FOLDER_URL, {
    method: 'POST',
    headers: {
      'Authorization': authHash,
      'X-Goog-Api-Key': creds.apiKey,
      'X-Goog-AuthUser': authUser,
      'X-User-Agent': 'grpc-web-javascript/0.1',
      'Content-Type': 'application/json+protobuf',
      'Origin': 'https://aistudio.google.com',
      'Referer': 'https://aistudio.google.com/',
      'User-Agent': userAgent,
      'Cookie': creds.cookie,
    },
    body: '[]',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'unknown');
    throw new Error(`[DriveUploader:${reqId}] GetAppFolder failed: HTTP ${response.status} — ${errorText.substring(0, 300)}`);
  }

  const rawText = await response.text();
  const cleanText = rawText.replace(/^\)]}'\n/, '');

  // Response format: ["folderIdString"]
  try {
    const data = JSON.parse(cleanText);
    const folderId = Array.isArray(data) && typeof data[0] === 'string' ? data[0] : null;
    if (!folderId) {
      throw new Error(`Unexpected response: ${cleanText.substring(0, 200)}`);
    }
    cachedAppFolder = { folderId, accountKey };
    console.log(`[DriveUploader:${reqId}] App folder ID: ${folderId}`);
    return folderId;
  } catch (e) {
    throw new Error(`[DriveUploader:${reqId}] Failed to parse GetAppFolder response: ${cleanText.substring(0, 200)}`);
  }
}

/** Clear the cached token and app folder (call on account switch or auth errors) */
export function clearTokenCache(): void {
  cachedToken = null;
  cachedAppFolder = null;
}

export interface DriveUploadResult {
  fileId: string;
}

/**
 * Upload an image to Google Drive using an OAuth2 token from GenerateAccessToken.
 *
 * @param page - Playwright page (must be on aistudio.google.com)
 * @param mimeType - Image MIME type (e.g., "image/png", "image/jpeg")
 * @param base64Data - Base64-encoded image data (without data: prefix)
 * @param reqId - Request ID for logging
 * @param creds - Account credentials for the GenerateAccessToken RPC
 */
export async function uploadImageToDrive(
  page: Page,
  mimeType: string,
  base64Data: string,
  reqId: string,
  creds: DriveAuthCredentials,
): Promise<DriveUploadResult> {
  console.log(`[DriveUploader:${reqId}] Uploading ${mimeType} (${base64Data.length} base64 chars) via browser...`);

  // Get OAuth2 token and app folder ID in parallel
  const [accessToken, appFolderId] = await Promise.all([
    getAccessToken(creds, reqId),
    getAppFolderId(creds, reqId),
  ]);

  const result = await page.evaluate(
    async (args: { mimeType: string; base64Data: string; uploadUrl: string; apiKey: string; accessToken: string; appFolderId: string; reqId: string }): Promise<{ error: string; fileId?: undefined } | { fileId: string; error?: undefined }> => {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2, 18);

      // Include parents:[appFolderId] so the file is in AI Studio's app folder
      // Without this, GenerateContent can't find the file (404 "entity not found")
      const metadata = JSON.stringify({
        name: `suiteproxy-${args.reqId}-${Date.now()}.bin`,
        mimeType: args.mimeType,
        parents: [args.appFolderId],
      });

      // Build multipart/related body with base64 transfer encoding
      const parts: string[] = [];
      parts.push(`--${boundary}`);
      parts.push('Content-Type: application/json; charset=UTF-8');
      parts.push('');
      parts.push(metadata);
      parts.push(`--${boundary}`);
      parts.push(`Content-Type: ${args.mimeType}`);
      parts.push('Content-Transfer-Encoding: base64');
      parts.push('');
      parts.push(args.base64Data);
      parts.push(`--${boundary}--`);

      const body = parts.join('\r\n');

      // Match AI Studio's exact URL format: uploadType=multipart + API key
      const url = `${args.uploadUrl}?uploadType=multipart&key=${args.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Authorization': `Bearer ${args.accessToken}`,
        },
        body,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'unknown');
        return { error: `HTTP ${response.status} — ${errorText.substring(0, 300)}` };
      }

      const data = await response.json() as { id?: string };
      if (!data.id) {
        return { error: `No file ID in response: ${JSON.stringify(data).substring(0, 200)}` };
      }

      return { fileId: data.id };
    },
    { mimeType, base64Data, uploadUrl: DRIVE_UPLOAD_URL, apiKey: API_KEY, accessToken, appFolderId, reqId },
  );

  if (result.error !== undefined) {
    // If we got a 401, clear the token cache so next attempt fetches fresh
    if (result.error.includes('HTTP 401')) {
      clearTokenCache();
    }
    throw new Error(`[DriveUploader:${reqId}] Upload failed: ${result.error}`);
  }

  const fileId = result.fileId;
  console.log(`[DriveUploader:${reqId}] Uploaded to app folder ${appFolderId} — file ID: ${fileId}`);
  return { fileId };
}

/**
 * Delete a file from Google Drive via OAuth2 token.
 */
export async function deleteDriveFile(
  page: Page,
  fileId: string,
  reqId: string,
  creds?: DriveAuthCredentials,
): Promise<void> {
  try {
    // If no creds provided, try with cached token only
    if (!creds && !cachedToken) {
      console.warn(`[DriveUploader:${reqId}] No credentials for delete — skipping ${fileId}`);
      return;
    }

    const accessToken = creds
      ? await getAccessToken(creds, reqId)
      : cachedToken!.token;

    const result = await page.evaluate(
      async (args: { fileId: string; filesUrl: string; apiKey: string; accessToken: string }) => {
        const url = `${args.filesUrl}/${args.fileId}?key=${args.apiKey}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${args.accessToken}`,
          },
        });
        return { status: response.status };
      },
      { fileId, filesUrl: DRIVE_FILES_URL, apiKey: API_KEY, accessToken },
    );

    if (result.status === 204 || result.status === 200) {
      console.log(`[DriveUploader:${reqId}] Deleted Drive file ${fileId}`);
    } else {
      console.warn(`[DriveUploader:${reqId}] Failed to delete Drive file ${fileId}: HTTP ${result.status}`);
    }
  } catch (error) {
    console.warn(`[DriveUploader:${reqId}] Error deleting Drive file ${fileId}:`, error);
  }
}

/**
 * Delete multiple Drive files sequentially via the browser.
 */
export async function deleteDriveFiles(
  page: Page,
  fileIds: string[],
  reqId: string,
  creds?: DriveAuthCredentials,
): Promise<void> {
  if (fileIds.length === 0) return;
  console.log(`[DriveUploader:${reqId}] Cleaning up ${fileIds.length} Drive file(s)...`);
  // Run deletes sequentially to avoid overwhelming the page context
  for (const id of fileIds) {
    await deleteDriveFile(page, id, reqId, creds);
  }
}
