#!/usr/bin/env node
/**
 * Memory MCP Server — bridges OpenCode agents to OpenMemory (CaviraOSS) via stdio.
 * Tools: memory_save, memory_search, memory_list, memory_delete
 * 
 * Connects to the real OpenMemory backend (CaviraOSS/OpenMemory) running in Docker.
 * API docs: POST /api/memory/add, POST /api/memory/search, GET /api/memory/list, DELETE /api/memory/:id
 * Dashboard: http://localhost:8788
 */
import { createInterface } from "node:readline";

const API = process.env.OPENMEMORY_URL || "http://localhost:8787";
const USER = process.env.OPENMEMORY_USER || "opencode-agent";

const tools = [
  {
    name: "memory_save",
    description: "Save a memory to persistent storage. Survives across sessions. Use for: architectural decisions, resolved bugs, discovered patterns, reverse-engineering findings, user preferences. Dashboard: http://localhost:8787",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "What to remember — be specific and searchable" },
        tags: { type: "array", items: { type: "string" }, description: "Tags for categorization: decision, architecture, bug, preference, pattern, todo, proxy, api-discovery, auth-flow, reverse-engineering, botguard" },
      },
      required: ["content"],
    },
  },
  {
    name: "memory_search",
    description: "Search saved memories by keyword/phrase. Returns ranked results. Always search before starting significant work to find prior context.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query — keywords or phrases" },
        tags: { type: "array", items: { type: "string" }, description: "Filter by tags (optional)" },
        limit: { type: "number", description: "Max results (default 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "memory_list",
    description: "List recent memories. Use to review what's been stored.",
    inputSchema: { type: "object", properties: { limit: { type: "number" } } },
  },
  {
    name: "memory_delete",
    description: "Delete a memory by ID. Use to clean up outdated or incorrect memories.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
];

async function callAPI(method, path, body) {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify({ ...body, user_id: USER }) : undefined,
    });
    return await res.json();
  } catch (e) {
    return { error: `OpenMemory unreachable (${e.message}). Start with: docker compose -f .opencode/infra/docker-compose.yml up -d` };
  }
}

async function handleTool(name, args) {
  switch (name) {
    case "memory_save":
      return callAPI("POST", "/api/memory/add", {
        content: args.content,
        tags: args.tags || [],
        metadata: { source: "opencode-agent", timestamp: new Date().toISOString() }
      });
    case "memory_search":
      return callAPI("POST", "/api/memory/search", {
        query: args.query,
        tags: args.tags,
        limit: args.limit || 10
      });
    case "memory_list":
      return callAPI("GET", `/api/memory/list?user_id=${USER}`);
    case "memory_delete":
      return callAPI("DELETE", `/api/memory/${args.id}`);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

const rl = createInterface({ input: process.stdin });
const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");

rl.on("line", async (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  const { id, method, params } = msg;

  if (method === "initialize") {
    send({ jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "memory", version: "2.0.0" } } });
  } else if (method === "notifications/initialized") {
    // ok
  } else if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools } });
  } else if (method === "tools/call") {
    const result = await handleTool(params.name, params.arguments || {});
    send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } });
  } else {
    send({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } });
  }
});
