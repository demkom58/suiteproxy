// server/api/script/install.user.js.get.ts

export default defineEventHandler((event) => {
  const reqUrl = getRequestURL(event);
  const origin = `${reqUrl.protocol}//${reqUrl.host}`;
  const payloadUrl = `${origin}/api/script/payload.js`;
  
  // We explicitly pass the GM_ variables into the dynamic function scope
  const scriptContent = `
// ==UserScript==
// @name         SuiteProxy Bridge
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Connects AI Studio to SuiteProxy (${origin})
// @author       SuiteProxy
// @match        https://aistudio.google.com/*
// @grant        GM_cookie
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      ${reqUrl.hostname}
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    
    const PROXY_ORIGIN = "${origin}";
    const PAYLOAD_URL = "${payloadUrl}";

    console.log("[SuiteProxy] Fetching logic from", PAYLOAD_URL);

    GM_xmlhttpRequest({
        method: "GET",
        url: PAYLOAD_URL + "?t=" + Date.now(),
        onload: function(response) {
            if (response.status === 200) {
                try {
                    // FIX: Pass GM variables explicitly into the dynamic scope
                    const dynamicLogic = new Function(
                        "PROXY_ORIGIN", 
                        "GM_cookie", 
                        "GM_xmlhttpRequest", 
                        "unsafeWindow", 
                        response.responseText
                    );
                    
                    // Execute the payload with these variables injected
                    dynamicLogic(PROXY_ORIGIN, GM_cookie, GM_xmlhttpRequest, unsafeWindow);
                    
                } catch (e) {
                    console.error("[SuiteProxy] Script Execution Error:", e);
                    alert("SuiteProxy Script Error: " + e.message);
                }
            } else {
                console.error("[SuiteProxy] Failed to load payload:", response.status);
            }
        },
        onerror: function(err) {
            console.error("[SuiteProxy] Connection error. Is the server running?", err);
        }
    });
})();
  `.trim();

  setResponseHeader(event, 'Content-Type', 'application/javascript');
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="suiteproxy.user.js"');
  
  return scriptContent;
});