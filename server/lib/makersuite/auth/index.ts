/**
 * Authentication & Authorization Module - Fixed Implementation
 * Supports both cookie-based (SAPISIDHASH) and API key authentication
 */

import crypto from 'crypto';

// ============================================================================
// Constants
// ============================================================================

export const AUTH_CONFIG = {
  DEFAULT_API_KEY: "AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs",
  HEADERS: {
    API_KEY: "X-Goog-Api-Key",
    AUTH_USER: "X-Goog-AuthUser",
    AUTHORIZATION: "Authorization",
    USER_API_KEY: "X-AIStudio-User-Api-Key",
    EXT_BIN: "X-Goog-Ext-519733851-bin",
    USER_AGENT: "X-User-Agent",
  },
  OAUTH_SCOPES: {
    DRIVE: "https://www.googleapis.com/auth/drive",
    DRIVE_INSTALL: "https://www.googleapis.com/auth/drive.install",
  },
  ENDPOINTS: {
    ACCOUNTS: "https://accounts.google.com",
    GOOGLEAPIS_AUTH: "https://www.googleapis.com/auth",
  },
  // Default logging token (extracted from AI Studio)
  DEFAULT_LOGGING_TOKEN: "!4uGl4bnNAAaX9SMQt_VCxjiicHzYbFU7ADQBEArZ1LQOm6jCkiNXa1ItvqVaZ1pWbcrJ5ykshFaFtnyEttBIHZnYZydWI5tXwqA3RPY6AgAAAE5SAAAABGgBB34AQCLVMy23BJBqlNf_Abs7HLmAxcm3Wq2uveB0rEb506KSks1jbAsWaH1RMK3kE77nx_XZpC7IkJAUb6QqSCdUxweZA22doQEXme_RSSEo4IoArDyYP9jA_KE_6wKsxBmFxLN2KRlVmevyPSLLRw9WXfbMShCVxWYF86aYW8skGokd0Rp6boNZ8yGqlgquaJKzKL3DdW96hEYTK7AkWQD099r2Qz8RkRL2gHfbxwaFxXKk6G5_j4af7XvWCcN56APsSwNz3cyFG7GZNF7MsLgxq-zT844_QnDNOD-36UVexG2ymPCITwLKo2GFIrjJxiHU1r1d0jKzZcFLfziBkuoBQNIADC_CzRuCNkNcNj_daUpa4qQkN5m5mdcqNjQ2q-sEHccoTWBg-6xpN5ctSnIAWL44N02uDCqyN0yu3DWnyZlrzUzLeh_tzh_xShqieDYuy-VxuHlENBRZYrgBGL9beyWu8CF8ZDwDF1sItejBabQiv5GeLL1PHiFNT_Wwx5inNLAzxzi42HZ4xtVFO5iHqiyB3v0NjswJWB4HOFgRIkbdxWkTk98ruHCbhPhiU_rwkLFW29UPWoAYowpqbRWyV_ZBUPmoSCjfrVMV5DauGSfCBB4iEIFwh7FArsGrziZY73PN9omw5hmQ5CdNKlHIkGXpE0qCq38mMmF3UxOac6pq9_MSZtHO6EVYeoViPFMS0xuNZvq_IxTWySiKQSHTw1Zz_e2lOSYD22MU1hMKPaxrfWsxaHZF53i3ay6mgPwXwNqSwJR2C4PJ3P8gkptSKvbtCwVGo23jCE5lCbH9FxKn7D_PHm0wsb77X3nVIxGpaA-jsFf_9oRnGn68cqbXnktB4tdnTgka5Os1ujzPhUrDkbd_SIxdelDd9VwzUGwKDHZ2RoH2OFFJnt6_NDo-R2rTexcNH-RSmnH-UpUwOC4XgsMTQOW7hRaijKgtEPzGiAcgRkYt12d21D8QcPqYjHYyq44YyfMo1EBHYt-B87zi6Yc3H6ZO5keZJBrrVtC7FgxbM2eH8T53F1Q4DOegVvqOvlT10_-y8ltkKK3DKBzW_eTi5XI9OuEJzxqluiMoEL0x_PTeThGgLfgRtgM92uj3QU1wP7h-P7LQlzdjTfuqf461NS77lG57veDzdo2EYvvD1iSVYYw9h8cjsMacyEpIsN3T9nuL8fgGs9AeD5Vuvf5LgJ4Ar0gy-W792WIXOby5CFx9pfo0wPHZhljH0Yjw7--a8n0ny0hSY2Pb4Y5_",
} as const;

// ============================================================================
// Types
// ============================================================================

export interface AuthOptions {
  apiKey?: string;
  authUser?: number;
  userApiKey?: string;
  bearerToken?: string;
  sapisid?: string;
  sapisid1p?: string;
  sapisid3p?: string;
  loggingToken?: string;
}

export interface AuthHeaders {
  "X-Goog-Api-Key": string;
  "X-Goog-AuthUser": string;
  "X-Goog-Ext-519733851-bin": string;
  "X-User-Agent": string;
  "Authorization"?: string;
  "X-AIStudio-User-Api-Key"?: string;
  "Content-Type": string;
  "Referer"?: string;
  "Origin"?: string;
}

// ============================================================================
// Authentication Manager
// ============================================================================

export class AuthManager {
  private apiKey: string;
  private authUser: number;
  private userApiKey?: string;
  private bearerToken?: string;
  private sapisid?: string;
  private sapisid1p?: string;
  private sapisid3p?: string;
  private loggingToken: string;

