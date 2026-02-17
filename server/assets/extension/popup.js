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

  updateStatus(status);

  // Test connection on load
  testConnection(status.proxyUrl || "http://localhost:3000");

  // Event listeners
  $("saveBtn").addEventListener("click", saveProxyUrl);
  $("testBtn").addEventListener("click", function () {
    testConnection($("proxyUrl").value);
  });

  // Save on Enter key
  $("proxyUrl").addEventListener("keydown", function (e) {
    if (e.key === "Enter") saveProxyUrl();
  });
});

// ── Actions ───────────────────────────────────────────────────────────

async function saveProxyUrl() {
  var url = $("proxyUrl").value.trim().replace(/\/+$/, "");
  if (!url) return;

  $("proxyUrl").value = url;

  var response = await sendMessage({ type: "SET_PROXY_URL", url: url });
  if (response.success) {
    showMsg("testMsg", "Saved!", "success");
    testConnection(url);
  }
}

async function testConnection(url) {
  if (!url) return;

  var dot = $("statusDot");
  var text = $("statusText");

  dot.className = "status-dot unknown";
  text.textContent = "Testing...";

  var result = await sendMessage({ type: "TEST_CONNECTION", url: url });

  if (result.success) {
    dot.className = "status-dot connected";
    text.textContent = "Connected";
    showMsg("testMsg", "Connection OK", "success");
  } else {
    dot.className = "status-dot disconnected";
    text.textContent = "Disconnected";
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
  }, 3000);
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
