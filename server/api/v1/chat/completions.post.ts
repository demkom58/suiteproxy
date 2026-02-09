// server/api/v1/chat/completions.post.ts
import { useDb, generateTripleHash, getSapiFromCookie } from "~~/server/utils/suite";
import type { AccountRecord, SuitemakerCreds } from "~~/shared/types";
import type { OpenAIChatRequest } from "~~/server/types/openai";

export default defineEventHandler(async (event) => {
  const db = useDb();
  const body = await readBody<OpenAIChatRequest>(event);
  const bearer = getHeader(event, 'authorization')?.replace('Bearer ', '');
  
  // 1. Account Selection
  const accRow = (bearer 
    ? db.query("SELECT * FROM accounts WHERE id = ?").get(bearer)
    : db.query("SELECT * FROM accounts WHERE limited_until < ? ORDER BY last_sync ASC LIMIT 1").get(Date.now())
  ) as AccountRecord | undefined;

  if (!accRow) throw createError({ statusCode: 503, statusMessage: "No Accounts" });

  const creds: SuitemakerCreds = JSON.parse(accRow.creds);
  const sapisid = getSapiFromCookie(creds.cookie);
  if (!sapisid) throw createError({ statusCode: 401, statusMessage: "Invalid Cookies (No SAPISID)" });

  const userAgent = creds.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0";
  const authHash = await generateTripleHash(sapisid);

  console.log(`\n[DEBUG] Account: ${accRow.id}`);
  console.log(`[DEBUG] AuthUser: ${creds.authUser}`);

  // Shared fetcher
  const performRequest = async (url: string, payload: any, label: string, extraHeaders: Record<string, string> = {}) => {
    const makeCall = async (authUser: string) => {
        const headers: Record<string, string> = {
            "Authorization": authHash,
            "X-Goog-Api-Key": creds.api_key,
            "X-Goog-AuthUser": authUser,
            "X-User-Agent": "grpc-web-javascript/0.1",
            "Content-Type": "application/json+protobuf",
            "Origin": "https://aistudio.google.com",
            "Referer": "https://aistudio.google.com/",
            "User-Agent": userAgent,
            "Cookie": creds.cookie,
            ...extraHeaders
        };

        return fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
    };

    let response = await makeCall(creds.authUser || "0");

    if (response.status === 401 || response.status === 403) {
        console.warn(`[DEBUG] ${label} failed with ${response.status}. Retrying with 0...`);
        const errText = await response.text().catch(() => "No body");
        console.warn(`[DEBUG] ${label} Failure Body:`, errText);
        response = await makeCall("0");
    }
    return response;
  };

  // --- Step 1: Get Client Context Token ---
  // Note: NO X-Goog-Ext header here (based on HAR analysis)
  let clientContextToken = null;
  const tokenUrl = "https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateAccessToken";

  try {
    const tokenResp = await performRequest(tokenUrl, ["users/me"], "GenerateAccessToken");
    
    if (tokenResp.ok) {
        const tokenRaw = await tokenResp.text();
        const tokenJson = JSON.parse(tokenRaw);
        
        // Extract: [9, ["!xcal..."]] or [["!xcal..."]]
        const tokenPayload = (Array.isArray(tokenJson) && typeof tokenJson[0] === 'number') ? tokenJson[1] : tokenJson[0];
        
        if (Array.isArray(tokenPayload) && typeof tokenPayload[0] === 'string') {
            clientContextToken = tokenPayload[0];
            console.log(`[DEBUG] Context Token Extracted: ${clientContextToken.substring(0, 15)}...`);
        } else {
             console.warn("[DEBUG] Token generation returned non-token response (likely cached/not-needed):", JSON.stringify(tokenPayload));
        }
    } else {
        console.error(`[Chat] Token Gen Failed: ${tokenResp.status}`);
    }
  } catch(e) {
      console.error("[Chat] Token Gen Exception:", e);
  }

  // --- Step 2: Build Chat Payload ---
  const systemMsg = body.messages.find(m => m.role === "system");
  const chatMsgs = body.messages.filter(m => m.role !== "system");

  const googleContents = chatMsgs.map(m => {
    const parts = typeof m.content === "string" ? [{ text: m.content }] : m.content.map(p => {
        if ("image_url" in p) {
            const b64 = p.image_url.url.split(",")[1] || p.image_url.url;
            return { inlineData: { mimeType: "image/png", data: b64 } };
        }
        return { text: p.text || "" };
    });
    const internalParts = parts.map(p => {
        const arr = [null, (p as any).text, (p as any).inlineData];
        return arr.filter(x => x !== undefined);
    });
    return [ internalParts, m.role === 'assistant' ? 'model' : 'user' ];
  });

  const rpcPayload = [
    body.model.includes('/') ? body.model : `models/${body.model}`,
    googleContents,
    systemMsg ? [ [[null, systemMsg.content]], "system" ] : null,
    [
        null, null, null, 
        body.max_tokens || 8192, 
        body.temperature ?? 1, 
        body.top_p ?? 0.95, 
        64, 
        null, null, null, null, null, null, 
        1, [2, 1]
    ],
    // Index 4: Use the generated !xcal token, OR fallback to the static 'at' token (SNlM0e)
    // The HAR shows !... tokens are preferred, but SNlM0e usually works as a fallback if the session is simple.
    clientContextToken || creds.at, 
    null, null, null, null, null, 1
  ];

  // --- Step 3: Execute Chat Request ---
  // Note: WE DO add X-Goog-Ext header here
  const chatUrl = "https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateContent";

  try {
    const response = await performRequest(chatUrl, rpcPayload, "GenerateContent", {
        "X-Goog-Ext-519733851-bin": "CAASA1JVQRgBMAE4BEAA"
    });

    if (response.status === 429) {
        db.run("UPDATE accounts SET limited_until = ? WHERE id = ?", [Date.now() + 60000, accRow.id]);
        throw createError({ statusCode: 429, statusMessage: "Upstream Rate Limit" });
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Chat] Upstream Error ${response.status}: ${errorText.substring(0, 300)}`);
        throw createError({ statusCode: response.status, statusMessage: "Upstream Error" });
    }

    const rawText = await response.text();
    const jsonText = rawText.replace(/^\)]}'\n/, '');
    
    let data;
    try {
        data = JSON.parse(jsonText);
    } catch(e) {
        console.error("[Chat] JSON Parse Error. Raw:", rawText.substring(0, 200));
        throw createError({ statusCode: 502, statusMessage: "Invalid Upstream JSON" });
    }

    function findContentString(obj: any): string | null {
        if (Array.isArray(obj)) {
            if (obj.length > 1 && typeof obj[1] === 'string' && obj[0] === null) {
                if (obj[1].length > 0 && !obj[1].startsWith("models/")) return obj[1];
            }
            for (const item of obj) {
                const found = findContentString(item);
                if (found) return found;
            }
        }
        return null;
    }

    const payload = (Array.isArray(data) && typeof data[0] === 'number') ? data[1] : data[0];
    let content = payload?.[0]?.[0]?.[0]?.[1] || payload?.[0]?.[0]?.[0]?.[0]?.[1];

    if (!content) content = findContentString(payload);

    return {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: body.model,
      choices: [{ 
          index: 0, 
          message: { role: "assistant", content: content || "" }, 
          finish_reason: "stop" 
      }],
      usage: { total_tokens: 0 }
    };

  } catch (e: any) {
    console.error("[Chat] Exception:", e.message);
    throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || "Internal Server Error" });
  }
});