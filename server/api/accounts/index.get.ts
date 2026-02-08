import { useDb } from "~~/server/utils/suite";

export default defineEventHandler(async (event) => {
  const db = useDb();
  // Fetch only necessary info for the UI
  return db.query("SELECT id, last_sync, limited_until FROM accounts").all();
});