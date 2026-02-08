import { useDb, generateTripleHash } from "~~/server/utils/suite";

export default defineEventHandler(async (event) => {
  const db = useDb();
  const body = await readBody(event);
  const creds = JSON.parse(db.query("SELECT creds FROM accounts LIMIT 1").get().creds);
  
  const sapisid = creds.cookie.match(/SAPISID=([^;]+)/)?.[1];
  const url = "https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateContent";

  // Construct the nested RPC array payload
  const rpcPayload = [
    `models/${body.model || 'gemini-1.5-flash'}`,
    body.messages.map((m: any) => [ [[null, m.content]], m.role === 'assistant' ? 'model' : 'user' ]),
    null,
    [null, null, null, body.max_tokens || 32768, body.temperature || 1, 0.95, 64, null, null, null, null, null, null, 1, [2, 1]],
    creds.at,
    null, null, null, null, null, 1
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": await generateTripleHash(sapisid!),
      "X-Goog-Api-Key": creds.api_key,
      "X-Goog-AuthUser": creds.authUser,
      "X-Goog-Api-Client": `gl-js/auth2_${creds.build}`,
      "X-Goog-Ext-519733851-bin": "CAASA1JVQRgBMAE4BEAA", // Magic session header from your log
      "Content-Type": "application/json+protobuf",
      "Origin": "https://aistudio.google.com",
      "Referer": "https://aistudio.google.com/",
      "Cookie": creds.cookie
    },
    body: JSON.stringify(rpcPayload)
  });

  const data = await response.json();

  // RPC structure parsing: index [0] is candidate, index [0][0][1] is usually text
  const content = data[0]?.[0]?.[0]?.[0]?.[1] || "Error: No response from Google RPC";

  return {
    id: `chatcmpl-${Date.now()}`,
    choices: [{ message: { role: "assistant", content }, finish_reason: "stop" }]
  };
});