/**
 * Tests for the browser-side JSON+protobuf parser used in the network interceptor.
 *
 * The parser runs inside the browser (injected via addInitScript), so we extract
 * the pure parsing functions and test them in Node.js.
 *
 * Uses real response data captured from AI Studio's GenerateContent endpoint.
 */
import { describe, it, expect } from 'vitest';

// ── Extract parser functions from the interceptor script ─────────────────
// These are copies of the browser-side JS functions, translated to TypeScript
// for testing. Any changes to network-interceptor.ts must be reflected here.

interface TextPart {
  text: string;
  isThinking: boolean;
}

/**
 * Find all [null, "text_content", ...] patterns in a deeply nested array.
 */
function extractTextParts(arr: unknown[], maxDepth = 20): TextPart[] {
  const results: TextPart[] = [];

  function walk(item: unknown, depth: number): void {
    if (depth > maxDepth || !Array.isArray(item)) return;

    // Check if this array matches the [null, "text", ...] pattern
    if (item.length >= 2 && item[0] === null && typeof item[1] === 'string') {
      const content = item[1] as string;
      if (content.length > 0) {
        // Filter out metadata strings
        if (content.startsWith('v1_')) return;
        if (content.startsWith('http')) return;
        if (content.startsWith('models/')) return;
        if (content.includes('.google.')) return;
        // Filter base64 blobs
        if (content.length > 100) {
          const cleaned = content.replace(/\s/g, '');
          if (/^[A-Za-z0-9+/=_-]+$/.test(cleaned)) return;
        }

        const isThinking = (item as unknown[])[12] === 1;
        results.push({ text: content, isThinking });
      }
      return;
    }

    // Recurse into child arrays
    for (const child of item) {
      if (Array.isArray(child)) {
        walk(child, depth + 1);
      }
    }
  }

  walk(arr, 0);
  return results;
}

interface ParserState {
  parsedUpTo: number;
  parsedChunkCount: number;
}

/**
 * Find complete JSON array elements that we haven't parsed yet.
 * The response looks like: [[chunk1, chunk2, chunk3, metadata]]
 */
function findNewCompleteParts(fullText: string, state: ParserState): string[] {
  const results: string[] = [];
  let depth = 0;
  let inString = false;
  let escape = false;
  let elementStart = -1;
  let chunkIndex = 0;
  const targetDepth = 2;

  for (let i = 0; i < fullText.length; i++) {
    const ch = fullText.charAt(i);

    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '[') {
      depth++;
      if (depth === targetDepth + 1) {
        elementStart = i;
      }
    } else if (ch === ']') {
      if (depth === targetDepth + 1 && elementStart >= 0) {
        const elementStr = fullText.substring(elementStart, i + 1);
        chunkIndex++;

        if (chunkIndex > state.parsedChunkCount) {
          results.push(elementStr);
          state.parsedChunkCount = chunkIndex;
        }
      }
      depth--;
    }
  }

  return results;
}

interface ParseResult {
  text: string;
  thinking: string;
  error: string | null;
}

function parseAccumulatedResponse(fullText: string, state: ParserState): ParseResult {
  let text = '';
  let thinking = '';

  const newParts = findNewCompleteParts(fullText, state);

  for (const partStr of newParts) {
    try {
      const parsed = JSON.parse(partStr);
      if (Array.isArray(parsed)) {
        const extracted = extractTextParts(parsed);
        for (const part of extracted) {
          if (part.isThinking) {
            thinking += part.text;
          } else {
            text += part.text;
          }
        }
      }
    } catch {
      // Parse error
    }
  }

  return { text, thinking, error: null };
}

// ── Test Data ────────────────────────────────────────────────────────────

// Real response from AI Studio GenerateContent (from trace.md)
// Shortened version with the same structure
const REAL_RESPONSE = `[[[[[[[[null,"**Acknowledge the Response**\\n\\nI've registered the exclamation mark.\\n\\n\\n",null,null,null,null,null,null,null,null,null,null,1]],"model"]]],null,[15,null,15,null,[[1,15]]],null,null,null,null,"v1_abc123"],[[[[[[null,"It looks like you're excited! Or maybe just testing out the buttons? \\n\\nEither way,"]],"model"]]],null,[15,21,108,null,[[1,15]],null,null,null,null,72],null,null,null,null,"v1_abc123"],[[[[[[null," I'm here if you have a question or just want to chat. What's on your mind?"]],"model"]]],null,[15,43,130,null,[[1,15]],null,null,null,null,72],null,null,null,null,"v1_abc123"],[[[[[[null,"",null,null,null,null,null,null,null,null,null,null,null,null,"Es4DCssDAb4binarydata"]],"model"],1]],null,[15,43,130,null,[[1,15]],null,null,null,null,72],null,null,null,null,"v1_abc123"],[null,null,null,["1771093314497317",77875770,1764529208]]]]`;

