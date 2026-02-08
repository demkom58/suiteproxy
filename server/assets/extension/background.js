/**
 * SuiteProxy Bridge — Background Script
 * Works as both MV3 Service Worker (Chrome) and MV3 Background Script (Firefox).
 *
 * Handles:
 * - Reading all cookies (including HttpOnly) via cookies API
 * - Receiving WIZ data from content script
 * - Sending combined payload to SuiteProxy server
 * - Storing proxy URL and API key in storage
 * - Authenticating requests with X-API-Key header
 */

// ── Cross-browser compatibility shim ────────────────────────────────────
// Firefox uses `browser.*` (Promise-based), Chrome uses `chrome.*` (callback-based)
var B = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;

var DEFAULT_PROXY_URL = "http://localhost:3000";
var DEFAULT_API_KEY = "";

// ── Message Handler ─────────────────────────────────────────────────────

B.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "SYNC_ACCOUNT") {
    handleSync(message.data)
      .then(function (result) { sendResponse({ success: true, result: result }); })
      .catch(function (err) { sendResponse({ success: false, error: err.message }); });
    return true;
  }

  if (message.type === "GET_STATUS") {
    getStatus()
      .then(function (status) { sendResponse(status); })
      .catch(function () { sendResponse({ proxyUrl: DEFAULT_PROXY_URL, apiKey: DEFAULT_API_KEY, lastSync: null }); });
    return true;
  }

  if (message.type === "SAVE_SETTINGS") {
    var settings = {};
    if (message.proxyUrl !== undefined) settings.proxyUrl = message.proxyUrl;
    if (message.apiKey !== undefined) settings.apiKey = message.apiKey;
    storageSet(settings)
      .then(function () { sendResponse({ success: true }); })
      .catch(function () { sendResponse({ success: false }); });
    return true;
  }

  // Legacy support
  if (message.type === "SET_PROXY_URL") {
    storageSet({ proxyUrl: message.url })
      .then(function () { sendResponse({ success: true }); })
      .catch(function () { sendResponse({ success: false }); });
    return true;
  }

  if (message.type === "TEST_CONNECTION") {
    testConnection(message.url, message.apiKey)
      .then(function (result) { sendResponse(result); })
      .catch(function (err) { sendResponse({ success: false, error: err.message }); });
    return true;
  }
});

// ── Core Sync Logic ─────────────────────────────────────────────────────

async function handleSync(wizData) {
  // 1. Get settings from storage
  var stored = await storageGet({ proxyUrl: DEFAULT_PROXY_URL, apiKey: DEFAULT_API_KEY });
  var proxyUrl = stored.proxyUrl || DEFAULT_PROXY_URL;
  var apiKey = stored.apiKey || DEFAULT_API_KEY;

  // 2. Read ALL cookies for google.com domains (includes HttpOnly automatically)
  var cookies = await getAllGoogleCookies();
  if (!cookies || cookies.length === 0) {
    throw new Error("No Google cookies found. Are you logged into Google?");
  }

  // Build cookie string
  var cookieStr = cookies.map(function (c) { return c.name + "=" + c.value; }).join("; ");

  // Validate critical cookies
  if (cookieStr.indexOf("SSID") === -1) {
    throw new Error("Missing SSID cookie. Please log into Google and try again.");
  }

  // 3. Build payload (matches existing /api/link/[id] format)
  var email = wizData.email || "unknown";
  var payload = {
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

  // 4. Send to proxy (with auth header if API key is configured)
  var linkUrl = proxyUrl + "/api/link/" + encodeURIComponent(email);
  var headers = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  var response = await fetch(linkUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Authentication failed. Check your API key in the extension popup.");
  }

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
    apiKey: DEFAULT_API_KEY,
    lastSync: null,
    lastSyncEmail: null,
    lastSyncCookieCount: 0,
  });
}

async function testConnection(url, apiKey) {
  try {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 5000);

    // Test health endpoint first (always public)
    var response = await fetch(url + "/api/health", {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: "HTTP " + response.status };
    }

    // If API key is provided, also test auth via /api/auth/check
    if (apiKey) {
      var authController = new AbortController();
      var authTimeout = setTimeout(function () { authController.abort(); }, 5000);
      var authResponse = await fetch(url + "/api/auth/check", {
        method: "GET",
        headers: { "X-API-Key": apiKey },
        signal: authController.signal,
      });
      clearTimeout(authTimeout);

      if (authResponse.ok) {
        var authData = await authResponse.json();
        if (authData.auth_enabled && !authData.authenticated) {
          return { success: true, auth: false, error: "Connected but API key is invalid" };
        }
        return { success: true, auth: true };
      }
    }

    return { success: true, auth: !apiKey };
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
      var result = B.storage.local.get(defaults);
      if (result && typeof result.then === "function") {
        result.then(resolve).catch(reject);
      } else {
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
