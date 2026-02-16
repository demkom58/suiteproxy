/**
 * Utility Functions for MakerSuite Client
 * Helper functions for cookie extraction, request handling, etc.
 */

import type { CookieAuth } from "../types/index";

// ============================================================================
// Cookie Utilities
// ============================================================================

/**
 * Extract SAPISID values from browser cookies
 * These are needed for authenticating with the internal RPC API
 */
export function extractSAPISIDFromCookies(cookieString: string | undefined): CookieAuth | null {
  const sapisid = extractCookie(cookieString, 'SAPISID');
  const sapisid1p = extractCookie(cookieString, '__Secure-1PAPISID');
  const sapisid3p = extractCookie(cookieString, '__Secure-3PAPISID');

  if (!sapisid || !sapisid1p || !sapisid3p) {
    return null;
  }

  return { sapisid, sapisid1p, sapisid3p };
}

/**
 * Extract a specific cookie value from cookie string - FIXED to handle undefined
 */
export function extractCookie(cookieString: string | undefined, name: string): string | null {
  if (!cookieString) return null;
  
  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Parse all cookies into an object
 */
export function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieString) return cookies;

  cookieString.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = decodeURIComponent(rest.join('=').trim());
    }
  });

  return cookies;
}

/**
 * Extract SAPISID from Express/HTTP request
 */
export function extractSAPISIDFromRequest(req: any): CookieAuth | null {
  const cookieHeader = req.headers?.cookie || req.headers?.Cookie;
  if (!cookieHeader) return null;
  
  return extractSAPISIDFromCookies(cookieHeader);
}

// ============================================================================
// Request Utilities
// ============================================================================

/**
 * Convert OpenAI-style messages to Gemini format
 */
export function convertOpenAIToGemini(messages: any[]): any[] {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
}

/**
 * Convert Gemini response to OpenAI format
 */
export function convertGeminiToOpenAI(response: any, model: string): any {
  const candidate = response.candidates?.[0];
  const content = candidate?.content?.parts?.[0]?.text || '';
  
  return {
    id: `chatcmpl-${generateId()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: content
      },
      finish_reason: mapFinishReason(candidate?.finishReason)
    }],
    usage: {
      prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
      completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: response.usageMetadata?.totalTokenCount || 0
    }
  };
}

/**
 * Map Gemini finish reason to OpenAI format
 */
function mapFinishReason(reason?: string): string {
  switch (reason) {
    case 'STOP': return 'stop';
    case 'MAX_TOKENS': return 'length';
    case 'SAFETY': return 'content_filter';
    default: return 'stop';
  }
}

/**
 * Generate a random ID for responses
 */
function generateId(length: number = 29): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate API key format
 */
export function isValidApiKey(key: string): boolean {
  return /^AIza[A-Za-z0-9_-]{35}$/.test(key);
}

/**
 * Validate model name format
 */
export function isValidModelName(model: string): boolean {
  return /^models\/[a-z0-9-]+$/.test(model) || /^[a-z0-9-]+$/.test(model);
}

/**
 * Normalize model name (add "models/" prefix if missing)
 */
export function normalizeModelName(model: string): string {
  if (model.startsWith('models/')) {
    return model;
  }
  return `models/${model}`;
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  return error?.status === 429 || 
         error?.code === 429 ||
         error?.message?.includes('rate limit') ||
         error?.message?.includes('quota');
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return error?.status === 401 || 
         error?.status === 403 ||
         error?.code === 401 ||
         error?.code === 403;
}

/**
 * Extract error message from various error formats
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.error?.message) return error.error.message;
  if (error?.message) return error.message;
  if (error?.statusText) return error.statusText;
  return 'Unknown error';
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: any, model: string): any {
  return {
    id: `chatcmpl-${generateId()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model,
    error: {
      message: extractErrorMessage(error),
      type: getErrorType(error),
      code: error?.status || error?.code || 500
    }
  };
}

/**
 * Get error type from error object
 */
function getErrorType(error: any): string {
  if (isRateLimitError(error)) return 'rate_limit_error';
  if (isAuthError(error)) return 'authentication_error';
  if (error?.status >= 500) return 'server_error';
  if (error?.status >= 400) return 'invalid_request_error';
  return 'api_error';
}

// ============================================================================
// Logging Utilities
// ============================================================================

/**
 * Safe JSON stringify that handles circular references
 */
export function safeStringify(obj: any, indent?: number): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, indent);
}

/**
 * Redact sensitive information from logs
 */
export function redactSensitive(obj: any): any {
  const sensitiveKeys = ['apiKey', 'api_key', 'authorization', 'cookie', 'sapisid', 'token', 'password'];
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitive(item));
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitive(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

// ============================================================================
// Retry Utilities
// ============================================================================

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = isRateLimitError
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Stream Utilities - FIXED to use async generator properly
// ============================================================================

/**
 * Convert streaming response to OpenAI format - FIXED as async generator
 */
export async function* convertStreamToOpenAI(
  stream: AsyncGenerator<any>,
  model: string
): AsyncGenerator<string> {
  for await (const chunk of stream) {
    const candidate = chunk.candidates?.[0];
    const delta = candidate?.content?.parts?.[0]?.text || '';
    
    if (delta) {
      const data = {
        id: `chatcmpl-${generateId()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          delta: { content: delta },
          finish_reason: null
        }]
      };
      
      yield `data: ${JSON.stringify(data)}\n\n`;
    }
    
    if (candidate?.finishReason) {
      const finalData = {
        id: `chatcmpl-${generateId()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          delta: {},
          finish_reason: mapFinishReason(candidate.finishReason)
        }]
      };
      
      yield `data: ${JSON.stringify(finalData)}\n\n`;
    }
  }
  
  yield 'data: [DONE]\n\n';
}
