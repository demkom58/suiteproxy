/**
 * Type Definitions for MakerSuite API
 * Updated to support both RPC and REST API formats
 */

// ============================================================================
// Client Configuration
// ============================================================================

export interface ClientConfig {
  apiKey?: string;
  authUser?: number;
  endpoint?: string;
  timeout?: number;
  debug?: boolean;
  useRPC?: boolean; // Use internal RPC format (default: true)
  
  // Cookie-based authentication (for RPC API)
  sapisid?: string;
  sapisid1p?: string;
  sapisid3p?: string;
  loggingToken?: string;
}

// ============================================================================
// Content Types
// ============================================================================

export interface Content {
  parts: Part[];
  role: string;
}

export interface Part {
  text?: string;
  inlineData?: InlineData;
  functionCall?: FunctionCall;
  functionResponse?: FunctionResponse;
}

export interface InlineData {
  mimeType: string;
  data: string; // base64 encoded
}

export interface FunctionCall {
  name: string;
  args: Record<string, any>;
}

export interface FunctionResponse {
  name: string;
  response: Record<string, any>;
}

// ============================================================================
// Request Types
// ============================================================================

export interface GenerateContentRequest {
  model: string;
  contents: Content[];
  safetySettings?: SafetySetting[];
  generationConfig?: GenerationConfig;
  timezone?: string; // For RPC format
}

export interface CountTokensRequest {
  model: string;
  contents: Content[];
}

export interface GenerateImageRequest {
  prompt: string;
  numberOfImages?: number;
  aspectRatio?: string;
  negativePrompt?: string;
  personGeneration?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface GenerateContentResponse {
  candidates: Candidate[];
  promptFeedback?: PromptFeedback;
  usageMetadata?: UsageMetadata;
}

export interface Candidate {
  content: Content;
  finishReason?: FinishReason;
  index: number;
  safetyRatings?: SafetyRating[];
  citationMetadata?: CitationMetadata;
  tokenCount?: number;
}

export interface CountTokensResponse {
  totalTokens: number;
}

export interface GenerateImageResponse {
  images: GeneratedImage[];
}

export interface GeneratedImage {
  imageData: string; // base64
  mimeType: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface GenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  responseMimeType?: string;
  responseSchema?: any;
}

export interface SafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

// ============================================================================
// Enums
// ============================================================================

export type HarmCategory =
  | "HARM_CATEGORY_UNSPECIFIED"
  | "HARM_CATEGORY_DEROGATORY"
  | "HARM_CATEGORY_TOXICITY"
  | "HARM_CATEGORY_VIOLENCE"
  | "HARM_CATEGORY_SEXUAL"
  | "HARM_CATEGORY_MEDICAL"
  | "HARM_CATEGORY_DANGEROUS"
  | "HARM_CATEGORY_HARASSMENT"
  | "HARM_CATEGORY_HATE_SPEECH"
  | "HARM_CATEGORY_SEXUALLY_EXPLICIT"
  | "HARM_CATEGORY_DANGEROUS_CONTENT";

export type HarmBlockThreshold =
  | "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
  | "BLOCK_LOW_AND_ABOVE"
  | "BLOCK_MEDIUM_AND_ABOVE"
  | "BLOCK_ONLY_HIGH"
  | "BLOCK_NONE";

export type FinishReason =
  | "FINISH_REASON_UNSPECIFIED"
  | "STOP"
  | "MAX_TOKENS"
  | "SAFETY"
  | "RECITATION"
  | "OTHER";

export type HarmProbability =
  | "HARM_PROBABILITY_UNSPECIFIED"
  | "NEGLIGIBLE"
  | "LOW"
  | "MEDIUM"
  | "HIGH";

// ============================================================================
// Additional Response Types
// ============================================================================

export interface SafetyRating {
  category: HarmCategory;
  probability: HarmProbability;
  blocked?: boolean;
}

export interface PromptFeedback {
  blockReason?: BlockReason;
  safetyRatings: SafetyRating[];
}

export type BlockReason =
  | "BLOCK_REASON_UNSPECIFIED"
  | "SAFETY"
  | "OTHER";

export interface CitationMetadata {
  citationSources: CitationSource[];
}

export interface CitationSource {
  startIndex?: number;
  endIndex?: number;
  uri?: string;
  license?: string;
}

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

// ============================================================================
// Tool/Function Calling Types
// ============================================================================

export interface Tool {
  functionDeclarations: FunctionDeclaration[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters?: Schema;
}

export interface Schema {
  type: string;
  format?: string;
  description?: string;
  nullable?: boolean;
  enum?: string[];
  items?: Schema;
  properties?: Record<string, Schema>;
  required?: string[];
}

export interface ToolConfig {
  functionCallingConfig: FunctionCallingConfig;
}

export interface FunctionCallingConfig {
  mode: FunctionCallingMode;
  allowedFunctionNames?: string[];
}

export type FunctionCallingMode =
  | "MODE_UNSPECIFIED"
  | "AUTO"
  | "ANY"
  | "NONE";

// ============================================================================
// Model Information Types
// ============================================================================

export interface Model {
  name: string;
  baseModelId?: string;
  version: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface ListModelsResponse {
  models: Model[];
  nextPageToken?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: {
    code: number;
    message: string;
    status: string;
    details?: any[];
  };
}

// ============================================================================
// RPC-specific Types (Internal)
// ============================================================================

/**
 * Internal RPC message format
 * This is what AI Studio actually sends to the server
 */
export type RPCGenerateContentRequest = [
  string,                    // [0] model
  any[],                     // [1] messages (nested arrays)
  any[],                     // [2] safety settings
  any[],                     // [3] generation config
  string,                    // [4] logging token
  null,                      // [5] reserved
  any[],                     // [6] unknown structure
  null,                      // [7] reserved
  null,                      // [8] reserved
  null,                      // [9] reserved
  number,                    // [10] version flag
  null,                      // [11] reserved
  null,                      // [12] reserved
  any[]                      // [13] timezone
];

// ============================================================================
// Helper Types
// ============================================================================

export interface CookieAuth {
  sapisid: string;
  sapisid1p: string;
  sapisid3p: string;
}

export interface RequestOptions {
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}