import { getSapiFromCookie, generateTripleHash } from "~~/server/utils/suite";
import type { SuitemakerCreds } from "~~/shared/types";
import { BotGuardService } from "./botguard";
import { createHash } from "node:crypto";

export interface MakerSuiteConfig {
  creds: SuitemakerCreds;
  debug?: boolean;
}

export interface GenerateContentOptions {
  model: string;
  contents: Array<{
    role: "user" | "model";
    parts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface GenerateContentResponse {
  candidates: Array<{
    content: {
      role: "model";
      parts: Array<{ text?: string }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class MakerSuiteClient {
  private creds: SuitemakerCreds;
  private debug: boolean;
  // The endpoint to call FROM the browser
  private endpoint = "https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateContent";

  constructor(config: MakerSuiteConfig) {
    this.creds = config.creds;
    this.debug = config.debug || false;
  }

  async generateContent(options: GenerateContentOptions): Promise<GenerateContentResponse> {
    if (this.debug) console.log(`[MakerSuiteClient] Preparing request for ${options.model}...`);

    const sapisid = getSapiFromCookie(this.creds.cookie);
    if (!sapisid) throw new Error("Invalid cookies - SAPISID not found");

    const authHash = await generateTripleHash(sapisid);
    
    if (this.debug) {
        console.log(`[MakerSuiteClient] SAPISID: ${sapisid.substring(0, 10)}...`);
        console.log(`[MakerSuiteClient] Auth Hash: ${authHash.substring(0, 60)}...`);
    }
    
    // 1. Calculate Content Binding Hash
    // From JS trace: _.l5a extracts ALL text parts from ALL messages via .xg().map(_.rj)
    // Then joins with space and computes SHA-256 hex hash
    // Example: ["Hi!", "Hello! How can I help you today?", "", "!"] -> "Hi! Hello! How can I help you today?  !"
    // The empty string "" comes from model response metadata parts (the base64 encoded part)
    // _.rj returns getText() for text parts, "" for non-text parts
    const allTextParts: string[] = [];
    for (const content of options.contents) {
        for (const part of content.parts) {
            if (part.text !== undefined) {
                allTextParts.push(part.text);
            } else {
                // Non-text parts (inlineData etc.) return "" in _.rj
                allTextParts.push("");
            }
        }
    }
    
    const combinedText = allTextParts.join(" ");
    
    // SHA-256 hash of the combined text - this is the content binding  
    // From trace: _.Vu uses TextEncoder + SHA-256 -> hex string
    const contentBindingHash = createHash('sha256').update(combinedText).digest('hex');
    
    // Content binding structure: { Kgb: { content: "<sha256-hex>" } }
    // From JS trace: a.F.snapshot({ Kgb: { content: b } }) where b is the hash
    const binding = {
        Kgb: {
            content: contentBindingHash
        }
    };
    
    if (this.debug) {
        console.log(`[MakerSuiteClient] Content Binding Hash: ${contentBindingHash}`);
        console.log(`[MakerSuiteClient] Combined text: "${combinedText.substring(0, 100)}${combinedText.length > 100 ? '...' : ''}"`);
        console.log(`[MakerSuiteClient] Text parts count: ${allTextParts.length}`);
    }

    // 2. Prepare RPC Payload (Token placeholder at index 4)
    // We construct the raw array format that Google's internal API expects
    const googleContents = options.contents.map((c) => {
      const parts = c.parts.map((p) => {
        if (p.text !== undefined) return [null, p.text];
        if (p.inlineData) return [null, null, p.inlineData];
        return [null, ""];
      });
      return [parts, c.role];
    });

    // Default Safety Settings
    const safety = options.safetySettings || [
        [null,null,7,5], // Harassment
        [null,null,8,5], // Hate Speech
        [null,null,9,5], // Sexually Explicit
        [null,null,10,5] // Dangerous Content
    ];

    const rpcPayload = [
      options.model.startsWith("models/") ? options.model : `models/${options.model}`, // [0] Model
      googleContents, // [1] Content
      safety,         // [2] Safety
      [               // [3] Generation Config
        null, null, null, 
        options.generationConfig?.maxOutputTokens || 65536,
        options.generationConfig?.temperature !== undefined ? options.generationConfig.temperature : 1,
        options.generationConfig?.topP !== undefined ? options.generationConfig.topP : 0.95,
        options.generationConfig?.topK || 64,
        null, null, null, null, null, null,
        options.generationConfig?.candidateCount || 1,
        null, null,
        [1, null, null, 3] // Magic flags
      ],
      "", // [4] Placeholder for PO Token (Injected by Browser Worker)
      null,
      [[null,null,null,[]]], // [6] Tools
      null, null, null, 1, null, null,
      [[null,null,"Europe/Kyiv"]] // [13] Timezone
    ];

    // 3. Delegate to Browser Worker
    // We instantiate the service here. It uses a singleton browser instance internally.
    const bgService = new BotGuardService({
        userAgent: this.creds.userAgent,
        cookies: this.creds.cookie,
        authUser: this.creds.authUser,
    });

    if (this.debug) console.log(`[MakerSuiteClient] Offloading execution to BotGuard Worker...`);

    try {
        // This function:
        // 1. Injects the BotGuard script into the browser
        // 2. Generates the PO token bound to our hash
        // 3. Inserts the token into rpcPayload[4]
        // 4. Executes fetch() inside the browser with correct cookies/headers
        const rawResponse = await bgService.executeGenerateContent(
            binding,
            rpcPayload,
            this.endpoint,
            authHash,
            this.creds.api_key // Pass the USER'S API key for the final request
        );

        if (this.debug) console.log(`[MakerSuiteClient] Worker returned. Processing response...`);

        // 4. Parse Response
        // The response from Google is a nested array structure.
        // It might be wrapped in an outer array [0, [...]] or returned directly.
        const innerPayload = Array.isArray(rawResponse) && typeof rawResponse[0] === 'number' 
            ? rawResponse[1] 
            : rawResponse[0];
            
        const responseText = this.findResponseString(innerPayload) || '';

        if (!responseText && this.debug) {
            console.warn("[MakerSuiteClient] No text found in response structure:", JSON.stringify(innerPayload).substring(0, 200));
        }

        return {
            candidates: [{
                content: { role: "model", parts: [{ text: responseText }] },
                finishReason: "stop"
            }],
            usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 }
        };

    } catch (e: any) {
        console.error("[MakerSuiteClient] Critical Failure:", e.message);
        throw e;
    }
  }

  // Recursive helper to find the text response in the unknown nested array structure
  private findResponseString(obj: any): string | null {
    if (Array.isArray(obj)) {
      // Look for pattern: [null, "text content"] which is standard for Google RPC text fields
      if (obj.length > 1 && typeof obj[1] === "string" && obj[0] === null) {
        // Filter out model names or IDs that might appear in the response
        if (obj[1].length > 20 && (obj[1].startsWith("models/") || obj[1].startsWith("v1_"))) {
            return null;
        }
        if (obj[1].length > 0) return obj[1];
      }
      // Recursively search nested arrays
      for (const item of obj) {
        const found = this.findResponseString(item);
        if (found) return found;
      }
    }
    return null;
  }
}

export function createMakerSuiteClient(config: MakerSuiteConfig): MakerSuiteClient {
  return new MakerSuiteClient(config);
}