// ── Tests ────────────────────────────────────────────────────────────────

describe('extractTextParts', () => {
  it('should extract text from a simple [null, "text"] pattern', () => {
    const parts = extractTextParts([null, 'Hello world']);
    expect(parts).toEqual([{ text: 'Hello world', isThinking: false }]);
  });

  it('should detect thinking content when index 12 is 1', () => {
    // Build a parts array with the thinking flag
    const part = new Array(13).fill(null);
    part[0] = null;
    part[1] = 'Thinking about the problem...';
    part[12] = 1;

    const parts = extractTextParts([part]);
    expect(parts).toEqual([{ text: 'Thinking about the problem...', isThinking: true }]);
  });

  it('should filter out v1_ prefixed strings', () => {
    const parts = extractTextParts([null, 'v1_abc123def456']);
    expect(parts).toEqual([]);
  });

  it('should filter out http prefixed strings', () => {
    const parts = extractTextParts([null, 'https://example.com/api']);
    expect(parts).toEqual([]);
  });

  it('should filter out models/ prefixed strings', () => {
    const parts = extractTextParts([null, 'models/gemini-2.5-flash']);
    expect(parts).toEqual([]);
  });

  it('should filter out long base64 strings', () => {
    const base64 = 'A'.repeat(200);
    const parts = extractTextParts([null, base64]);
    expect(parts).toEqual([]);
  });

  it('should NOT filter out normal long text', () => {
    const longText = 'This is a normal sentence. '.repeat(10);
    const parts = extractTextParts([null, longText]);
    expect(parts).toHaveLength(1);
    expect(parts[0]!.text).toBe(longText);
  });

  it('should filter empty strings', () => {
    const parts = extractTextParts([null, '']);
    expect(parts).toEqual([]);
  });

  it('should extract from deeply nested structure (real AI Studio format)', () => {
    // Real chunk structure: [[[[[[null,"text"]],"model"]]]
    const chunk = [[[[[[null, 'Hello! How can I help?']], 'model']]]];
    const parts = extractTextParts(chunk);
    expect(parts).toEqual([{ text: 'Hello! How can I help?', isThinking: false }]);
  });

  it('should extract thinking content from real structure', () => {
    // Thinking chunk: [[[[[[null,"thinking...",null,...,null,null,1]],"model"]]]
    const thinkingPart = new Array(13).fill(null);
    thinkingPart[1] = 'Let me think about this...';
    thinkingPart[12] = 1;
    const chunk = [[[[[[thinkingPart]], 'model']]]];
    const parts = extractTextParts(chunk);
    expect(parts).toEqual([{ text: 'Let me think about this...', isThinking: true }]);
  });

  it('should handle multiple text parts in one chunk', () => {
    // Two text parts in the same chunk
    const chunk = [
      [[[
        [
          [null, 'Part one'],
          [null, 'Part two'],
        ],
        'model',
      ]]],
    ];
    const parts = extractTextParts(chunk);
    expect(parts).toHaveLength(2);
    expect(parts[0]!.text).toBe('Part one');
    expect(parts[1]!.text).toBe('Part two');
  });

  it('should filter base64 metadata parts while keeping text', () => {
    // Mix of text and base64 metadata (like the real response)
    const base64Metadata = 'Es4DCssDAb4' + 'A'.repeat(200);
    const chunk = [
      [[[
        [
          [null, 'Real response text'],
          [null, '', null, null, null, null, null, null, null, null, null, null, null, null, base64Metadata],
        ],
        'model',
      ]]],
    ];
    const parts = extractTextParts(chunk);
    expect(parts).toHaveLength(1);
    expect(parts[0]!.text).toBe('Real response text');
  });
});

