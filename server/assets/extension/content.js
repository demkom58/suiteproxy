/**
 * SuiteProxy Bridge — Content Script
 *
 * Runs on aistudio.google.com pages.
 * Extracts WIZ_global_data and triggers sync via the background service worker.
 *
 * Unlike the Tampermonkey approach, we do NOT need GM_cookie here —
 * the background service worker reads cookies directly via chrome.cookies API.
 */

(function () {
  "use strict";

  // Avoid double-injection
  if (window.__suiteProxyBridgeLoaded) return;
  window.__suiteProxyBridgeLoaded = true;

  // ── UI ──────────────────────────────────────────────────────────────

  function createSyncButton() {
    if (document.getElementById("suite-proxy-sync-btn")) return;

    const btn = document.createElement("button");
    btn.id = "suite-proxy-sync-btn";
    btn.innerHTML = "&#9889; SYNC TO PROXY";
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "9999",
      padding: "12px 24px",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      fontFamily: "sans-serif",
      fontSize: "14px",
      transition: "all 0.2s ease",
    });

    btn.addEventListener("mouseenter", () => {
      btn.style.backgroundColor = "#1d4ed8";
      btn.style.transform = "scale(1.05)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.backgroundColor = "#2563eb";
      btn.style.transform = "scale(1)";
    });

    btn.addEventListener("click", handleSyncClick);
    document.body.appendChild(btn);
  }

  async function handleSyncClick() {
    const btn = document.getElementById("suite-proxy-sync-btn");
    if (!btn) return;

    const originalText = btn.innerHTML;
    const originalColor = btn.style.backgroundColor;

    btn.innerHTML = "&#8987; Extracting...";
    btn.style.backgroundColor = "#64748b";
    btn.style.pointerEvents = "none";

    try {
      const wizData = extractWizData();
      
      // Send to background script for cookie capture + sync
      const B = (typeof browser !== "undefined" && browser.runtime) ? browser : chrome;
      const response = await B.runtime.sendMessage({
        type: "SYNC_ACCOUNT",
        data: wizData,
      });

      if (response.success) {
        btn.innerHTML = "&#10004; Synced!";
        btn.style.backgroundColor = "#10b981";
        console.log("[SuiteProxy] Sync successful:", response.result);
      } else {
        throw new Error(response.error || "Sync failed");
      }
    } catch (err) {
      console.error("[SuiteProxy] Sync error:", err);
      btn.innerHTML = "&#10008; Error";
      btn.style.backgroundColor = "#ef4444";
      
      // Show error briefly
      const errorDiv = document.createElement("div");
      errorDiv.textContent = err.message;
      Object.assign(errorDiv.style, {
        position: "fixed",
        bottom: "70px",
        right: "20px",
        zIndex: "10000",
        padding: "8px 16px",
        backgroundColor: "#1e1e1e",
        color: "#ef4444",
        borderRadius: "6px",
        fontSize: "12px",
        fontFamily: "monospace",
        maxWidth: "300px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
      });
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 5000);
    }

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = originalColor;
      btn.style.pointerEvents = "auto";
    }, 3000);
  }

  // ── Data Extraction ─────────────────────────────────────────────────

  function extractWizData() {
    let wiz = null;

    // Method 1: Global WIZ_global_data object
    if (window.WIZ_global_data) {
      wiz = window.WIZ_global_data;
    }

    // Method 2: Parse from script tags
    if (!wiz) {
      const scripts = Array.from(document.querySelectorAll("script"));
      for (const s of scripts) {
        if (s.textContent && s.textContent.includes('"SNlM0e"')) {
          try {
            // Try to extract the JSON object
            const match = s.textContent.match(
              /WIZ_global_data\s*=\s*(\{[\s\S]*?\});/
            );
            if (match) {
              wiz = JSON.parse(match[1]);
              break;
            }
          } catch {
            // Continue to next script
          }
        }
      }
    }

    // Method 3: Try window properties via injection
    if (!wiz) {
      try {
        const script = document.createElement("script");
        script.textContent = `
          window.__spWiz = window.WIZ_global_data || null;
        `;
        document.documentElement.appendChild(script);
        script.remove();
        wiz = window.__spWiz;
      } catch {
        // ignore
      }
    }

    if (!wiz || !wiz.SNlM0e) {
      throw new Error(
        "Could not find AI Studio session data (WIZ_global_data). Please refresh the page."
      );
    }

    // Determine auth user index (critical for multi-login)
    let authUser = "0";
    if (wiz.QrtxK !== undefined && wiz.QrtxK !== null) {
      authUser = String(wiz.QrtxK);
    } else if (wiz.HiPsbb !== undefined && wiz.HiPsbb !== null) {
      authUser = String(wiz.HiPsbb);
    } else {
      const urlMatch = location.href.match(/\/u\/(\d+)\//);
      if (urlMatch) authUser = urlMatch[1];
    }

    return {
      email: wiz.oPEP7c || "unknown",
      at: wiz.SNlM0e,
      apiKey: wiz.WIu0Nc || wiz.PeqOqb,
      build: wiz.cfb2h,
      flowId: wiz.FdrFJe,
      nonce: wiz.WZsZ1e,
      toggles: window._F_toggles || [],
      authUser: authUser,
      userAgent: navigator.userAgent,
    };
  }

  // ── Init ────────────────────────────────────────────────────────────

  // Wait for page to be ready, then show sync button
  if (document.readyState === "complete") {
    setTimeout(createSyncButton, 1500);
  } else {
    window.addEventListener("load", () => setTimeout(createSyncButton, 1500));
  }
})();
