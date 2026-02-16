import puppeteer, { Browser, Page } from "puppeteer";

// Constants (AI Studio specific)
const BG_API_KEY = 'AIzaSyBGb5fGAyC-pRcRU6MUHb__b_vKha71HRE'; 
const REQUEST_KEY = 'lmnUSbltwc5ULv48iKLX';

interface BotGuardConfig {
    userAgent?: string;
    cookies: string;
    url?: string;
    authUser?: string;
}

// Global state to survive hot reloads
declare global {
    var _bgBrowser: Browser | null;
    var _bgPage: Page | null;
    var _bgLaunchPromise: Promise<Page> | null;
}

globalThis._bgBrowser = globalThis._bgBrowser || null;
globalThis._bgPage = globalThis._bgPage || null;
globalThis._bgLaunchPromise = globalThis._bgLaunchPromise || null;

export class BotGuardService {
  private config: BotGuardConfig;

  constructor(config: BotGuardConfig) {
    this.config = config;
  }

  private async getPage(): Promise<Page> {
    if (globalThis._bgPage && globalThis._bgBrowser?.isConnected()) {
        return globalThis._bgPage;
    }

    if (globalThis._bgLaunchPromise) {
        return globalThis._bgLaunchPromise;
    }

    console.log("[BotGuard] 🚀 Launching Persistent Browser Worker...");
    
    globalThis._bgLaunchPromise = (async () => {
        try {
            if (globalThis._bgBrowser) await globalThis._bgBrowser.close().catch(() => {});

            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-blink-features=AutomationControlled'
                ]
            });

            const page = await browser.newPage();
            
            // Bypass CSP to allow script injections
            await page.setBypassCSP(true);

            // Bridge console logs for debugging
            page.on('console', msg => {
                const text = msg.text();
                if (text.includes("Wasm")) return; // Ignore noisy Wasm warnings
                const type = msg.type();
                if (type === 'error') console.error(`[Browser] 🔴 ${text}`);
                else if (type === 'warn') console.warn(`[Browser] 🟡 ${text}`);
                else console.log(`[Browser] ${text}`);
            });

            page.on('pageerror', (err) => {
                console.error(`[Browser] 💥 Uncaught Exception: ${String(err)}`);
            });

            // Stealth & Environment Polyfills - BEFORE navigation
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                
                // Trusted Types Polyfill to allow script injection
                const win = window as unknown as Record<string, unknown>;
                const tt = win.trustedTypes as { createPolicy?: (name: string, rules: Record<string, (s: string) => string>) => unknown } | undefined;
                if (tt?.createPolicy) {
                    try {
                        tt.createPolicy('default', {
                            createHTML: (s: string) => s,
                            createScript: (s: string) => s, 
                            createScriptURL: (s: string) => s,
                        });
                    } catch (_e) { /* policy may already exist */ }
                }
            });

            // Set Credentials
            if (this.config.cookies) {
                const cookies = this.config.cookies.split(/;(?=\s*[a-zA-Z0-9_-]+=)/)
                    .map(c => c.trim())
                    .filter(c => c.length > 0)
                    .map(c => {
                        const parts = c.split('=');
                        const name = parts[0] ?? '';
                        return {
                            name,
                            value: parts.slice(1).join('='),
                            domain: ".google.com",
                            path: "/",
                            secure: true,
                            httpOnly: name.startsWith('__Secure-') || ['SID', 'HSID', 'SSID'].includes(name),
                            sameSite: 'None' as const,
                        };
                    }).filter(c => c.name.length > 0);
                
                if (cookies.length > 0) {
                    await page.setCookie(...cookies);
                    console.log(`[BotGuard] Loaded ${cookies.length} cookies into browser context.`);
                } else {
                    console.warn("[BotGuard] ⚠️ No cookies found to load!");
                }
            }

            if (this.config.userAgent) {
                await page.setUserAgent(this.config.userAgent);
            }

            // Navigate to valid origin
            try {
                // bscframe is a lightweight HTML page used by Google apps, perfect for this
                await page.goto("https://aistudio.google.com/app/_/bscframe", { waitUntil: 'domcontentloaded', timeout: 15000 });
                console.log(`[BotGuard] Navigated to ${page.url()}`);
            } catch(e) {
                console.warn("[BotGuard] Nav fallback to robots.txt...");
                await page.goto("https://aistudio.google.com/robots.txt", { waitUntil: 'domcontentloaded' });
            }

            console.log("[BotGuard] Worker ready.");
            
            globalThis._bgBrowser = browser;
            globalThis._bgPage = page;
            return page;

        } catch (e) {
            console.error("[BotGuard] Launch failed:", e);
            globalThis._bgLaunchPromise = null;
            throw e;
        }
    })();

    return globalThis._bgLaunchPromise;
  }

  public async executeGenerateContent(
    contentBinding: any,
    rpcPayload: any[],
    endpoint: string,
    authHash: string,
    makersuiteApiKey: string
  ): Promise<any> {
    const page = await this.getPage();

    try {
        console.log("[BotGuard] Starting Token Generation Sequence...");

        // --- PHASE 1: Fetch Challenge Metadata (Browser) ---
        // We use the browser to fetch the challenge config to ensure cookies/session alignment
        // CRITICAL: The real AI Studio sends Authorization (SAPISIDHASH) and X-Goog-AuthUser
        // headers on the Waa/Create request. Without these, the WAA server may return a
        // different/restricted challenge, leading to a token that Google rejects.
        const challengeInfo = await page.evaluate(async (apiKey, reqKey, authUser) => {
            console.log(`[Phase 1] Fetching challenge for key: ${reqKey.substring(0,5)}...`);
            
            // Compute SAPISIDHASH in browser context from cookies
            // The SAPISID cookie is accessible via document.cookie on the aistudio.google.com origin
            let sapisid = '';
            // Use word boundary \b to avoid matching __Secure-1PAPISID or __Secure-3PAPISID
            const sapisidMatch = document.cookie.match(/(?:^|;\s*)SAPISID=([^;]+)/);
            const secure3pMatch = document.cookie.match(/__Secure-3PSAPISID=([^;]+)/);
            if (sapisidMatch) {
                sapisid = sapisidMatch[1]!;
            } else if (secure3pMatch) {
                sapisid = secure3pMatch[1]!;
            }
            
            if (!sapisid) {
                console.warn("[Phase 1] ⚠️ SAPISID cookie missing in document.cookie!");
            }
            
            // Generate SAPISIDHASH: SHA-1 of "timestamp SAPISID origin"
            let waaAuthHeader = '';
            if (sapisid) {
                const ts = Math.floor(Date.now() / 1000);
                const origin = 'https://aistudio.google.com';
                const input = `${ts} ${sapisid} ${origin}`;
                const encoder = new TextEncoder();
                const data = encoder.encode(input);
                const hashBuffer = await crypto.subtle.digest('SHA-1', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                const sig = `${ts}_${hashHex}`;
                waaAuthHeader = `SAPISIDHASH ${sig} SAPISID1PHASH ${sig} SAPISID3PHASH ${sig}`;
                console.log(`[Phase 1] Computed SAPISIDHASH for Waa/Create: ${sig.substring(0, 30)}...`);
            }

            // Build headers - match what the real AI Studio sends
            const headers: Record<string, string> = {
                'content-type': 'application/json+protobuf',
                'x-goog-api-key': apiKey,
                'x-user-agent': 'grpc-web-javascript/0.1',
            };
            
            if (waaAuthHeader) {
                headers['authorization'] = waaAuthHeader;
                headers['x-goog-authuser'] = authUser;
            }

            const fetchResp = await fetch(`https://waa-pa.clients6.google.com/$rpc/google.internal.waa.v1.Waa/Create`, {
                method: 'POST',
                headers,
                body: JSON.stringify([reqKey]),
                credentials: 'include'
            });

            if (!fetchResp.ok) throw new Error("BG Fetch failed: " + fetchResp.status + " " + await fetchResp.text());
            const rawData = await fetchResp.json();
            
            // Descramble logic
            let data = rawData;
            let isScrambled = false;
            
            if (rawData.length > 1 && typeof rawData[1] === 'string') {
                isScrambled = true;
                const b64 = rawData[1].replace(/-/g, '+').replace(/_/g, '/');
                const binStr = atob(b64);
                const bytes = new Uint8Array(binStr.length);
                for(let i=0; i<binStr.length; i++) bytes[i] = binStr.charCodeAt(i) + 97;
                data = JSON.parse(new TextDecoder().decode(bytes));
            } else if (Array.isArray(rawData) && rawData.length > 0 && Array.isArray(rawData[0])) {
                data = rawData[0];
            }

            console.log(`[Phase 1] Challenge received. Scrambled: ${isScrambled}. Global: ${data[5]}`);

            return {
                interpreterHash: data[3],
                program: data[4],
                globalName: data[5],
                wrappedScript: data[1],
                wrappedUrl: data[2]
            };
        }, BG_API_KEY, REQUEST_KEY, this.config.authUser || '0');

        // --- PHASE 2: Download Script Content (Node.js) ---
        // We do this in Node to bypass CORS/CSP restrictions in the browser page
        let scriptContent = null;
        let sourceUrl = "inline";

        // A. Check Inline
        if (Array.isArray(challengeInfo.wrappedScript)) {
            scriptContent = challengeInfo.wrappedScript.find((x: any) => typeof x === 'string' && x.length > 100);
        }

        // B. Check Remote URL
        if (!scriptContent && Array.isArray(challengeInfo.wrappedUrl)) {
             const flatUrl = challengeInfo.wrappedUrl.flat(Infinity); 
             const urlPart = flatUrl.find((x: any) => typeof x === 'string' && x.includes('/js/bg/'));
             
             if (urlPart) {
                let fullUrl = urlPart;
                if (urlPart.startsWith('//')) {
                    fullUrl = `https:${urlPart}`;
                } else if (!urlPart.startsWith('http')) {
                    fullUrl = `https://www.google.com${urlPart}`;
                }
                
                sourceUrl = fullUrl;
                console.log(`[BotGuard] Downloading script from: ${fullUrl}`);
                try {
                    const res = await fetch(fullUrl, {
                        headers: { 'User-Agent': this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0' }
                    });
                    if (res.ok) {
                        scriptContent = await res.text();
                        console.log(`[BotGuard] Script downloaded (${scriptContent.length} bytes)`);
                        // Save script for analysis
                        try {
                            const { writeFile, mkdir } = await import('node:fs/promises');
                            await mkdir('./data', { recursive: true });
                            await writeFile('./data/botguard-script.js', scriptContent);
                            console.log(`[BotGuard] Script saved to ./data/botguard-script.js`);
                        } catch { /* non-critical, ignore save errors */ }
                    } else {
                        console.error(`[BotGuard] Script download failed: ${res.status}`);
                    }
                } catch (e) {
                    console.error("[BotGuard] Script download network error:", e);
                }
             }
        }

        if (!scriptContent) throw new Error("BotGuard script content could not be retrieved");

        // --- PHASE 3: Inject VM & Generate Token (Browser) ---
        // Browser is ONLY used for BotGuard token generation, NOT for the API call
        const botguardToken = await page.evaluate(async (
            scriptText: string,
            info: { globalName: string; interpreterHash: string; program: string },
            binding: any
        ) => {
            console.log(`[Phase 3] Starting injection for ${info.globalName}...`);
            console.log(`[Phase 3] Binding passed:`, JSON.stringify(binding));

            // Helper to bypass Trusted Types
            const getTrustedScript = (txt: string) => {
                // @ts-ignore
                if (window.trustedTypes && window.trustedTypes.createPolicy) {
                    // @ts-ignore
                    if (!window.ttPolicy) {
                         try {
                            // @ts-ignore
                            window.ttPolicy = window.trustedTypes.createPolicy('bg-default', {
                                createScript: (s: string) => s,
                                createHTML: (s: string) => s,
                            });
                         } catch(e) {}
                    }
                    // @ts-ignore
                    return window.ttPolicy ? window.ttPolicy.createScript(txt) : txt;
                }
                return txt;
            };

            // 1. Inject VM Script
            if (!(window as any)[info.globalName]) {
                const scriptEl = document.createElement('script');
                scriptEl.id = info.interpreterHash;
                scriptEl.text = getTrustedScript(scriptText);
                
                scriptEl.onerror = (e) => console.error("[Phase 3] Script tag error:", e);
                
                document.head.appendChild(scriptEl);

                // Wait for VM global
                let attempts = 0;
                while (!(window as any)[info.globalName] && attempts < 100) { // 2s timeout
                    await new Promise(r => setTimeout(r, 20));
                    attempts++;
                }
            } else {
                console.log(`[Phase 3] VM ${info.globalName} already loaded.`);
            }

            const vm = (window as any)[info.globalName];
            if (!vm) throw new Error(`BG Global '${info.globalName}' failed to load after injection`);

            // 2. Create a userInteractionElement - bg-utils passes this as 4th arg to vm.a()
            // The real AI Studio also provides this element. It gives BotGuard a DOM element
            // to attach interaction listeners to, improving token validity.
            let userInteractionElement: HTMLDivElement | undefined;
            try {
                userInteractionElement = document.createElement('div');
                userInteractionElement.id = 'botguard-ui-container';
                userInteractionElement.style.display = 'none';
                document.body.appendChild(userInteractionElement);
            } catch (_e) {
                console.warn('[Phase 3] Could not create userInteractionElement');
            }
            
            // 3. Generate Token
            console.log(`[Phase 3] Content binding hash: ${binding?.Kgb?.content || '(none)'}`);
            console.log(`[Phase 3] Generating Snapshot...`);
            
            const token = await new Promise<string>((resolve, reject) => {
                try {
                    // From JS trace & bg-utils README:
                    // vm.a(program, vmFunctionsCallback, true, userInteractionElement, () => {}, [[], []])
                    // Returns [syncSnapshotFunction]
                    // vmFunctionsCallback receives: (asyncSnapshotFunction, shutdownFunction, passEventFunction, checkCameraFunction)
                    //
                    // Then asyncSnapshotFunction is called with:
                    //   1. callback(token) - receives the generated token
                    //   2. [contentBinding, signedTimestamp, webPoSignalOutput, skipPrivacyBuffer]
                    //
                    // From AI Studio JS trace (_.Wv):
                    //   a.F.snapshot({ Kgb: { content: hashString } })
                    //   which maps to asyncSnapshotFn(callback, [{ Kgb: { content: hash } }, undefined, [], undefined])
                    vm.a(info.program, (asyncSnapshotFn: any) => {
                        asyncSnapshotFn((t: string) => resolve(t), [binding, undefined, [], undefined]);
                    }, true, userInteractionElement || undefined, () => {}, [[], []]);
                } catch(e: any) {
                    reject(e.toString());
                }
            });

            console.log(`[Phase 3] Snapshot generated. Length: ${token.length}`);
            
            if (token.length < 100) {
                 console.error(`[Phase 3] ⚠️ Suspicious short token: ${token}`);
            }

            // Return token to Node.js - do NOT make API call from browser
            return token.startsWith('!') ? token : '!' + token;

        }, scriptContent, challengeInfo, contentBinding);

        // --- PHASE 4: Send API Request (BROWSER) ---
        // CRITICAL CHANGE: Make the request from browser to avoid fingerprint detection
        // Google rejects requests from Node.js fetch even with valid tokens
        console.log(`[Phase 4] Sending API request from BROWSER (to avoid fingerprinting)...`);
        console.log(`[Phase 4] Token length: ${botguardToken.length}`);

        rpcPayload[4] = botguardToken;
        
        // Execute the API call from within the browser context
        const apiResponse = await page.evaluate(async (endpoint, authHash, apiKey, authUser, payload) => {
            console.log('[Browser API] Making request with credentials...');
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': authHash,
                    'Content-Type': 'application/json+protobuf',
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-AuthUser': authUser,
                    'X-User-Agent': 'grpc-web-javascript/0.1',
                    'X-Goog-Ext-519733851-bin': 'CAASA1JVQRgBMAE4BEAA',
                },
                body: JSON.stringify(payload),
                credentials: 'include', // Use cookies from browser context
            });
            
            console.log('[Browser API] Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                return { ok: false, status: response.status, error: errorText };
            }
            
            const text = await response.text();
            return { ok: true, status: response.status, data: text };
        }, endpoint, authHash, makersuiteApiKey, this.config.authUser || '0', rpcPayload);
        
        if (!apiResponse.ok) {
            console.error(`[Browser API] ❌ API Error ${apiResponse.status}:`);
            console.error(`[Browser API] Response: ${apiResponse.error}`);
            throw new Error(`API ${apiResponse.status} ${apiResponse.error}`);
        }
        
        if (!apiResponse.data) {
            throw new Error('[Browser API] No data in response');
        }
        
        console.log(`[Browser API] ✓ Success! Response size: ${apiResponse.data.length}`);
        const cleaned = apiResponse.data.replace(/^\)]}'\n/, '');
        return JSON.parse(cleaned);

    } catch (e: any) {
        // Recovery logic for browser crashes
        if (e.message?.includes("Execution context was destroyed") || e.message?.includes("Target closed")) {
             console.warn("[BotGuard] Context lost. Resetting worker...");
             globalThis._bgLaunchPromise = null;
             globalThis._bgPage = null;
        }
        console.error("[BotGuard] Exec Error:", e.message);
        throw e;
    }
  }
}