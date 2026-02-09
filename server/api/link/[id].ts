import { useDb } from "~~/server/utils/suite";
import { accountBus, ACTIONS } from "~~/server/utils/bus";

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  if (event.method === 'OPTIONS') return null;

  const rawId = getRouterParam(event, 'id');
  const id = decodeURIComponent(rawId || "");
  const body = await readBody(event);

  if (!id || !body) throw createError({ statusCode: 400 });
  
  // Validation: Ensure SSID is present
  if (!body.cookie || !body.cookie.includes("SSID")) {
      console.warn(`[Link] Attempt to link ${id} without SSID cookie.`);
      // We accept it, but warn
  }

  const db = useDb();
  
  // Save credentials directly
  db.run(
    "INSERT OR REPLACE INTO accounts (id, creds, last_sync, limited_until) VALUES (?, ?, ?, ?)", 
    [id, JSON.stringify(body), Date.now(), 0]
  );

  accountBus.emit(ACTIONS.ACCOUNTS_CHANGED);

  return { success: true };
});