import { useDb } from "~~/server/utils/suite";

export default defineEventHandler(async () => {
  const db = useDb();
  return db.query("SELECT id, creds, last_sync, limited_until, fingerprint, proxy FROM accounts").all();
});