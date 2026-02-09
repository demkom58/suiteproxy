// server/api/v1/models.get.ts
import { useDb, generateTripleHash, getSapiFromCookie } from "~~/server/utils/suite";
import type { AccountRecord, SuitemakerCreds } from "~~/shared/types";

export default defineEventHandler(async (event) => {
  const db = useDb();
  
  const bearer = getHeader(event, 'authorization')?.replace('Bearer ', '');
  const accRow = (bearer 
    ? db.query("SELECT * FROM accounts WHERE id = ?").get(bearer)
    : db.query("SELECT * FROM accounts ORDER BY last_sync DESC LIMIT 1").get()
  ) as AccountRecord | undefined;

  if (!accRow) throw createError({ statusCode: 503, statusMessage: "No accounts connected" });

  const creds: SuitemakerCreds = JSON.parse(accRow.creds);
  const sapisid = getSapiFromCookie(creds.cookie);

  if (!sapisid) throw createError({ statusCode: 401, statusMessage: "Session Expired (No SAPISID)" });

  // Use stored UA or fallback
  const userAgent = creds.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0";
  const url = "https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/ListModels";
  const authHash = await generateTripleHash(sapisid);

  // Helper to fetch with a specific authUser index
  const doFetch = async (authUser: string) => {
    return fetch(url, {
      method: "POST",
      headers: {
        "Authorization": authHash,
        "X-Goog-Api-Key": creds.api_key,
        "X-Goog-AuthUser": authUser, // Try specific index
        "X-User-Agent": "grpc-web-javascript/0.1",
        "X-Goog-Ext-519733851-bin": "CAASA1JVQRgBMAE4BEAA",
        "Content-Type": "application/json+protobuf",
        "Origin": "https://aistudio.google.com",
        "Referer": "https://aistudio.google.com/",
        "User-Agent": userAgent,
        "Cookie": creds.cookie
      },
      body: "[]"
    });
  };

  try {
    // 1. Try with stored authUser
    let response = await doFetch(creds.authUser || "0");

    // 2. Retry with "0" if failed (common fix for multi-account cookies)
    if (response.status === 401 || response.status === 403) {
        if (creds.authUser !== "0") {
            console.warn(`[ListModels] AuthUser ${creds.authUser} failed. Retrying with 0...`);
            response = await doFetch("0");
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ListModels] Upstream Error ${response.status}: ${errorText.substring(0, 300)}`);
        throw createError({ statusCode: response.status, statusMessage: "Upstream Error" });
    }

    const rawText = await response.text();
    
    // --- DEBUG LOGGING ---
    console.log("[ListModels] Raw Response Prefix:", rawText.substring(0, 200)); 
    // ---------------------

    let data: any;
    try { 
        // Remove XSSI prefix if present
        const jsonText = rawText.replace(/^\)]}'\n/, '');
        data = JSON.parse(jsonText); 
    } catch (e) { 
        console.error("[ListModels] JSON Parse Error:", e);
        return { object: "list", data: [] }; 
    }

    // Recursive search for the models array
    // We look for an array where the first item is a string starting with "models/"
    function findModelsArray(obj: any): any[] {
        if (!Array.isArray(obj)) return [];
        
        // Is this the models list? [ ["models/gemini...", ...], ["models/...", ...] ]
        if (obj.length > 0 && Array.isArray(obj[0]) && typeof obj[0][0] === 'string' && obj[0][0].startsWith('models/')) {
            return obj;
        }

        // Search deeper
        for (const item of obj) {
            if (Array.isArray(item)) {
                const found = findModelsArray(item);
                if (found.length > 0) return found;
            }
        }
        return [];
    }

    const modelsList = findModelsArray(data);

    if (modelsList.length === 0) {
        console.warn("[ListModels] Parsed JSON but found no models array. Structure:", JSON.stringify(data, null, 2));
        return { object: "list", data: [] };
    }

    return {
      object: "list",
      data: modelsList.map((m: any) => {
        const id = m[0].split('/').pop();
        return {
          id: id,
          object: "model",
          owned_by: "google",
          description: m[1] || `Google ${id} model`
        };
      })
    };

  } catch (e: any) {
      console.error("[ListModels] Exception:", e);
      throw createError({ statusCode: e.statusCode || 500 });
  }
});