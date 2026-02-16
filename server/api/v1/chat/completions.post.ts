import { useDb, getSapiFromCookie } from "~~/server/utils/suite";
import { createMakerSuiteClient } from "~~/server/lib/makersuite-client";
import type { AccountRecord, SuitemakerCreds } from "~~/shared/types";
import type { OpenAIChatRequest } from "~~/server/types/openai";

export default defineEventHandler(async (event) => {
  const db = useDb();
  const body = await readBody<OpenAIChatRequest>(event);
  const bearer = getHeader(event, "authorization")?.replace("Bearer ", "");

  console.log(`[API] 📨 Chat Completion Request: ${body.model}`);

  // 1. Account Selection
  const accRow = (
    bearer
      ? db.query("SELECT * FROM accounts WHERE id = ?").get(bearer)
      : db.query("SELECT * FROM accounts WHERE limited_until < ? ORDER BY last_sync ASC LIMIT 1").get(Date.now())
  ) as AccountRecord | undefined;

  if (!accRow) {
    console.error("[API] ❌ No available accounts found.");
    throw createError({ statusCode: 503, statusMessage: "No accounts available" });
  }

  const creds: SuitemakerCreds = JSON.parse(accRow.creds);
  const sapisid = getSapiFromCookie(creds.cookie);

  console.log(`[API] 👤 Using Account: ${accRow.id}`);
  console.log(`[API] 🔑 API Key: ${creds.api_key.substring(0, 8)}...`);
  console.log(`[API] 👥 AuthUser: ${creds.authUser || '(not set)'}`);
  console.log(`[API] 🍪 SAPISID: ${sapisid ? 'Present' : 'MISSING'}`);
  console.log(`[API] 🍪 Cookie length: ${creds.cookie.length} bytes`);
  console.log(`[API] 🍪 Has __Secure-3PAPISID: ${creds.cookie.includes('__Secure-3PAPISID')}`);
  console.log(`[API] 🍪 Has __Secure-1PAPISID: ${creds.cookie.includes('__Secure-1PAPISID')}`);

  if (!sapisid) {
    console.error("[API] ❌ Account has invalid cookies (Missing SAPISID).");
    throw createError({ statusCode: 401, statusMessage: "Account cookies invalid" });
  }

  // 2. Create Client
  const client = createMakerSuiteClient({ creds, debug: true });

  // 3. Convert OpenAI to Google Format
  const systemMsg = body.messages.find((m) => m.role === "system");
  const chatMsgs = body.messages.filter((m) => m.role !== "system");

  const contents = chatMsgs.map((msg) => {
    // Map "assistant" to "model"
    const role = msg.role === "assistant" ? ("model" as const) : ("user" as const);

    if (typeof msg.content === "string") {
      return { role, parts: [{ text: msg.content }] };
    }

    // Handle multimodal arrays
    const parts = msg.content.map((part) => {
      if (part.type === "text") {
        return { text: part.text };
      }
      if (part.type === "image_url") {
        const base64Data = part.image_url.url.split(",")[1] || "";
        return { inlineData: { mimeType: "image/png", data: base64Data } };
      }
      return { text: "" };
    });

    return { role, parts };
  });

  // Inject system message into the first user prompt
  if (systemMsg && contents.length > 0 && contents[0] && contents[0].role === "user") {
    const systemText = typeof systemMsg.content === "string" 
      ? systemMsg.content 
      : systemMsg.content.map((c) => c.type === "text" ? c.text : "").join("\n");

    const firstPart = contents[0].parts[0];
    if (firstPart && "text" in firstPart && typeof firstPart.text === "string") {
      firstPart.text = `${systemText}\n\n${firstPart.text}`;
    } else {
      contents[0].parts.unshift({ text: systemText });
    }
  }

  // 4. Execution
  try {
    const start = Date.now();
    
    // Map OpenAI models to Google internal IDs if needed
    let targetModel = body.model;
    if (targetModel === "gpt-4o" || targetModel === "gpt-4") targetModel = "gemini-2.0-flash-exp";
    
    console.log(`[API] 🔄 Generating content with ${targetModel}...`);

    const response = await client.generateContent({
      model: targetModel,
      contents,
      generationConfig: {
        temperature: body.temperature ?? 1.0,
        maxOutputTokens: body.max_tokens || 65536,
        topP: body.top_p ?? 0.95,
      },
    });

    const duration = Date.now() - start;
    console.log(`[API] ✅ Success! Duration: ${duration}ms`);

    // 5. Response Formatting
    const content = response.candidates[0]?.content.parts
      .map((p) => p.text || "")
      .filter(Boolean)
      .join("") || "";

    return {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: body.model,
      choices: [{ 
        index: 0, 
        message: { role: "assistant", content }, 
        finish_reason: "stop" 
      }],
      usage: {
        prompt_tokens: 0, // Metadata might be missing in some RPC responses
        completion_tokens: 0,
        total_tokens: 0,
      },
    };

  } catch (error: any) {
    console.error(`[API] 💥 Error: ${error.message}`);
    
    // Handle Rate Limits
    if (error.message.includes("429") || error.message.includes("Resource has been exhausted")) {
      console.warn(`[API] Account ${accRow.id} rate limited. Pausing for 60s.`);
      db.run("UPDATE accounts SET limited_until = ? WHERE id = ?", [Date.now() + 60000, accRow.id]);
      throw createError({ statusCode: 429, statusMessage: "Rate limit exceeded" });
    }

    // Handle Auth Failures
    if (error.message.includes("401") || error.message.includes("403")) {
      console.error(`[API] Auth invalid for ${accRow.id}. Check BotGuard generation or Cookie validity.`);
      throw createError({ statusCode: 401, statusMessage: "Upstream Authentication Failed" });
    }

    throw createError({ statusCode: 500, statusMessage: error.message || "Internal server error" });
  }
});