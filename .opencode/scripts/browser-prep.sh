#!/bin/bash
# browser-prep.sh — Load account cookies into Edge browser and navigate to AI Studio
#
# Usage: bash .opencode/scripts/browser-prep.sh [account-email]
#   If no email given, uses the first account in the database.
#
# What it does:
#   1. Reads cookies from SQLite (data/accounts.sqlite)
#   2. Connects to Edge CDP (browser container)
#   3. Creates a new tab or reuses existing AI Studio tab
#   4. Sets all cookies on .google.com domain
#   5. Navigates to https://aistudio.google.com/
#   6. Verifies login state
#
# Prerequisites:
#   - Edge browser container running (docker compose up)
#   - data/accounts.sqlite has at least one linked account
#   - sqlite3 and curl available

set -euo pipefail

CDP_HOST="${CDP_HOST:-browser}"
CDP_PORT="${CDP_PORT:-9222}"
CDP_BASE="http://${CDP_HOST}:${CDP_PORT}"
DB_PATH="${DB_PATH:-/app/data/accounts.sqlite}"
TARGET_URL="https://aistudio.google.com/"

ACCOUNT_EMAIL="${1:-}"

# --- Helpers ---
log()  { echo "[browser-prep] $*"; }
err()  { echo "[browser-prep] ERROR: $*" >&2; }
cdp()  { curl -sf "$@"; }

# --- 1. Check prerequisites ---
if ! command -v sqlite3 &>/dev/null; then
  err "sqlite3 not found. Install it or run from sandbox container."
  exit 1
fi

if ! command -v curl &>/dev/null; then
  err "curl not found."
  exit 1
fi

if ! cdp "${CDP_BASE}/json/version" >/dev/null 2>&1; then
  err "Edge CDP not reachable at ${CDP_BASE}. Is the browser container running?"
  err "Start with: docker compose -f .opencode/infra/docker-compose.yml up -d"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  err "Database not found at ${DB_PATH}"
  exit 1
fi

# --- 2. Read cookies from SQLite ---
if [ -z "$ACCOUNT_EMAIL" ]; then
  ACCOUNT_EMAIL=$(sqlite3 "$DB_PATH" "SELECT id FROM accounts LIMIT 1" 2>/dev/null)
  if [ -z "$ACCOUNT_EMAIL" ]; then
    err "No accounts in database. Link an account first via the Tampermonkey userscript."
    exit 1
  fi
  log "Using first account: ${ACCOUNT_EMAIL}"
else
  log "Using specified account: ${ACCOUNT_EMAIL}"
fi

CREDS_JSON=$(sqlite3 "$DB_PATH" "SELECT creds FROM accounts WHERE id='${ACCOUNT_EMAIL}'" 2>/dev/null)
if [ -z "$CREDS_JSON" ]; then
  err "Account '${ACCOUNT_EMAIL}' not found in database."
  exit 1
fi

COOKIE_STRING=$(echo "$CREDS_JSON" | jq -r '.cookie // empty')
if [ -z "$COOKIE_STRING" ]; then
  err "No cookies found for ${ACCOUNT_EMAIL}"
  exit 1
fi

log "Loaded cookie string (${#COOKIE_STRING} chars)"

# --- 3. Find or create an AI Studio tab ---
# List existing pages
PAGES_JSON=$(cdp "${CDP_BASE}/json/list" 2>/dev/null || echo "[]")

