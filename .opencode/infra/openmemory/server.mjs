import http from "node:http";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = process.env.DATA_DIR || "/app/data";
const PORT = parseInt(process.env.PORT || "8080");
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
const DB = join(DATA_DIR, "memories.json");

const load = () => existsSync(DB) ? JSON.parse(readFileSync(DB, "utf-8")) : { memories: [] };
const save = (db) => writeFileSync(DB, JSON.stringify(db, null, 2));
const id = () => `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// Read dashboard HTML once at startup
let dashboardHTML = "";
try { dashboardHTML = readFileSync("/app/dashboard.html", "utf-8"); } catch {}

http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Serve dashboard at root
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/dashboard")) {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(dashboardHTML);
  }

  let body = "";
  req.on("data", c => body += c);
  req.on("end", () => {
    const db = load();
    const json = (code, data) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); };

    try {
      if (url.pathname === "/health") return json(200, { status: "ok", count: db.memories.length });

      if (req.method === "POST" && url.pathname === "/api/memory/add") {
        const { content, tags, user_id, metadata } = JSON.parse(body);
        const mem = {
          id: id(),
          content,
          tags: tags || [],
          user_id: user_id || "default",
          metadata: metadata || {},
          created_at: new Date().toISOString()
        };
        db.memories.push(mem); save(db);
        return json(201, mem);
      }

      if (req.method === "POST" && url.pathname === "/api/memory/search") {
        const { query, user_id, tags, limit } = JSON.parse(body);
        const q = (query || "").toLowerCase();
        const results = db.memories
          .filter(m =>
            (!user_id || m.user_id === user_id) &&
            (!tags?.length || tags.some(t => m.tags.includes(t))) &&
            (!q || m.content.toLowerCase().includes(q))
          )
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, limit || 20);
        return json(200, { results });
      }

      if (req.method === "GET" && url.pathname === "/api/memory/list") {
        const uid = url.searchParams.get("user_id");
        const tag = url.searchParams.get("tag");
        let results = db.memories;
        if (uid) results = results.filter(m => m.user_id === uid);
        if (tag) results = results.filter(m => m.tags.includes(tag));
        return json(200, { results: results.slice(-100).reverse() });
      }

      if (req.method === "GET" && url.pathname === "/api/memory/tags") {
        const tagCounts = {};
        db.memories.forEach(m => (m.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
        return json(200, { tags: tagCounts });
      }

      if (req.method === "DELETE" && url.pathname.startsWith("/api/memory/")) {
        const mid = url.pathname.split("/").pop();
        db.memories = db.memories.filter(m => m.id !== mid); save(db);
        return json(200, { deleted: mid });
      }

      json(404, { error: "Not found" });
    } catch (e) { json(500, { error: e.message }); }
  });
}).listen(PORT, () => console.log(`OpenMemory :${PORT} — Dashboard at http://localhost:${PORT}/`));
