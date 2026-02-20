/**
 * AI Studio Internal Types & Serialization
 *
 * AI Studio uses a positional array format (protobuf-like JSON arrays)
 * instead of key-value JSON. Each dataclass field maps to an array index.
 * `null` values are used for unused/unknown fields.
 *
 * Based on reverse-engineering of AI Studio's internal gRPC-web protocol.
 * Reference: HAGMI project (github.com/wgd-ng/HAGMI)
 */

// ── Safety Settings ─────────────────────────────────────────────────────

export enum HarmCategory {
  HARASSMENT = 7,
  HATE = 8,
  SEXUALLY_EXPLICIT = 9,
  DANGEROUS_CONTENT = 10,
}

export enum HarmBlockThreshold {
  BLOCK_MOST = 1,
  BLOCK_SOME = 2,
  BLOCK_FEW = 3,
  BLOCK_NONE = 4,
  OFF = 5,
}

export interface SafetySetting {
  unknow0: null;
  unknow1: null;
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

// ── Response Modalities ─────────────────────────────────────────────────

export enum ResponseModality {
  UNSPECIFIED = 0,
  TEXT = 1,
  IMAGE = 2,
  AUDIO = 3,
  DOCUMENT = 4,
}

// ── Schema Wire Format ──────────────────────────────────────────────────
// AI Studio's gRPC-web wire format represents JSON Schema as positional arrays.
// Each schema node is a variable-length array where index = proto field_number - 1.
// String type names ("string", "object") must be converted to numeric enums.

/** Proto Type enum for Schema nodes in the wire format. */
export enum SchemaType {
  STRING = 1,
  NUMBER = 2,
  INTEGER = 3,
  BOOLEAN = 4,
  ARRAY = 5,
  OBJECT = 6,
}

const JSON_SCHEMA_TYPE_MAP: Record<string, SchemaType> = {
  string: SchemaType.STRING,
  number: SchemaType.NUMBER,
  integer: SchemaType.INTEGER,
  boolean: SchemaType.BOOLEAN,
  array: SchemaType.ARRAY,
  object: SchemaType.OBJECT,
};

/**
 * Convert a JSON Schema object into the gRPC-web positional array format
 * expected by MakerSuiteService/GenerateContent.
 *
 * Wire format positions:
 *   [0]  type              (numeric enum: 1=string, 2=number, ..., 6=object)
 *   [1]  format            (string, e.g. "enum")
 *   [2]  description       (string)
 *   [3]  nullable          (boolean)
 *   [4]  enum              (string[])
 *   [5]  items             (Schema — for arrays)
 *   [6]  properties        (Array<[name, Schema]> — for objects)
 *   [7]  required          (string[])
 *   ...trailing positions for min/max/pattern/etc...
 *   [22] property_ordering (string[] — all property names in order)
 */
export function jsonSchemaToWire(schema: Record<string, unknown>): unknown[] {
  const typeStr = schema.type as string | undefined;
  const typeNum = typeStr ? JSON_SCHEMA_TYPE_MAP[typeStr] : null;

  // Start with 23 slots (up to property_ordering at index 22)
  const node: unknown[] = new Array(23).fill(null);
  node[0] = typeNum;

  // [1] format
  if (schema.format) node[1] = schema.format;

  // [2] description
  if (schema.description) node[2] = schema.description;

  // [3] nullable
  if (schema.nullable) node[3] = schema.nullable;

  // [4] enum values
  if (schema.enum && Array.isArray(schema.enum)) node[4] = schema.enum;

  // [5] items — for ARRAY type
  if (typeStr === 'array' && schema.items && typeof schema.items === 'object') {
    node[5] = jsonSchemaToWire(schema.items as Record<string, unknown>);
  }

  // [6] properties — for OBJECT type (as [name, wireSchema] pairs)
  // [7] required
  // [22] property_ordering
  if (typeStr === 'object' && schema.properties && typeof schema.properties === 'object') {
    const props = schema.properties as Record<string, unknown>;
    const keys = Object.keys(props);
    node[6] = keys.map(k => [k, jsonSchemaToWire(props[k] as Record<string, unknown>)]);
    if (schema.required && Array.isArray(schema.required) && (schema.required as string[]).length > 0) {
      node[7] = schema.required;
    }
    node[22] = keys; // property_ordering
  }

  // Trim trailing nulls for compact representation
  while (node.length > 1 && node[node.length - 1] === null) {
    node.pop();
  }

  return node;
}

// ── Generation Config ───────────────────────────────────────────────────

export interface GenerateContentConfig {
  unknow0: 1;
  stopSequences: string[] | null;
  model: string;
  unknow3: number | null;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  safetySettings: SafetySetting[];
  mimeType: 'text/plain' | 'application/json';
  codeExecution: number | null;
  responseSchema: unknown | null;
  functionDeclarations: unknown[] | null;
  unknow12: number | null;
  unknow13: number | null;
  googleSearch: number | null;
  responseModalities: number[] | null;
  unknow16: number | null;
  urlContext: number | null;
  unknow18: null;
  unknow19: null;
  unknow20: null;
  unknow21: null;
  unknow22: null;
  unknow23: null;
  thinkingBudget: number | null;
  googleSearchRetrieval: number[] | null;
}

// ── User / Prompt Metadata ──────────────────────────────────────────────

export interface UserInfo {
  name: string;
  unknow1: 1;
  avatar: string;
}

export interface PromptMetadata {
  title: string;
  unknow1: null;
  user: UserInfo;
  unknow3: null;
  unknow4: [[string, number], UserInfo];
  unknow5: [number, number, number];
  unknow6: null;
  unknow7: null;
  unknow8: null;
  unknow9: null;
  unknow10: null[] | null;
}

// ── Inline Data (images, files) ─────────────────────────────────────────

export interface Blob {
  mimeType: string;
  data: string;         // base64-encoded
  displayName?: string;
}

// ── Content (Conversation Turns) ────────────────────────────────────────

export interface PromptContent {
  text: string | null;
  imageId: null;
  videoId: null;
  fileId: [string] | null;
  unknow4: null;
  audio: null;
  image: null;
  video: null;
  role: 'user' | 'model';
  unknow9: null;
  codeExecutionData: null;
  codeExecutionResult: null;
  generatedImage: Blob | null;
  youtube: null;
  unknow14: null;
  unknow15: number | null;
  isModel: number | null;
  generatedAudio: null;
  tokens: number | null;
  unknow19: null;
  functionCall: null;
  unknow21: null;
  unknow22: null;
  generatedFile: Blob | null;
  unknow24: null;
  unknow25: null;
  unknow26: null;
  thoughtSignature: string[] | null;
}

export interface PromptRecord {
  history: PromptContent[];
  input: PromptContent[] | null;
}

// ── Prompt Info (the full prompt document) ──────────────────────────────

export interface PromptInfo {
  uri: string;
  unknow1: number | null;
  unknow2: number | null;
  generationConfig: GenerateContentConfig;
  promptMetadata: PromptMetadata;
  unknow5: null;
  unknow6: null;
  unknow7: null;
  unknow8: null;
  unknow9: null;
  unknow10: null;
  unknow11: null;
  systemInstruction: string[] | null;
  contents: PromptRecord;
}

export interface PromptHistory {
  prompt: PromptInfo;
}

// ═══════════════════════════════════════════════════════════════════════
// Serialization: flatten dataclass → positional array
// ═══════════════════════════════════════════════════════════════════════

type FlatValue = string | number | boolean | null | FlatValue[];

/**
 * Flatten an object into AI Studio's positional array format.
 * Fields are serialized by their declaration order. Trailing nulls are trimmed.
 */
export function flatten(data: unknown): FlatValue {
  if (data === null || data === undefined) return null;
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') return data;

  if (Array.isArray(data)) {
    return data.map(item => flatten(item)) as FlatValue[];
  }

  if (typeof data === 'object') {
    const values = Object.values(data);
    const result: FlatValue[] = values.map(v => flatten(v));
    // Trim trailing nulls (AI Studio convention)
    while (result.length > 0 && result[result.length - 1] === null) {
      result.pop();
    }
    return result;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// Factory Functions
// ═══════════════════════════════════════════════════════════════════════

export function createPromptContent(
  role: 'user' | 'model',
  text: string | null,
  opts?: { fileId?: string },
): PromptContent {
  return {
    text,
    imageId: null,
    videoId: null,
    fileId: opts?.fileId ? [opts.fileId] : null,
    unknow4: null,
    audio: null,
    image: null,
    video: null,
    role,
    unknow9: null,
    codeExecutionData: null,
    codeExecutionResult: null,
    generatedImage: null,
    youtube: null,
    unknow14: null,
    unknow15: null,
    isModel: null,
    generatedAudio: null,
    tokens: null,
    unknow19: null,
    functionCall: null,
    unknow21: null,
    unknow22: null,
    generatedFile: null,
    unknow24: null,
    unknow25: null,
    unknow26: null,
    thoughtSignature: null,
  };
}

export function createGenerationConfig(
  model: string,
  options: {
    // NOTE: Temperature is NOT in GenerateContentConfig — it's a UI-only setting
    // set via the temperature slider in the injection path's triggerGeneration()
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    thinkingBudget?: number;
    googleSearch?: boolean;
    urlContext?: boolean;
    codeExecution?: boolean;
    /** Gemini function declarations (mapped from OpenAI tools). */
    functionDeclarations?: Array<{ name: string; description?: string; parameters?: Record<string, unknown> }>;
    /** Response MIME type: 'text/plain' or 'application/json' for structured output. */
    responseMimeType?: 'text/plain' | 'application/json';
    /** JSON Schema for structured output (when responseMimeType is 'application/json'). */
    responseSchema?: Record<string, unknown>;
    safetySettings?: SafetySetting[];
    /** Response modalities — set [TEXT, IMAGE] for image generation models */
    responseModalities?: ResponseModality[];
  } = {},
): GenerateContentConfig {
  return {
    unknow0: 1,
    stopSequences: options.stopSequences ?? null,
    model: model.startsWith('models/') ? model : `models/${model}`,
    unknow3: null,
    topP: options.topP ?? 0.95,
    topK: options.topK ?? 64,
    maxOutputTokens: options.maxOutputTokens ?? 65536,
    safetySettings: options.safetySettings ?? [
      { unknow0: null, unknow1: null, category: HarmCategory.HARASSMENT, threshold: HarmBlockThreshold.OFF },
      { unknow0: null, unknow1: null, category: HarmCategory.HATE, threshold: HarmBlockThreshold.OFF },
      { unknow0: null, unknow1: null, category: HarmCategory.SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.OFF },
      { unknow0: null, unknow1: null, category: HarmCategory.DANGEROUS_CONTENT, threshold: HarmBlockThreshold.OFF },
    ],
    mimeType: options.responseMimeType ?? 'text/plain',
    codeExecution: options.codeExecution ? 1 : null,
    responseSchema: options.responseSchema ? jsonSchemaToWire(options.responseSchema) : null,
    functionDeclarations: options.functionDeclarations ?? null,
    unknow12: null,
    unknow13: null,
    googleSearch: options.googleSearch ? 1 : null,
    responseModalities: options.responseModalities ?? null,
    unknow16: null,
    urlContext: options.urlContext ? 1 : null,
    unknow18: null,
    unknow19: null,
    unknow20: null,
    unknow21: null,
    unknow22: null,
    unknow23: null,
    thinkingBudget: options.thinkingBudget ?? null,
    googleSearchRetrieval: options.googleSearch ? [] : null,
  };
}

export function createPromptHistory(
  promptId: string,
  model: string,
  turns: PromptContent[],
  systemInstruction: string[] | null,
  generationConfig: GenerateContentConfig,
): PromptHistory {
  const userInfo: UserInfo = { name: 'user', unknow1: 1, avatar: '' };

  const promptMetadata: PromptMetadata = {
    title: promptId,
    unknow1: null,
    user: userInfo,
    unknow3: null,
    unknow4: [['', 0], userInfo],
    unknow5: [1, 1, 1],
    unknow6: null,
    unknow7: null,
    unknow8: null,
    unknow9: null,
    unknow10: null,
  };

  const promptInfo: PromptInfo = {
    uri: `prompts/${promptId}`,
    unknow1: null,
    unknow2: null,
    generationConfig,
    promptMetadata,
    unknow5: null,
    unknow6: null,
    unknow7: null,
    unknow8: null,
    unknow9: null,
    unknow10: null,
    unknow11: null,
    systemInstruction,
    contents: {
      history: turns,
      input: null,
    },
  };

  return { prompt: promptInfo };
}
