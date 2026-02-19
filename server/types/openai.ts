// ── Function / Tool Types ──────────────────────────────────────────────

export interface OpenAIFunctionDef {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>; // JSON Schema
  strict?: boolean;
}

export interface OpenAIToolDef {
  type: 'function';
  function: OpenAIFunctionDef;
}

export interface OpenAIFunctionCall {
  name: string;
  arguments: string; // JSON-encoded
}

export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: OpenAIFunctionCall;
}

// ── Response Format ───────────────────────────────────────────────────

export type OpenAIResponseFormat =
  | { type: 'text' }
  | { type: 'json_object' }
  | { type: 'json_schema'; json_schema: { name: string; description?: string; schema: Record<string, unknown>; strict?: boolean } };

// ── Chat Request / Messages ─────────────────────────────────────────

export interface OpenAIChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null | Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  >;
  /** Tool call ID — required when role is 'tool' (function result). */
  tool_call_id?: string;
  /** Function name — used with role 'tool' to identify which call this responds to. */
  name?: string;
  /** Tool calls made by the assistant. */
  tool_calls?: OpenAIToolCall[];
}

export interface OpenAIChatRequest {
  model: string;
  messages: OpenAIChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  max_output_tokens?: number;
  stream?: boolean;
  response_format?: OpenAIResponseFormat;
  stop?: string | string[];
  reasoning_effort?: string | number;
  tools?: Array<OpenAIToolDef | Record<string, unknown>>;
  tool_choice?: string | { type: string; function?: { name: string } };
}

/** A content part in a multimodal assistant message. */
export type OpenAIContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export interface OpenAIChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      /** String for text-only, array of parts for multimodal (text + images). */
      content: string | null | OpenAIContentPart[];
      /** Thinking/reasoning text from thinking models (DeepSeek/Gemini convention) */
      reasoning_content?: string | null;
      /** Tool calls requested by the model. */
      tool_calls?: OpenAIToolCall[];
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIStreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string | null;
      /** Thinking/reasoning text from thinking models (DeepSeek/Gemini convention) */
      reasoning_content?: string | null;
      /** Tool calls (streamed incrementally). */
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: 'function';
        function?: { name?: string; arguments?: string };
      }>;
    };
    finish_reason: string | null;
  }>;
}

// ── Images API ──────────────────────────────────────────────────────────

export interface OpenAIImagesRequest {
  /** The text prompt describing the desired image(s). */
  prompt: string;
  /** Model to use for image generation. Defaults to gemini-2.0-flash-exp. */
  model?: string;
  /** Number of images to generate (1-4). Gemini typically returns 1. */
  n?: number;
  /** Image size. Accepted but not enforced — Gemini decides output dimensions. */
  size?: string;
  /** Quality hint. Accepted but not enforced. */
  quality?: 'standard' | 'hd';
  /** Response format: 'b64_json' returns base64, 'url' not supported (no hosting). */
  response_format?: 'b64_json' | 'url';
  /** Style hint. Accepted but not enforced. */
  style?: 'vivid' | 'natural';
}

export interface OpenAIImagesResponse {
  created: number;
  data: Array<{
    /** Base64-encoded image data (when response_format is 'b64_json'). */
    b64_json?: string;
    /** Image URL (not supported — we always return b64_json). */
    url?: string;
    /** The prompt that was used (may differ from input if model revised it). */
    revised_prompt?: string;
  }>;
}

// ── Legacy Completions API ──────────────────────────────────────────────

export interface OpenAICompletionsRequest {
  model: string;
  /** The prompt(s) to generate completions for. */
  prompt: string | string[];
  /** Maximum number of tokens to generate. */
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  /** Number of completions to generate. Only n=1 supported. */
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  /** Echo back the prompt in addition to the completion. */
  echo?: boolean;
}

export interface OpenAICompletionsResponse {
  id: string;
  object: 'text_completion';
  created: number;
  model: string;
  choices: Array<{
    text: string;
    index: number;
    logprobs: null;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ── Embeddings API ─────────────────────────────────────────────────────

export interface OpenAIEmbeddingsRequest {
  /** Text or array of texts to embed. */
  input: string | string[];
  /** Model to use for embeddings. */
  model: string;
  /** Encoding format for embeddings: 'float' or 'base64'. */
  encoding_format?: 'float' | 'base64';
  /** Number of dimensions for the embedding. */
  dimensions?: number;
}

export interface OpenAIEmbeddingsResponse {
  object: 'list';
  data: Array<{
    object: 'embedding';
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// ── Audio Speech (TTS) API ─────────────────────────────────────────────

export interface OpenAIAudioSpeechRequest {
  /** Model to use for TTS. Maps to Gemini TTS models. */
  model: string;
  /** Text to convert to speech. */
  input: string;
  /** Voice selection: alloy, echo, fable, onyx, nova, shimmer (mapped to Gemini voices). */
  voice: string;
  /** Audio output format: mp3, opus, aac, flac, wav, pcm. */
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  /** Speech speed (0.25 to 4.0). Accepted but may not be enforced. */
  speed?: number;
}

// ── Audio Transcriptions API ───────────────────────────────────────────

export interface OpenAIAudioTranscriptionResponse {
  text: string;
}

// ── Images Edits API ───────────────────────────────────────────────────

export interface OpenAIImagesEditRequest {
  /** Text prompt describing the desired edit. */
  prompt: string;
  /** Base64 image data or data URI of the image to edit. */
  image: string;
  /** Model to use. Defaults to gemini-2.5-flash-image. */
  model?: string;
  /** Number of images to generate (1-4). */
  n?: number;
  /** Image size hint. */
  size?: string;
}

// ── Moderations API ────────────────────────────────────────────────────

export interface OpenAIModerationsRequest {
  /** Text or array of texts to moderate. */
  input: string | string[];
  /** Model to use. Accepted but ignored (always returns safe). */
  model?: string;
}

export interface OpenAIModerationsResponse {
  id: string;
  model: string;
  results: Array<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }>;
}
