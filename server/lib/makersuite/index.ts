/**
 * @google/makersuite-complete
 * All-in-One Google AI Studio / MakerSuite SDK
 * 
 * Includes:
 * - Complete API Client
 * - Authentication System
 * - Utility Functions
 * - TypeScript Types
 */

// ============================================================================
// Main Exports
// ============================================================================

// Client
export { MakerSuiteClient, createClient } from "./client/index";

// Auth
export { AuthManager, AUTH_CONFIG, validateApiKey, validateBearerToken } from "./auth/index";
export type { AuthOptions, AuthHeaders } from "./auth/index";

// Types
export * from "./types/index";
export { MODELS, DEFAULT_MODEL } from "./types/index";

// Utils
export * from "./utils/index";

// ============================================================================
// Quick Start Helpers
// ============================================================================

import { createClient } from "./client/index";
import type { ClientConfig } from "./types/index";

/**
 * Quick client with default settings
 */
export function quickClient(apiKey?: string): ReturnType<typeof createClient> {
  return createClient({
    apiKey: apiKey || process.env.GOOGLE_API_KEY,
    debug: false,
  });
}

/**
 * Debug client with logging enabled
 */
export function debugClient(apiKey?: string): ReturnType<typeof createClient> {
  return createClient({
    apiKey: apiKey || process.env.GOOGLE_API_KEY,
    debug: true,
  });
}
