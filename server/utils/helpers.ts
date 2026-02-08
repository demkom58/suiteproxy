/**
 * Shared utility functions used across the server codebase.
 */

/**
 * Generate a random OpenAI-style ID with the given prefix.
 * @example generateOpenAIId('chatcmpl') → 'chatcmpl-a1b2c3d4e5f6a1b2c3d4e5f6'
 */
export function generateOpenAIId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`;
}

/**
 * Safely extract an error message from an unknown error value.
 * Handles Error instances, strings, and other types.
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