describe('findNewCompleteParts', () => {
  it('should find complete elements in a double-wrapped array', () => {
    const data = '[[["a"],["b"],["c"]]]';
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const parts = findNewCompleteParts(data, state);
    expect(parts).toEqual(['["a"]', '["b"]', '["c"]']);
    expect(state.parsedChunkCount).toBe(3);
  });

  it('should only return new parts on subsequent calls', () => {
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };

    // First call — partial response
    const partial = '[[["a"],["b"]';
    const parts1 = findNewCompleteParts(partial, state);
    expect(parts1).toEqual(['["a"]', '["b"]']);
    expect(state.parsedChunkCount).toBe(2);

    // Second call — more data arrived
    const fuller = '[[["a"],["b"],["c"],["d"]';
    const parts2 = findNewCompleteParts(fuller, state);
    expect(parts2).toEqual(['["c"]', '["d"]']);
    expect(state.parsedChunkCount).toBe(4);
  });

  it('should handle incomplete elements at the end', () => {
    const data = '[[["a"],["b"],["c';  // "c" element not complete
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const parts = findNewCompleteParts(data, state);
    expect(parts).toEqual(['["a"]', '["b"]']);
    expect(state.parsedChunkCount).toBe(2);
  });

  it('should handle strings containing brackets', () => {
    const data = '[[["text with [brackets]"],["another"]]]';
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const parts = findNewCompleteParts(data, state);
    expect(parts).toEqual(['["text with [brackets]"]', '["another"]']);
  });

  it('should handle strings containing escaped quotes', () => {
    const data = '[[["text with \\"quotes\\""],["another"]]]';
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const parts = findNewCompleteParts(data, state);
    expect(parts).toEqual(['["text with \\"quotes\\""]', '["another"]']);
  });

  it('should return empty for non-array data', () => {
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const parts = findNewCompleteParts('not json at all', state);
    expect(parts).toEqual([]);
  });

  it('should handle the real response structure', () => {
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const parts = findNewCompleteParts(REAL_RESPONSE, state);

    // The real response has 5 top-level elements:
    // 1. Thinking chunk
    // 2. Text chunk 1
    // 3. Text chunk 2
    // 4. Final chunk with metadata
    // 5. Metadata array
    expect(parts.length).toBe(5);

    // Verify each part is valid JSON
    for (const part of parts) {
      expect(() => JSON.parse(part)).not.toThrow();
    }
  });
});

describe('parseAccumulatedResponse', () => {
  it('should extract text from a simple response', () => {
    const response = '[[[[[[[[null,"Hello world"]],"model"]]]]]]';
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const result = parseAccumulatedResponse(response, state);
    expect(result.text).toBe('Hello world');
    expect(result.thinking).toBe('');
  });

  it('should extract both thinking and text from the real response', () => {
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const result = parseAccumulatedResponse(REAL_RESPONSE, state);

    // Should have thinking content (from chunk 1)
    expect(result.thinking).toContain('Acknowledge the Response');

    // Should have regular text (from chunks 2 and 3)
    expect(result.text).toContain("It looks like you're excited!");
    expect(result.text).toContain("I'm here if you have a question");
  });

  it('should incrementally parse as more data arrives', () => {
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };

    // Simulate streaming: first chunk arrives
    const chunk1 = '[[[[[[[[null,"First ",null,null,null,null,null,null,null,null,null,null,1]],"model"]]],null,[15],null,null,null,null,"v1_x"]';
    const result1 = parseAccumulatedResponse(chunk1, state);
    expect(result1.thinking).toBe('First ');
    expect(result1.text).toBe('');

    // More data arrives (accumulated)
    const chunk1and2 = chunk1 + ',[[[[[[null,"Hello!"]],"model"]]],null,[15],null,null,null,null,"v1_x"]';
    const result2 = parseAccumulatedResponse(chunk1and2, state);
    // Should only return the NEW text
    expect(result2.text).toBe('Hello!');
    expect(result2.thinking).toBe(''); // Already emitted
  });

  it('should handle empty response', () => {
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const result = parseAccumulatedResponse('', state);
    expect(result.text).toBe('');
    expect(result.thinking).toBe('');
  });

  it('should handle response with only metadata', () => {
    const response = '[[[null,null,null,["12345",100,200]]]]';
    const state: ParserState = { parsedUpTo: 0, parsedChunkCount: 0 };
    const result = parseAccumulatedResponse(response, state);
    expect(result.text).toBe('');
    expect(result.thinking).toBe('');
  });
});
