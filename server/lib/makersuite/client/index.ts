/**
 * MakerSuite API Client - Fixed Implementation
 * Supports both internal RPC API and public REST API
 */

import { AuthManager } from "../auth";
import type * as Types from "../types";

export class MakerSuiteClient {
  private auth: AuthManager;
  private endpoint: string;
  private timeout: number;
  private debug: boolean;
  private useRPC: boolean;

  constructor(config: Types.ClientConfig = {}) {
    this.auth = new AuthManager({
      apiKey: config.apiKey,
      authUser: config.authUser,
      sapisid: config.sapisid,
      sapisid1p: config.sapisid1p,
      sapisid3p: config.sapisid3p,
    });
    
    // Default to internal RPC endpoint (what AI Studio actually uses)
    this.endpoint = config.endpoint || "https://alkalimakersuite-pa.clients6.google.com";
    this.timeout = config.timeout || 60000;
    this.debug = config.debug || false;
    this.useRPC = config.useRPC !== false; // Default true
  }

  private async request<T>(path: string, data: any): Promise<T> {
    const url = `${this.endpoint}${path}`;
    const headers = this.auth.getHeaders();

    if (this.debug) {
      console.log(`[MakerSuite] POST ${url}`);
      console.log(`[MakerSuite] Headers:`, JSON.stringify(headers, null, 2));
      console.log(`[MakerSuite] Body:`, JSON.stringify(data, null, 2));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers as Record<string, string>,
        body: JSON.stringify(data),
        signal: controller.signal,
        credentials: "include", // Important for cookies
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error ${response.status}: ${error}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (this.debug) {
        console.error('[MakerSuite] Request failed:', error);
      }
      throw error;
    }
  }

  /**
   * Convert standard request format to internal RPC array format
   * This is what AI Studio actually sends
   */
  private convertToRPCFormat(req: Types.GenerateContentRequest): any[] {
    // Extract the message content
    const contents = req.contents || [];
    const firstContent = contents[0];
    const messageText = firstContent?.parts?.[0]?.text || "";
    const role = firstContent?.role || "user";
    
    // Build nested message structure: [[[[[null, text]]], role]]
    const messageStructure = [
      [
        [
          [
            [null, messageText]
          ]
        ],
        role
      ]
    ];
    
    // Safety settings in RPC format
    // [null, null, category, threshold]
    const safetySettings = [
      [null, null, 7, 5],  // HARM_CATEGORY_HARASSMENT
      [null, null, 8, 5],  // HARM_CATEGORY_HATE_SPEECH
      [null, null, 9, 5],  // HARM_CATEGORY_SEXUALLY_EXPLICIT
      [null, null, 10, 5], // HARM_CATEGORY_DANGEROUS_CONTENT
    ];
    
    // Generation config in RPC format
    const generationConfig = [
      null,
      null,
      null,
      req.generationConfig?.maxOutputTokens || 65536,
      req.generationConfig?.candidateCount || 1,
      req.generationConfig?.temperature || 0.95,
      req.generationConfig?.topK || 64,
      null,
      null,
      null,
      null,
      null,
      null,
      1,
      null,
      null,
      [1, null, null, 3]
    ];
    
    // Get logging token from auth manager
    const loggingToken = this.auth.getLoggingToken();
    
    // Timezone (can be made configurable)
    const timezone = req.timezone || "Europe/Kyiv";
    
    // Build complete RPC array
    return [
      req.model,                  // [0] Model name
      messageStructure,           // [1] Messages
      safetySettings,             // [2] Safety settings
      generationConfig,           // [3] Generation config
      loggingToken,               // [4] Logging token
      null,                       // [5] Reserved
      [[null, null, null, []]],   // [6] Unknown structure
      null,                       // [7] Reserved
      null,                       // [8] Reserved
      null,                       // [9] Reserved
      1,                          // [10] Version flag?
      null,                       // [11] Reserved
      null,                       // [12] Reserved
      [[null, null, timezone]]    // [13] Timezone
    ];
  }

