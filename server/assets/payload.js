// server/assets/payload.js
(async function main() {
    console.log("[SuiteProxy] logic loaded from", PROXY_ORIGIN);

    function createUI() {
        if (document.getElementById('suite-proxy-sync-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'suite-proxy-sync-btn';
        btn.innerText = "⚡ SYNC TO PROXY";
        Object.assign(btn.style, {
            position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999',
            padding: '12px 24px', backgroundColor: '#2563eb', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontFamily: 'sans-serif'
        });
        
        btn.onclick = async () => {
            const originalText = btn.innerText;
            const originalColor = btn.style.backgroundColor;
            btn.innerText = "⏳ Extracting...";
            btn.style.backgroundColor = '#64748b';
            try {
                await handleSync();
                btn.innerText = "✅ Done";
                btn.style.backgroundColor = '#10b981';
            } catch (e) {
                console.error(e);
                alert(e.message);
                btn.innerText = "❌ Error";
                btn.style.backgroundColor = '#ef4444';
            }
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = originalColor;
            }, 3000);
        };
        document.body.appendChild(btn);
    }

    async function handleSync() {
        let wiz = null;
        if (unsafeWindow.WIZ_global_data) {
            wiz = unsafeWindow.WIZ_global_data;
        } else {
            const scripts = Array.from(document.querySelectorAll('script'));
            for (const s of scripts) {
                if (s.textContent && s.textContent.includes('"SNlM0e"')) { 
                    try { wiz = JSON.parse(s.textContent); break; } catch (e) {}
                }
            }
        }

        if (!wiz || !wiz.SNlM0e) throw new Error("WizData not found. Refresh page.");

        const userEmail = wiz.oPEP7c || "unknown";
        
        // FIX: Prioritize QrtxK, then HiPsbb, then URL
        let authUser = "0";
        if (wiz.QrtxK !== undefined && wiz.QrtxK !== null) {
            authUser = String(wiz.QrtxK);
        } else if (wiz.HiPsbb !== undefined && wiz.HiPsbb !== null) {
            authUser = String(wiz.HiPsbb);
        } else {
            const urlMatch = location.href.match(/\/u\/(\d+)\//);
            if (urlMatch) authUser = urlMatch[1];
        }

        const apiKey = wiz.WIu0Nc || wiz.PeqOqb;

        return new Promise((resolve, reject) => {
            if (typeof GM_cookie === 'undefined') {
                return reject(new Error("GM_cookie missing. Check Tampermonkey settings."));
            }

            GM_cookie.list({ url: location.href }, (cookies, error) => {
                if (error) return reject(new Error("GM_cookie error: " + error));

                const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
                if (!cookieStr.includes("SSID")) return reject(new Error("HttpOnly 'SSID' cookie missing."));

                const payload = {
                    cookie: cookieStr,
                    at: wiz.SNlM0e,
                    api_key: apiKey,
                    build: wiz.cfb2h,
                    flow_id: wiz.FdrFJe,
                    nonce: wiz.WZsZ1e,
                    toggles: unsafeWindow._F_toggles || [],
                    authUser: authUser, // Now uses QrtxK
                    userAgent: navigator.userAgent
                };

                GM_xmlhttpRequest({
                    method: "POST",
                    url: `${PROXY_ORIGIN}/api/link/${encodeURIComponent(userEmail)}`,
                    headers: { "Content-Type": "application/json" },
                    data: JSON.stringify(payload),
                    onload: function(response) {
                        if (response.status === 200) resolve();
                        else reject(new Error(`Server error: ${response.status}`));
                    },
                    onerror: function(err) {
                        reject(new Error("Connection failed"));
                    }
                });
            });
        });
    }

    setTimeout(createUI, 1500);
})();