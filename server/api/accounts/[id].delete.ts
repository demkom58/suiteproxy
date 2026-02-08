// server/api/accounts/[id].delete.ts
import { useDb } from "~~/server/utils/suite";
import { accountBus, ACTIONS } from "~~/server/utils/bus";

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, 'id');
  if (!rawId) throw createError({ statusCode: 400, message: "ID required" });

  // Decode to handle email addresses correctly
  const id = decodeURIComponent(rawId);
  
  const db = useDb();
  
  // 1. Delete from SQLite
  db.run("DELETE FROM accounts WHERE id = ?", [id]);
  
  // 2. TRIGGER SSE: Tell the UI to refresh
  accountBus.emit(ACTIONS.ACCOUNTS_CHANGED);

  return { success: true };
});