  /**
   * Convert RPC response back to standard format
   */
  private convertFromRPCFormat(rpcResponse: any): Types.GenerateContentResponse {
    // RPC responses have a specific structure
    // This is a simplified conversion - adjust based on actual responses
    try {
      if (Array.isArray(rpcResponse)) {
        // Extract the text from nested arrays
        const candidates = rpcResponse[0] || [];
        const content = candidates[0] || [];
        const parts = content[0] || [];
        const text = parts[0] || "";
        
        return {
          candidates: [{
            content: {
              parts: [{ text }],
              role: "model"
            },
            finishReason: "STOP",
            index: 0
          }]
        };
      }
      return rpcResponse;
    } catch (error) {
      if (this.debug) {
        console.error('[MakerSuite] Response conversion error:', error);
      }
      return rpcResponse;
    }
  }

  // Content Generation
  async generateContent(req: Types.GenerateContentRequest): Promise<Types.GenerateContentResponse> {
    if (this.useRPC) {
      // Use internal RPC endpoint (what AI Studio uses)
      const path = "/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateContent";
      const rpcData = this.convertToRPCFormat(req);
      const response = await this.request(path, rpcData);
      return this.convertFromRPCFormat(response);
    } else {
      // Use public REST API
      return this.request(`/v1beta/${req.model}:generateContent`, {
        contents: req.contents,
        safetySettings: req.safetySettings,
        generationConfig: req.generationConfig,
      });
    }
  }

  async countTokens(req: Types.CountTokensRequest): Promise<Types.CountTokensResponse> {
    return this.request(`/v1beta/${req.model}:countTokens`, {
      contents: req.contents,
    });
  }

  async generateImage(req: Types.GenerateImageRequest): Promise<Types.GenerateImageResponse> {
    return this.request("/v1beta/models/imagen:generateImage", req);
  }

  // Streaming
  async *streamGenerateContent(req: Types.GenerateContentRequest): AsyncGenerator<Types.GenerateContentResponse> {
    if (this.useRPC) {
      const path = "/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateContent";
      const url = `${this.endpoint}${path}`;
      const headers = this.auth.getHeaders();
      const rpcData = this.convertToRPCFormat(req);

      const response = await fetch(url, {
        method: "POST",
        headers: headers as Record<string, string>,
        body: JSON.stringify(rpcData),
        credentials: "include",
      });

      if (!response.ok) throw new Error(`Stream error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() && line.startsWith("[")) {
            try {
              const parsed = JSON.parse(line);
              yield this.convertFromRPCFormat(parsed);
            } catch {}
          }
        }
      }
    } else {
      // Public API streaming
      const url = `${this.endpoint}/v1beta/${req.model}:streamGenerateContent`;
      const headers = this.auth.getHeaders();

      const response = await fetch(url, {
        method: "POST",
        headers: headers as Record<string, string>,
        body: JSON.stringify({
          contents: req.contents,
          safetySettings: req.safetySettings,
          generationConfig: req.generationConfig,
        }),
      });

      if (!response.ok) throw new Error(`Stream error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() && line.startsWith("{")) {
            try {
              yield JSON.parse(line);
            } catch {}
          }
        }
      }
    }
  }

  // Auth methods
  setApiKey(apiKey: string): void {
    this.auth.setApiKey(apiKey);
  }

  setAuthUser(authUser: number): void {
    this.auth.setAuthUser(authUser);
  }

  setBearerToken(token: string): void {
    this.auth.setBearerToken(token);
  }

  setSAPISID(sapisid: string, sapisid1p: string, sapisid3p: string): void {
    this.auth.setSAPISID(sapisid, sapisid1p, sapisid3p);
  }

  getAuth(): AuthManager {
    return this.auth;
  }

  // Configuration
  setUseRPC(useRPC: boolean): void {
    this.useRPC = useRPC;
  }

  setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }
}

export function createClient(config?: Types.ClientConfig): MakerSuiteClient {
  return new MakerSuiteClient(config);
}