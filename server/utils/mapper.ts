import type { OpenAIChatRequest } from "~~/server/types/openai";

export function mapToAlkaliRpc(aiReq: OpenAIChatRequest, atToken: string): any[] {
  // Map Chat History to [ [[null, text]], role ]
  const contents = aiReq.messages.filter(m => m.role !== 'system').map(m => {
    return [
      [[null, m.content]], 
      m.role === "assistant" ? "model" : "user"
    ];
  });

  // Generation Config Array [null, null, null, max_tokens, temp, top_p, top_k, ...]
  const config = [
    null, null, null, 
    aiReq.max_tokens || 32768, 
    aiReq.temperature || 1, 
    aiReq.top_p || 0.95, 
    64, // topK default
    null, null, null, null, null, null, 
    1,   // candidate_count
    [2, 1] // magic flags seen in your logs
  ];

  return [
    `models/${aiReq.model || 'gemini-1.5-flash'}`,
    contents,
    null, // System instruction (can be nested here if needed)
    config,
    atToken, // CSRF token inside the array
    null, null, null, null, null, 1
  ];
}