/**
 * SuiteProxy Bridge — Popup Script
 * Cross-browser compatible (Chrome + Firefox)
 */

var B = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;
var $ = function (id) { return document.getElementById(id); };

// ── Init ──────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async function () {
  // Load saved settings
  var status = await sendMessage({ type: "GET_STATUS" });

  $("proxyUrl").value = status.proxyUrl || "http://localhost:3000";
  $("apiKey").value = status.apiKey || "";

  updateStatus(status);

  // Test connection on load
  testConnection(
    status.proxyUrl || "http://localhost:3000",
    status.apiKey || ""
  );

  // Event listeners
  $("saveBtn").addEventListener("click", saveSettings);
  $("testBtn").addEventListener("click", function () {
    testConnection($("proxyUrl").value, $("apiKey").value);
  });

  // Save on Enter key in either field
  $("proxyUrl").addEventListener("keydown", function (e) {
    if (e.key === "Enter") saveSettings();
  });
  $("apiKey").addEventListener("keydown", function (e) {
    if (e.key === "Enter") saveSettings();
  });
});

// ── Actions ───────────────────────────────────────────────────────────

async function saveSettings() {
  var url = $("proxyUrl").value.trim().replace(/\/+$/, "");
  var key = $("apiKey").value.trim();
  if (!url) return;

  $("proxyUrl").value = url;

  var response = await sendMessage({
    type: "SAVE_SETTINGS",
    proxyUrl: url,
    apiKey: key,
  });

  if (response.success) {
    showMsg("testMsg", "Settings saved!", "success");
    testConnection(url, key);
  }
}

async function testConnection(url, apiKey) {
  if (!url) return;

  var dot = $("statusDot");
  var text = $("statusText");
  var badge = $("authBadge");

  dot.className = "status-dot unknown";
  text.textContent = "Testing...";
  badge.style.display = "none";

  var result = await sendMessage({
    type: "TEST_CONNECTION",
    url: url,
    apiKey: apiKey || "",
  });

  if (result.success) {
    dot.className = "status-dot connected";
    text.textContent = "Connected";

    // Show auth status
    if (result.auth === true) {
      badge.className = "auth-badge ok";
      badge.textContent = "Auth OK";
      badge.style.display = "inline-block";
      showMsg("testMsg", "Connected & authenticated", "success");
    } else if (result.auth === false) {
      dot.className = "status-dot auth-warn";
      badge.className = "auth-badge fail";
      badge.textContent = "Auth Fail";
      badge.style.display = "inline-block";
      showMsg("testMsg", result.error || "API key rejected", "warning");
    } else {
      // No auth configured on server
      badge.className = "auth-badge none";
      badge.textContent = "No Auth";
      badge.style.display = "inline-block";
      showMsg("testMsg", "Connected (no auth required)", "success");
    }
  } else {
    dot.className = "status-dot disconnected";
    text.textContent = "Disconnected";
    badge.style.display = "none";
    showMsg("testMsg", result.error || "Cannot reach server", "error");
  }
}

// ── UI Helpers ────────────────────────────────────────────────────────

function updateStatus(status) {
  if (status.lastSync) {
    var date = new Date(status.lastSync);
    $("lastSync").textContent = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  } else {
    $("lastSync").textContent = "Never";
  }

  $("lastEmail").textContent = status.lastSyncEmail || "\u2014";
  $("cookieCount").textContent = status.lastSyncCookieCount
    ? status.lastSyncCookieCount + " (incl. HttpOnly)"
    : "\u2014";
}

function showMsg(id, text, type) {
  var el = $(id);
  el.textContent = text;
  el.className = "msg " + type;
  setTimeout(function () {
    el.className = "msg";
  }, 4000);
}

// ── Messaging ─────────────────────────────────────────────────────────

function sendMessage(msg) {
  return new Promise(function (resolve) {
    try {
      var result = B.runtime.sendMessage(msg);
      if (result && typeof result.then === "function") {
        // Firefox returns a Promise
        result.then(function (r) { resolve(r || {}); })
              .catch(function () { resolve({}); });
      } else {
        // Chrome callback-based (should not hit in MV3, but just in case)
        resolve({});
      }
    } catch (e) {
      // Fallback for Chrome where sendMessage needs callback
      B.runtime.sendMessage(msg, function (response) {
        resolve(response || {});
      });
    }
  });
}
