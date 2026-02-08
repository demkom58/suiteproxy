/**
 * Converts SuiteProxy's cookie string format to Playwright's storage_state format.
 * This bridges our SQLite-based account management with Camoufox browser contexts.
 */
import type { StorageState, PlaywrightCookie } from './types';

/**
 * Google cookie attributes — matching real browser behavior.
 * Getting these wrong causes authentication failures (AI Studio /520 error).
 * Values were verified against actual Google cookie attributes.
 */
const COOKIE_ATTRS: Record<string, { httpOnly: boolean; secure: boolean; sameSite: 'None' | 'Lax' | 'Strict' }> = {
  'SID':                { httpOnly: false, secure: false, sameSite: 'None' },
  'HSID':               { httpOnly: true,  secure: false, sameSite: 'Lax' },
  'SSID':               { httpOnly: true,  secure: true,  sameSite: 'None' },
  'APISID':             { httpOnly: false, secure: false, sameSite: 'None' },
  'SAPISID':            { httpOnly: false, secure: true,  sameSite: 'None' },
  '__Secure-1PSID':     { httpOnly: true,  secure: true,  sameSite: 'None' },
  '__Secure-3PSID':     { httpOnly: true,  secure: true,  sameSite: 'None' },
  '__Secure-1PSIDTS':   { httpOnly: true,  secure: true,  sameSite: 'None' },
  '__Secure-3PSIDTS':   { httpOnly: true,  secure: true,  sameSite: 'None' },
  '__Secure-1PAPISID':  { httpOnly: true,  secure: true,  sameSite: 'None' },
  '__Secure-3PAPISID':  { httpOnly: true,  secure: true,  sameSite: 'None' },
  'SIDCC':              { httpOnly: false, secure: false, sameSite: 'None' },
  '__Secure-1PSIDCC':   { httpOnly: true,  secure: true,  sameSite: 'None' },
  '__Secure-3PSIDCC':   { httpOnly: true,  secure: true,  sameSite: 'None' },
  'NID':                { httpOnly: true,  secure: true,  sameSite: 'None' },
  'AEC':                { httpOnly: true,  secure: true,  sameSite: 'Lax' },
  '__Secure-STRP':      { httpOnly: false, secure: true,  sameSite: 'Lax' },
  '__Secure-BUCKET':    { httpOnly: false, secure: true,  sameSite: 'Lax' },
  'LSID':               { httpOnly: true,  secure: true,  sameSite: 'None' },
};

/**
 * Parse a raw cookie string (from SuiteProxy's database) into Playwright cookie objects.
 * Cookie string format: "NAME1=VALUE1; NAME2=VALUE2; ..."
 */
export function parseCookieString(cookieStr: string): PlaywrightCookie[] {
  if (!cookieStr || cookieStr.trim().length === 0) return [];

  const results: PlaywrightCookie[] = [];

  for (const raw of cookieStr.split(/;(?=\s*[a-zA-Z0-9_-]+=)/)) {
    const c = raw.trim();
    if (!c || !c.includes('=')) continue;

    const eqIndex = c.indexOf('=');
    const name = c.substring(0, eqIndex).trim();
    const value = c.substring(eqIndex + 1);
    if (!name) continue;

    const attrs = COOKIE_ATTRS[name] ?? { httpOnly: false, secure: true, sameSite: 'None' as const };

    results.push({
      name,
      value,
      domain: '.google.com',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 86400 * 365,
      httpOnly: attrs.httpOnly,
      secure: attrs.secure,
      sameSite: attrs.sameSite,
    });
  }

  return results;
}

/**
 * Convert SuiteProxy cookie string + optional authUser into Playwright storage_state.
 */
export function cookieToStorageState(
  cookieStr: string,
  authUser?: string,
): StorageState {
  const cookies = parseCookieString(cookieStr);

  // Build localStorage entries for AI Studio
  const localStorageItems: Array<{ name: string; value: string }> = [];

  // Set authUser preference if provided
  if (authUser) {
    localStorageItems.push({
      name: 'aiStudioUserPreference',
      value: JSON.stringify({ authUser }),
    });
  }

  return {
    cookies,
    origins: [
      {
        origin: 'https://aistudio.google.com',
        localStorage: localStorageItems,
      },
    ],
  };
}

/**
 * Write a storage_state JSON file for use with Playwright's context.
 */
export async function writeStorageState(
  storageState: StorageState,
  filePath: string,
): Promise<void> {
  const { writeFile, mkdir } = await import('node:fs/promises');
  const { dirname } = await import('node:path');
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(storageState, null, 2));
}

/**
 * Extract SAPISID from a cookie string (needed for SAPISIDHASH authorization).
 */
export function extractSAPISID(cookieStr: string): string | null {
  // Try __Secure-3PSAPISID first (more common), then SAPISID
  const secure3p = cookieStr.match(/__Secure-3PSAPISID=([^;]+)/);
  if (secure3p) return secure3p[1] ?? null;

  const sapisid = cookieStr.match(/SAPISID=([^;]+)/);
  if (sapisid) return sapisid[1] ?? null;

  return null;
}
