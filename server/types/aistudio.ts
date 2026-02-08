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
  // Resolve type — handle missing type, array types, and anyOf/oneOf unions
  let typeStr = schema.type as string | string[] | undefined;

  // Array type like ["string", "null"] → pick the non-null type, mark nullable
  let impliedNullable = false;
  if (Array.isArray(typeStr)) {
    const nonNull = typeStr.filter(t => t !== 'null');
    impliedNullable = typeStr.length !== nonNull.length;
    typeStr = nonNull[0] || 'string';
  }

  // anyOf/oneOf with [{type: X}, {type: "null"}] → extract the real type
  if (!typeStr && (schema.anyOf || schema.oneOf)) {
    const variants = (schema.anyOf || schema.oneOf) as Record<string, unknown>[];
    if (Array.isArray(variants)) {
      const nonNull = variants.filter(v => v.type !== 'null');
      if (nonNull.length === 1 && typeof nonNull[0] === 'object') {
        // Merge the resolved variant into the current schema and recurse
        const merged = { ...schema, ...nonNull[0] };
        delete merged.anyOf;
        delete merged.oneOf;
        if (variants.length !== nonNull.length) merged.nullable = true;
        return jsonSchemaToWire(merged);
      }
      // Multiple non-null variants — fall back to STRING
      typeStr = 'string';
    }
  }

  // If type is still missing but properties exist, infer object
  if (!typeStr && schema.properties) typeStr = 'object';
  // If type is still missing but items exist, infer array
  if (!typeStr && schema.items) typeStr = 'array';
  // If type is still missing but enum exists, infer string
  if (!typeStr && schema.enum) typeStr = 'string';
  // Default fallback
  if (!typeStr || typeof typeStr !== 'string') typeStr = 'string';

  const typeNum = JSON_SCHEMA_TYPE_MAP[typeStr] ?? null;

  // Start with 23 slots (up to property_ordering at index 22)
  const node: unknown[] = new Array(23).fill(null);
  node[0] = typeNum;

  // [1] format
  if (schema.format && typeof schema.format === 'string') node[1] = schema.format;

  // [2] description
  if (schema.description && typeof schema.description === 'string') node[2] = schema.description;

  // [3] nullable
  if (schema.nullable || impliedNullable) node[3] = true;

  // [4] enum values — AI Studio only accepts string enums
  if (schema.enum && Array.isArray(schema.enum)) {
    const stringEnums = (schema.enum as unknown[]).map(v => String(v));
    if (stringEnums.length > 0) node[4] = stringEnums;
  }

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

/**
 * Prepare function declarations for embedding in GenerateContentConfig.
 *
 * These objects will be run through `flatten()` which converts objects
 * to positional arrays via `Object.values()`. So the key order must
 * match the proto field order:
 *   position 0 = name
 *   position 1 = description
 *   position 2 = parameters (as wire-format array from jsonSchemaToWire)
 *
 * We pre-convert `parameters` to wire format here because `flatten()`
 * would otherwise do `Object.values()` on the raw JSON Schema — which
 * produces garbage since JSON Schema keys don't map to proto positions.
 */
export function prepareFunctionDeclarations(
  decls: Array<{ name: string; description?: string; parameters?: Record<string, unknown> }>,
): unknown[] {
  return decls.map(decl => {
    const params = decl.parameters
      ? jsonSchemaToWire(sanitizeToolSchema(decl.parameters))
      : null;
    // Return as object with ordered keys that flatten() will convert.
    // flatten() does Object.values() which preserves insertion order.
    return {
      name: decl.name,
      description: decl.description ?? null,
      parameters: params, // already in wire format — flatten() will pass arrays through as-is
    };
  });
}

/**
 * Sanitize a JSON Schema for AI Studio compatibility.
 * Strips fields that AI Studio's protobuf format doesn't understand:
 * $schema, additionalProperties, $defs/$ref, title, default, examples, etc.
 */
function sanitizeToolSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};

  // Copy only fields that jsonSchemaToWire understands
  if (schema.type !== undefined) clean.type = schema.type;
  if (schema.format !== undefined) clean.format = schema.format;
  if (schema.description !== undefined) clean.description = schema.description;
  if (schema.nullable !== undefined) clean.nullable = schema.nullable;
  if (schema.enum !== undefined) clean.enum = schema.enum;
  if (schema.required !== undefined) clean.required = schema.required;
  if (schema.anyOf !== undefined) clean.anyOf = (schema.anyOf as Record<string, unknown>[]).map(v =>
    typeof v === 'object' && v !== null ? sanitizeToolSchema(v as Record<string, unknown>) : v,
  );
  if (schema.oneOf !== undefined) clean.oneOf = (schema.oneOf as Record<string, unknown>[]).map(v =>
    typeof v === 'object' && v !== null ? sanitizeToolSchema(v as Record<string, unknown>) : v,
  );

  // Recursively sanitize items
  if (schema.items && typeof schema.items === 'object') {
    clean.items = sanitizeToolSchema(schema.items as Record<string, unknown>);
  }

  // Recursively sanitize properties
  if (schema.properties && typeof schema.properties === 'object') {
    const props = schema.properties as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(props)) {
      sanitized[k] = typeof v === 'object' && v !== null
        ? sanitizeToolSchema(v as Record<string, unknown>)
        : v;
    }
    clean.properties = sanitized;
  }

  return clean;
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

// ── Thinking Level (for Gemini 3.x level-based models) ──────────────────
// Maps reasoning_effort to the wire format level number used in the RPC's
// thinkingConfig: [1, null, null, LEVEL].
// NOTE: These levels are NOT used in the PromptHistory (which uses thinkingBudget).
// They are set via localStorage and the AI Studio UI thinking level dropdown.

export enum ThinkingLevelValue {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

/** Map string thinking level names to wire format level numbers. */
export function thinkingLevelToWireValue(level: string): ThinkingLevelValue {
  switch (level.toLowerCase()) {
    case 'low':
    case 'minimal':
      return ThinkingLevelValue.LOW;
    case 'medium':
      return ThinkingLevelValue.MEDIUM;
    case 'high':
    default:
      return ThinkingLevelValue.HIGH;
  }
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
    /** Numeric thinking budget for Gemini 2.5 budget-based models. */
    thinkingBudget?: number;
    /** Named thinking level for Gemini 3.x level-based models ('low'|'medium'|'high'). */
    thinkingLevel?: string;
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
    functionDeclarations: options.functionDeclarations && options.functionDeclarations.length > 0
      ? prepareFunctionDeclarations(options.functionDeclarations)
      : null,
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
