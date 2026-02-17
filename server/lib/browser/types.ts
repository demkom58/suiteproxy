/**
 * Types for the browser automation layer.
 */
import type { Browser, BrowserContext, Page } from 'playwright-core';

// ── Browser State ───────────────────────────────────────────────────────
export interface BrowserState {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  isReady: boolean;
  isInitializing: boolean;
  currentModel: string | null;
  currentAccountId: string | null;
}

// ── Model Categories (for thinking support) ─────────────────────────────
export type ModelCategory =
  | 'NON_THINKING'       // Gemini 2.0, 1.5 — no thinking support
  | 'THINKING_FLASH_25'  // Gemini 2.5 Flash — toggleable thinking + budget
  | 'THINKING_PRO_25'    // Gemini 2.5 Pro — always-on, budget configurable
  | 'THINKING_LEVEL_PRO' // Gemini 3 Pro — 2-level dropdown (low/high)
  | 'THINKING_LEVEL_FLASH'; // Gemini 3 Flash — 4-level dropdown

export type ThinkingLevel = 'minimal' | 'low' | 'medium' | 'high';

export interface ThinkingDirective {
  enabled: boolean;
  budgetEnabled: boolean;
  budgetValue: number | null;
  level: ThinkingLevel | null;
}

// ── Request Context ─────────────────────────────────────────────────────
export interface RequestContext {
  reqId: string;
  model: string;
  prompt: string;
  systemInstruction?: string;
  stream: boolean;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  reasoningEffort?: string | number;
  images?: Array<{ mimeType: string; data: string }>;
  enableGoogleSearch?: boolean;
  enableUrlContext?: boolean;
}

// ── Queue Item ──────────────────────────────────────────────────────────
export interface QueueItem {
  context: RequestContext;
  resolve: (value: QueueResult) => void;
  reject: (reason: Error) => void;
  abortSignal?: AbortSignal;
  /** For streaming requests: called with the polling generator once the page is ready */
  streamCallback?: (generator: AsyncGenerator<{ delta: string; done: boolean }>) => void;
}

export interface QueueResult {
  text: string;
  finishReason: string;
  thinkingText?: string;
}

// ── Parsed Model ────────────────────────────────────────────────────────
export interface ParsedModel {
  id: string;         // e.g. "models/gemini-3-flash-preview"
  displayName: string;
  description: string;
}

// ── Account Auth State ──────────────────────────────────────────────────
export interface PlaywrightCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

export interface StorageState {
  cookies: PlaywrightCookie[];
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
}
