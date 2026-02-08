import { useDb, generateTripleHash } from "~~/server/utils/suite";

export default defineEventHandler(async (event) => {
  const db = useDb();
  const accRow: any = db.query("SELECT * FROM accounts LIMIT 1").get();
  if (!accRow) throw createError({ statusCode: 503 });

  const creds = JSON.parse(accRow.creds);
  const sapisid = creds.cookie.match(/SAPISID=([^;]+)/)?.[1];

  // THE INTERNAL RPC ENDPOINT (from your curl log)
  const url = "https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/ListModels";

  const response = await fetch(url, {
    method: "POST", // RPC is always POST
    headers: {
      "Authorization": await generateTripleHash(sapisid!),
      "X-Goog-Api-Key": creds.api_key,
      "X-Goog-AuthUser": creds.authUser,
      "X-Goog-Api-Client": `gl-js/auth2_${creds.build}`,
      "Content-Type": "application/json+protobuf",
      "Cookie": creds.cookie
    },
    body: "[]" // Empty array is the RPC command for 'ListAll'
  });

  const data = await response.json();
  // RPC returns an array of models at index [0]
  return {
    object: "list",
    data: (data[0] || []).map((m: any) => ({
      id: m[0].split('/').pop(),
      owned_by: "google"
    }))
  };
});