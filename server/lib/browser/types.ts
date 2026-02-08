/**
 * Types for the browser automation layer.
 */
import type { Browser, BrowserContext, Page } from 'playwright-core';
import type { OpenAIChatMessage } from '~~/server/types/openai';

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

// Re-export OpenAIChatMessage as ChatMessage for backward compatibility
export type { OpenAIChatMessage as ChatMessage } from '~~/server/types/openai';

// ── Gemini Function Declaration (mapped from OpenAI tools) ──────────────
export interface GeminiFunctionDeclaration {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>; // JSON Schema
}

// ── Response Format Config ──────────────────────────────────────────────
export interface ResponseFormatConfig {
  /** 'text' | 'json_object' | 'json_schema' */
  type: string;
  /** JSON Schema object — when type is 'json_schema'. */
  schema?: Record<string, unknown>;
}

// ── Request Context ─────────────────────────────────────────────────────
export interface RequestContext {
  reqId: string;
  model: string;
  /** @deprecated Use `messages` instead. Kept for backward compat. */
  prompt: string;
  /** Structured messages for multi-turn (preferred over prompt) */
  messages?: OpenAIChatMessage[];
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
  /** Enable Gemini code execution tool. */
  enableCodeExecution?: boolean;
  /** Function declarations for Gemini function calling (mapped from OpenAI tools). */
  functionDeclarations?: GeminiFunctionDeclaration[];
  /** Structured output / response format config. */
  responseFormat?: ResponseFormatConfig;
  /** Response modalities — set for image generation models */
  responseModalities?: number[];
  /** TTS config — when set, uses AI Studio's dedicated TTS page instead of chat */
  ttsConfig?: {
    voice: string;
  };
}

// ── Queue Item ──────────────────────────────────────────────────────────
export interface QueueItem {
  context: RequestContext;
  resolve: (value: QueueResult) => void;
  reject: (reason: Error) => void;
  abortSignal?: AbortSignal;
  /** For streaming requests: called with the polling generator once the page is ready */
  streamCallback?: (generator: AsyncGenerator<StreamDelta>) => void;
}

/** Inline image data returned by image-generation models. */
export interface InlineImage {
  mimeType: string;
  data: string; // base64
}

/** Inline audio data returned by TTS models. */
export interface InlineAudio {
  mimeType: string;
  data: string; // base64
}

/** A function call returned by Gemini (from the GenerateContent response). */
export interface GeminiFunctionCallResult {
  name: string;
  args: Record<string, unknown>;
}

export interface QueueResult {
  text: string;
  finishReason: string;
  thinkingText?: string;
  /** Inline images from image-generation models. */
  images?: InlineImage[];
  /** Inline audio from TTS models. */
  audioChunks?: InlineAudio[];
  /** Function calls requested by the model. */
  functionCalls?: GeminiFunctionCallResult[];
}

/** A single streaming chunk yielded by the network/DOM polling generators. */
export interface StreamDelta {
  delta: string;
  done: boolean;
  /** Thinking/reasoning content (separate from main delta text). */
  thinking?: string;
  /** Inline images from image-generation models. */
  images?: InlineImage[];
  /** Inline audio from TTS models. */
  audioChunks?: InlineAudio[];
  /** Function calls requested by the model. */
  functionCalls?: GeminiFunctionCallResult[];
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
