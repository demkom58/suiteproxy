import { useDb } from "~~/server/utils/suite";

export default defineEventHandler(async (event) => {
  const db = useDb();
  return db.query("SELECT id, creds, last_sync, limited_until FROM accounts").all();
});