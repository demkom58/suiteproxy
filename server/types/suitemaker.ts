/**
 * Internal Google 'WizData' and Build identifiers
 * Extracted from script id: 5214b93e-8e4f-44d0-9b6e-68042704d63a
 */
export interface SuitemakerCreds {
  cookie: string;          // Master session cookies (SAPISID, HSID, etc.)
  at: string;              // 'SNlM0e' - CSRF / Action Token
  api_key: string;         // 'PeqOqb' - Internal API Key
  build: string;           // 'cfb2h' - e.g., "boq_alkali-makersuite_..."
  flow_id: string;         // 'FdrFJe' - Current session flow identifier
  nonce: string;           // 'WZsZ1e' - Build-specific security nonce
  toggles: any[];          // window._F_toggles - Experimental features
  authUser?: string;       // Optional: Google account index (0-9)
  userAgent?: string;      // Optional: User agent string
  session_token?: string;  // Optional: Active session token
}

/**
 * Gemini Internal Request Format
 */
export type GeminiRole = "user" | "model" | "system";

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // Base64
  };
  fileData?: {
    mimeType: string;
    fileUri: string;
  };
  thought?: string; // Captured from Gemini 2.0/3 thinking process
  functionCall?: {
    name: string;
    args: Record<string, any>;
  };
  functionResponse?: {
    name: string;
    response: Record<string, any>;
  };
}

export interface GeminiRequest {
  contents: {
    role: GeminiRole;
    parts: GeminiPart[];
  }[];
  systemInstruction?: {
    role: "system";
    parts: { text: string }[];
  };
  tools?: Array<{
    google_search_retrieval?: {};
    code_execution?: {};
    function_declarations?: any[];
  }>;
  generationConfig: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    response_mime_type?: "text/plain" | "application/json";
    response_schema?: any;
    thinking_config?: {
      include_thoughts: boolean;
    };
  };
  safetySettings?: Array<{
    category: "HATE_SPEECH" | "DANGEROUS_CONTENT" | "HARASSMENT" | "SEXUALLY_EXPLICIT";
    threshold: "BLOCK_NONE" | "BLOCK_ONLY_HIGH" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_LOW_AND_ABOVE";
  }>;
}

export interface GeminiResponse {
  candidates: {
    content: {
      role: "model";
      parts: GeminiPart[];
    };
    finishReason: string;
    groundingMetadata?: {
      searchEntryPoint?: { renderedHtml: string };
      groundingChunks?: any[];
    };
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}