  constructor(options: AuthOptions = {}) {
    this.apiKey = options.apiKey || AUTH_CONFIG.DEFAULT_API_KEY;
    this.authUser = options.authUser ?? 0;
    this.userApiKey = options.userApiKey;
    this.bearerToken = options.bearerToken;
    this.sapisid = options.sapisid;
    this.sapisid1p = options.sapisid1p;
    this.sapisid3p = options.sapisid3p;
    this.loggingToken = options.loggingToken || AUTH_CONFIG.DEFAULT_LOGGING_TOKEN;
  }

  /**
   * Generate SAPISIDHASH for Authorization header
   * This is used by Google's internal APIs for cookie-based authentication
   * 
   * Format: <timestamp>_<sha1(timestamp + ' ' + sapisid + ' ' + origin)>
   */
  private generateSAPISIDHASH(sapisid: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const origin = "https://aistudio.google.com";
    const hashInput = `${timestamp} ${sapisid} ${origin}`;
    const hash = crypto.createHash('sha1').update(hashInput).digest('hex');
    return `${timestamp}_${hash}`;
  }

  /**
   * Get the logging token
   * This is a base64-encoded protobuf message used for logging/analytics
   */
  getLoggingToken(): string {
    return this.loggingToken;
  }

  /**
   * Set a custom logging token
   * You can extract this from browser network requests to AI Studio
   */
  setLoggingToken(token: string): void {
    this.loggingToken = token;
  }

  /**
   * Get authentication headers for requests
   * Returns headers in the format expected by the internal RPC API
   */
  getHeaders(): Partial<AuthHeaders> {
    const headers: Partial<AuthHeaders> = {
      [AUTH_CONFIG.HEADERS.API_KEY]: this.apiKey,
      [AUTH_CONFIG.HEADERS.AUTH_USER]: String(this.authUser),
      [AUTH_CONFIG.HEADERS.EXT_BIN]: "CAASA1JVQRgBMAE4BEAA", // Required by internal API
      [AUTH_CONFIG.HEADERS.USER_AGENT]: "grpc-web-javascript/0.1", // Identifies as gRPC-web client
      "Content-Type": "application/json+protobuf", // Important: not just application/json
      "Referer": "https://aistudio.google.com/",
      "Origin": "https://aistudio.google.com",
    };

    // Build Authorization header
    if (this.sapisid && this.sapisid1p && this.sapisid3p) {
      // Use cookie-based authentication (preferred by AI Studio)
      const hash1 = this.generateSAPISIDHASH(this.sapisid);
      const hash2 = this.generateSAPISIDHASH(this.sapisid1p);
      const hash3 = this.generateSAPISIDHASH(this.sapisid3p);
      headers[AUTH_CONFIG.HEADERS.AUTHORIZATION] = 
        `SAPISIDHASH ${hash1} SAPISID1PHASH ${hash2} SAPISID3PHASH ${hash3}`;
    } else if (this.bearerToken) {
      // Fallback to Bearer token
      headers[AUTH_CONFIG.HEADERS.AUTHORIZATION] = `Bearer ${this.bearerToken}`;
    }

    // Add user API key if provided
    if (this.userApiKey) {
      headers[AUTH_CONFIG.HEADERS.USER_API_KEY] = this.userApiKey;
    }

    return headers;
  }

  /**
   * Get headers for public API (different format)
   */
  getPublicAPIHeaders(): Partial<AuthHeaders> {
    const headers: any = {
      [AUTH_CONFIG.HEADERS.API_KEY]: this.apiKey,
      "Content-Type": "application/json",
    };

    if (this.bearerToken) {
      headers[AUTH_CONFIG.HEADERS.AUTHORIZATION] = `Bearer ${this.bearerToken}`;
    }

    return headers;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  setAuthUser(authUser: number): void {
    this.authUser = authUser;
  }

  setBearerToken(token: string): void {
    this.bearerToken = token;
  }

  setUserApiKey(key: string): void {
    this.userApiKey = key;
  }

  /**
   * Set SAPISID cookies for authentication
   * These are extracted from browser cookies when logged into Google
   */
  setSAPISID(sapisid: string, sapisid1p: string, sapisid3p: string): void {
    this.sapisid = sapisid;
    this.sapisid1p = sapisid1p;
    this.sapisid3p = sapisid3p;
  }

  /**
   * Check if properly authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.bearerToken || this.userApiKey || this.sapisid);
  }

  /**
   * Check if using cookie-based authentication
   */
  hasCookieAuth(): boolean {
    return !!(this.sapisid && this.sapisid1p && this.sapisid3p);
  }
}

// ============================================================================
// Validation
// ============================================================================

export function validateApiKey(key: string): boolean {
  return /^AIza[A-Za-z0-9_-]{35}$/.test(key);
}

export function validateBearerToken(token: string): boolean {
  return token.length > 0 && !token.includes(" ");
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createAuthenticatedHeaders(auth: AuthManager): Record<string, string> {
  return auth.getHeaders() as Record<string, string>;
}

export function extractBearerToken(authHeader: string): string | null {
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match && match[1] ? match[1] : null;
}

/**
 * Extract cookie value from cookie string - FIXED to handle undefined
 */
export function extractCookie(cookieString: string | undefined, name: string): string | null {
  if (!cookieString) return null;
  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match && match[1] ? match[1] : null;
}

/**
 * Parse cookies from request headers
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });

  return cookies;
}

/**
 * Extract SAPISID values from cookie header
 */
export function extractSAPISIDFromCookies(cookieHeader: string | undefined): {
  sapisid: string | null;
  sapisid1p: string | null;
  sapisid3p: string | null;
} {
  return {
    sapisid: extractCookie(cookieHeader, 'SAPISID'),
    sapisid1p: extractCookie(cookieHeader, '__Secure-1PAPISID'),
    sapisid3p: extractCookie(cookieHeader, '__Secure-3PAPISID'),
  };
}