# Look for an existing aistudio tab
TAB_WS=$(echo "$PAGES_JSON" | jq -r '
  [.[] | select(.type == "page" and (.url | test("aistudio.google.com")))][0].webSocketDebuggerUrl // empty
')

if [ -z "$TAB_WS" ]; then
  # No AI Studio tab — find any usable tab or create new
  TAB_WS=$(echo "$PAGES_JSON" | jq -r '
    [.[] | select(.type == "page")][0].webSocketDebuggerUrl // empty
  ')
  if [ -z "$TAB_WS" ]; then
    log "Creating new tab..."
    NEW_TAB=$(cdp "${CDP_BASE}/json/new?about:blank" 2>/dev/null)
    TAB_WS=$(echo "$NEW_TAB" | jq -r '.webSocketDebuggerUrl // empty')
  fi
  log "Using tab: ${TAB_WS}"
else
  log "Found existing AI Studio tab"
fi

if [ -z "$TAB_WS" ]; then
  err "Could not get a tab WebSocket URL from CDP"
  exit 1
fi

# --- 4. Set cookies via CDP ---
# Parse cookie string into individual cookies and set each via CDP Network.setCookie
# We use a temp file to build the CDP commands to avoid escaping issues

CDP_ID=1
COOKIE_COUNT=0

# Split cookies by semicolons, handling values that contain =
# Use IFS trick to split
set_cookie_cdp() {
  local name="$1"
  local value="$2"
  local http_only="false"
  
  # Determine httpOnly based on cookie name
  case "$name" in
    SID|HSID|SSID|__Secure-*) http_only="true" ;;
  esac
  
  # Build CDP command JSON  
  local payload
  payload=$(jq -n \
    --arg name "$name" \
    --arg value "$value" \
    --argjson httpOnly "$http_only" \
    '{
      id: 1,
      method: "Network.setCookie",
      params: {
        name: $name,
        value: $value,
        domain: ".google.com",
        path: "/",
        secure: true,
        httpOnly: $httpOnly,
        sameSite: "None"
      }
    }')
  
  # We can't easily send WebSocket from bash, so we use the /json/protocol approach
  # Instead, we'll build a JS snippet that sets cookies via document.cookie
  # and execute it via CDP evaluate
  return 0
}

# Actually, the cleanest approach: navigate to google.com first, then use 
# Runtime.evaluate to set cookies via document.cookie for non-httpOnly ones,
# and Network.setCookie for httpOnly ones via the /json protocol.
#
# BUT — the simplest reliable method is to create a small JS file and use 
# page.evaluate via curl + CDP HTTP endpoints.
#
# The SIMPLEST approach: use Playwright MCP from the agent. But this script
# should work standalone. So let's use the CDP HTTP protocol directly.

# Alternative: Write a tiny Bun script that does the CDP WebSocket work
PREP_SCRIPT=$(mktemp /tmp/browser-prep-XXXXXX.mjs)
cat > "$PREP_SCRIPT" << 'SCRIPT_EOF'
// Bun script: connect to CDP, set cookies, navigate, verify
const CDP_WS = process.argv[2];
const COOKIES_RAW = process.argv[3]; 
const TARGET = process.argv[4] || "https://aistudio.google.com/";

if (!CDP_WS || !COOKIES_RAW) {
  console.error("Usage: bun run <script> <ws-url> <cookie-string> [target-url]");
  process.exit(1);
}

// Parse cookie string into name=value pairs
function parseCookies(raw) {
  return raw.split(/;\s*/).filter(Boolean).map(pair => {
    const idx = pair.indexOf("=");
    if (idx === -1) return null;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (!name) return null;
    
    const httpOnlyNames = new Set(["SID", "HSID", "SSID"]);
    const isHttpOnly = httpOnlyNames.has(name) || name.startsWith("__Secure-");
    
    return { name, value, domain: ".google.com", path: "/", secure: true, httpOnly: isHttpOnly, sameSite: "None" };
  }).filter(Boolean);
}

// CDP WebSocket message helper
let msgId = 0;
function cdpSend(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const timeout = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 10000);
    
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        clearTimeout(timeout);
        ws.removeEventListener("message", handler);
        if (msg.error) reject(new Error(`CDP error: ${JSON.stringify(msg.error)}`));
        else resolve(msg.result);
      }
    };
    
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  console.log("[prep] Connecting to CDP...");
  const ws = new WebSocket(CDP_WS);
  
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = (e) => reject(new Error("WebSocket connection failed"));
    setTimeout(() => reject(new Error("WebSocket connection timeout")), 5000);
  });
  
  console.log("[prep] Connected. Enabling Network domain...");
  await cdpSend(ws, "Network.enable");
  
  // Set each cookie
  const cookies = parseCookies(COOKIES_RAW);
  console.log(`[prep] Setting ${cookies.length} cookies...`);
  
  let ok = 0, fail = 0;
  for (const cookie of cookies) {
    try {
      const result = await cdpSend(ws, "Network.setCookie", cookie);
      if (result?.success) ok++; else fail++;
    } catch (e) {
      fail++;
    }
  }
  console.log(`[prep] Cookies set: ${ok} ok, ${fail} failed`);
  
  // Navigate to AI Studio
  console.log(`[prep] Navigating to ${TARGET}...`);
  await cdpSend(ws, "Page.enable");
  
  const nav = await cdpSend(ws, "Page.navigate", { url: TARGET });
  if (nav?.errorText) {
    console.error(`[prep] Navigation error: ${nav.errorText}`);
  }
  
  // Wait for page load
  await new Promise(resolve => {
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Page.loadEventFired" || msg.method === "Page.frameStoppedLoading") {
        ws.removeEventListener("message", handler);
        resolve();
      }
    };
    ws.addEventListener("message", handler);
    setTimeout(resolve, 15000); // max 15s
  });
  
  console.log("[prep] Page loaded. Checking login state...");
  
  // Quick check: evaluate document.title or look for user avatar
  const evalResult = await cdpSend(ws, "Runtime.evaluate", {
    expression: `JSON.stringify({
      url: location.href,
      title: document.title,
      hasUserMenu: !!document.querySelector('[data-oguser]') || !!document.querySelector('img[data-src*="googleusercontent"]') || !!document.querySelector('[aria-label*="Account"]'),
      cookieCount: document.cookie.split(";").filter(Boolean).length
    })`,
    returnByValue: true
  });
  
  let state;
  try {
    state = JSON.parse(evalResult?.result?.value || "{}");
  } catch {
    state = { url: "unknown", title: "unknown" };
  }
  
  console.log(`[prep] URL: ${state.url}`);
  console.log(`[prep] Title: ${state.title}`);
  console.log(`[prep] Cookies visible to JS: ${state.cookieCount}`);
  console.log(`[prep] User menu detected: ${state.hasUserMenu}`);
  
  if (state.url?.includes("accounts.google.com")) {
    console.warn("[prep] WARNING: Redirected to login page. Cookies may be expired.");
    console.warn("[prep] Re-sync cookies via the Tampermonkey userscript.");
  } else {
    console.log("[prep] Browser ready for AI Studio work.");
  }
  
  ws.close();
  process.exit(0);
}

