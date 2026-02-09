// server/api/v1/chat/completions.post.ts
import { useDb, generateTripleHash, getSapiFromCookie } from "~~/server/utils/suite";
import type { AccountRecord, SuitemakerCreds } from "~~/shared/types";
import type { OpenAIChatRequest } from "~~/server/types/openai";

export default defineEventHandler(async (event) => {
  const db = useDb();
  const body = await readBody<OpenAIChatRequest>(event);
  const bearer = getHeader(event, 'authorization')?.replace('Bearer ', '');
  
  const accRow = (bearer 
    ? db.query("SELECT * FROM accounts WHERE id = ?").get(bearer)
    : db.query("SELECT * FROM accounts WHERE limited_until < ? ORDER BY last_sync ASC LIMIT 1").get(Date.now())
  ) as AccountRecord | undefined;

  if (!accRow) throw createError({ statusCode: 503, statusMessage: "No Accounts" });

  const creds: SuitemakerCreds = JSON.parse(accRow.creds);
  const sapisid = getSapiFromCookie(creds.cookie);
  if (!sapisid) throw createError({ statusCode: 401, statusMessage: "Session Expired" });

  const userAgent = creds.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0";
  const authHash = await generateTripleHash(sapisid);

  // --- Payload Construction ---
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
    // Filter undefined to match Protobuf strictness
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
    creds.at, // Token stays in Body (Index 4)
    null, null, null, null, null, 1
  ];

  // --- URL FIX: NO Query Parameters ---
  const url = "https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateContent";

  const headers = {
    "Authorization": authHash,
    "X-Goog-Api-Key": creds.api_key,
    "X-Goog-AuthUser": creds.authUser || "0",
    "X-User-Agent": "grpc-web-javascript/0.1",
    "X-Goog-Ext-519733851-bin": "CAASA1JVQRgBMAE4BEAA",
    "Content-Type": "application/json+protobuf",
    "Origin": "https://aistudio.google.com",
    "Referer": "https://aistudio.google.com/",
    "User-Agent": userAgent,
    "Cookie": creds.cookie
  };

  const doFetch = async (authUser: string) => {
    const currentHeaders = { ...headers, "X-Goog-AuthUser": authUser };
    return fetch(url, { method: "POST", headers: currentHeaders, body: JSON.stringify(rpcPayload) });
  };

  try {
    // Retry Logic for AuthUser (0 vs 1 vs 2)
    let response = await doFetch(creds.authUser || "0");

    if (response.status === 401 || response.status === 403) {
        if (creds.authUser !== "0") {
            console.warn(`[Chat] AuthUser ${creds.authUser} failed. Retrying with 0...`);
            response = await doFetch("0");
        }
    }

    if (response.status === 429) {
        db.run("UPDATE accounts SET limited_until = ? WHERE id = ?", [Date.now() + 60000, accRow.id]);
        throw createError({ statusCode: 429, statusMessage: "Upstream Rate Limit" });
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Chat] Upstream Error ${response.status}: ${errorText.substring(0, 200)}`);
        throw createError({ statusCode: response.status, statusMessage: "Upstream Error" });
    }

    // --- Response Parsing ---
    const rawText = await response.text();
    const jsonText = rawText.replace(/^\)]}'\n/, ''); // Remove XSSI prefix
    const data = JSON.parse(jsonText);

    // Deep search for response content
    function findContentString(obj: any): string | null {
        if (Array.isArray(obj)) {
            // Looking for [null, "response text", ...]
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
    // Try fast path
    let content = payload?.[0]?.[0]?.[0]?.[1] || payload?.[0]?.[0]?.[0]?.[0]?.[1];

    // Try robust path
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
    throw createError({ statusCode: e.statusCode || 500, statusMessage: "Internal Server Error" });
  }
});