/**
 * SuiteProxy Bridge — Background Script
 * Works as both MV3 Service Worker (Chrome) and MV3 Background Script (Firefox).
 *
 * Handles:
 * - Reading all cookies (including HttpOnly) via cookies API
 * - Receiving WIZ data from content script
 * - Sending combined payload to SuiteProxy server
 * - Storing proxy URL in storage
 */

// ── Cross-browser compatibility shim ────────────────────────────────────
// Firefox uses `browser.*` (Promise-based), Chrome uses `chrome.*` (callback-based)
const B = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;

const DEFAULT_PROXY_URL = "http://localhost:3000";

// ── Message Handler ─────────────────────────────────────────────────────

B.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SYNC_ACCOUNT") {
    handleSync(message.data)
      .then((result) => sendResponse({ success: true, result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === "GET_STATUS") {
    getStatus()
      .then((status) => sendResponse(status))
      .catch(() => sendResponse({ proxyUrl: DEFAULT_PROXY_URL, lastSync: null }));
    return true;
  }

  if (message.type === "SET_PROXY_URL") {
    storageSet({ proxyUrl: message.url })
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }

  if (message.type === "TEST_CONNECTION") {
    testConnection(message.url)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

// ── Core Sync Logic ─────────────────────────────────────────────────────

async function handleSync(wizData) {
  // 1. Get proxy URL from storage
  const stored = await storageGet({ proxyUrl: DEFAULT_PROXY_URL });
  const proxyUrl = stored.proxyUrl || DEFAULT_PROXY_URL;

  // 2. Read ALL cookies for google.com domains (includes HttpOnly automatically)
  const cookies = await getAllGoogleCookies();
  if (!cookies || cookies.length === 0) {
    throw new Error("No Google cookies found. Are you logged into Google?");
  }

  // Build cookie string
  const cookieStr = cookies.map((c) => c.name + "=" + c.value).join("; ");

  // Validate critical cookies
  if (cookieStr.indexOf("SSID") === -1) {
    throw new Error("Missing SSID cookie. Please log into Google and try again.");
  }

  // 3. Build payload (matches existing /api/link/[id] format)
  const email = wizData.email || "unknown";
  const payload = {
    cookie: cookieStr,
    at: wizData.at,
    api_key: wizData.apiKey,
    build: wizData.build,
    flow_id: wizData.flowId,
    nonce: wizData.nonce,
    toggles: wizData.toggles || [],
    authUser: wizData.authUser || "0",
    userAgent: wizData.userAgent || "",
  };

  // 4. Send to proxy
  const linkUrl = proxyUrl + "/api/link/" + encodeURIComponent(email);
  const response = await fetch(linkUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Server error: " + response.status + " " + response.statusText);
  }

  // 5. Save last sync info
  await storageSet({
    lastSync: Date.now(),
    lastSyncEmail: email,
    lastSyncCookieCount: cookies.length,
  });

  return {
    email: email,
    cookieCount: cookies.length,
    hasHttpOnly: cookies.some(function (c) { return c.httpOnly; }),
  };
}

// ── Cookie Collection ───────────────────────────────────────────────────

async function getAllGoogleCookies() {
  var domains = [
    ".google.com",
    ".aistudio.google.com",
    "aistudio.google.com",
    ".accounts.google.com",
  ];

  var seen = new Map();

  for (var i = 0; i < domains.length; i++) {
    try {
      var cookies = await cookiesGetAll({ domain: domains[i] });
      for (var j = 0; j < cookies.length; j++) {
        var c = cookies[j];
        var existing = seen.get(c.name);
        if (!existing || c.domain.length > existing.domain.length) {
          seen.set(c.name, c);
        }
      }
    } catch (e) {
      // Some domains may not have cookies
    }
  }

  // Also get cookies scoped to the AI Studio URL specifically
  try {
    var urlCookies = await cookiesGetAll({ url: "https://aistudio.google.com" });
    for (var k = 0; k < urlCookies.length; k++) {
      if (!seen.has(urlCookies[k].name)) {
        seen.set(urlCookies[k].name, urlCookies[k]);
      }
    }
  } catch (e) {
    // ignore
  }

  return Array.from(seen.values());
}

// ── Status & Testing ────────────────────────────────────────────────────

async function getStatus() {
  return await storageGet({
    proxyUrl: DEFAULT_PROXY_URL,
    lastSync: null,
    lastSyncEmail: null,
    lastSyncCookieCount: 0,
  });
}

async function testConnection(url) {
  try {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 5000);
    var response = await fetch(url + "/api/health", {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      return { success: true };
    }
    return { success: false, error: "HTTP " + response.status };
  } catch (err) {
    return { success: false, error: err.message || "Connection failed" };
  }
}

// ── Cross-browser Wrappers ──────────────────────────────────────────────
// Firefox's browser.* returns Promises natively.
// Chrome's chrome.* uses callbacks (but MV3 added Promise support for most APIs).
// These wrappers ensure both work.

function storageGet(defaults) {
  return new Promise(function (resolve, reject) {
    try {
      // Try Promise-based API first (Firefox, Chrome MV3)
      var result = B.storage.local.get(defaults);
      if (result && typeof result.then === "function") {
        result.then(resolve).catch(reject);
      } else {
        // Callback-based fallback (older Chrome)
        B.storage.local.get(defaults, function (data) {
          if (B.runtime.lastError) {
            reject(new Error(B.runtime.lastError.message));
          } else {
            resolve(data);
          }
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}

function storageSet(data) {
  return new Promise(function (resolve, reject) {
    try {
      var result = B.storage.local.set(data);
      if (result && typeof result.then === "function") {
        result.then(resolve).catch(reject);
      } else {
        B.storage.local.set(data, function () {
          if (B.runtime.lastError) {
            reject(new Error(B.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}

function cookiesGetAll(query) {
  return new Promise(function (resolve, reject) {
    try {
      var result = B.cookies.getAll(query);
      if (result && typeof result.then === "function") {
        result.then(resolve).catch(reject);
      } else {
        B.cookies.getAll(query, function (cookies) {
          if (B.runtime.lastError) {
            reject(new Error(B.runtime.lastError.message));
          } else {
            resolve(cookies || []);
          }
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}