main().catch(e => {
  console.error("[prep] Fatal:", e.message);
  process.exit(1);
});
SCRIPT_EOF

log "Running CDP cookie loader..."

# Get target page WebSocket URL for the Bun script
# We need the browser-level WS endpoint (not page-level) for Network.setCookie
BROWSER_WS=$(cdp "${CDP_BASE}/json/version" | jq -r '.webSocketDebuggerUrl // empty')

if [ -z "$BROWSER_WS" ]; then
  # Fallback: use page-level WS  
  BROWSER_WS="$TAB_WS"
fi

# Replace localhost with container hostname if running in Docker
BROWSER_WS=$(echo "$BROWSER_WS" | sed "s|ws://127.0.0.1:|ws://${CDP_HOST}:|g" | sed "s|ws://localhost:|ws://${CDP_HOST}:|g")

log "CDP WebSocket: ${BROWSER_WS}"

# Run the Bun-based CDP script
bun run "$PREP_SCRIPT" "$BROWSER_WS" "$COOKIE_STRING" "$TARGET_URL"
EXIT_CODE=$?

rm -f "$PREP_SCRIPT"

if [ $EXIT_CODE -eq 0 ]; then
  log "Done. Browser is ready."
else
  err "Browser prep failed (exit code: ${EXIT_CODE})"
fi

exit $EXIT_CODE
