import { useDb } from "~~/server/utils/suite";
import { accountBus, ACTIONS } from "~~/server/utils/bus";

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "https://aistudio.google.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  });

  if (event.method === 'OPTIONS') return null;

  const rawId = getRouterParam(event, 'id');
  const id = decodeURIComponent(rawId || "");
  const body = await readBody(event);

  if (!id || !body) throw createError({ statusCode: 400 });

  const db = useDb();
  // INSERT OR REPLACE handles the "Update existing email" requirement
  db.run(
    "INSERT OR REPLACE INTO accounts (id, creds, last_sync, limited_until) VALUES (?, ?, ?, ?)", 
    [id, JSON.stringify(body), Date.now(), 0]
  );

  // Broadcast to all listeners (including those in other tabs/incognito)
  accountBus.emit(ACTIONS.ACCOUNTS_CHANGED);

  return { success: true };
});