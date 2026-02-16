#!/bin/bash
# health.sh — Check all services are running
# Usage: bash .opencode/scripts/health.sh
#
# Exit 0 if all critical services are up, non-zero otherwise.

set -uo pipefail

OK=0
FAIL=0

check() {
  local name="$1" url="$2" expect="${3:-200}"
  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>/dev/null) || status="000"
  if [ "$status" = "$expect" ]; then
    echo "  ✓ ${name} (${url}) — ${status}"
    ((OK++))
  else
    echo "  ✗ ${name} (${url}) — got ${status}, expected ${expect}"
    ((FAIL++))
  fi
}

echo "=== Service Health Check ==="
echo ""

# Edge Browser CDP
check "Edge CDP" "http://browser:9222/json/version"

# OpenMemory
check "OpenMemory" "http://openmemory:8080/health"

# Nuxt dev server (may not be running yet)
NUXT_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 3 "http://localhost:3000" 2>/dev/null) || NUXT_STATUS="000"
if [ "$NUXT_STATUS" != "000" ]; then
  echo "  ✓ Nuxt dev server (http://localhost:3000) — ${NUXT_STATUS}"
  ((OK++))
else
  echo "  · Nuxt dev server (http://localhost:3000) — not running (start with: bun run dev --host 0.0.0.0)"
fi

# SQLite database
if [ -f "/app/data/accounts.sqlite" ]; then
  ACCOUNT_COUNT=$(sqlite3 /app/data/accounts.sqlite "SELECT count(*) FROM accounts" 2>/dev/null || echo "?")
  echo "  ✓ Database (/app/data/accounts.sqlite) — ${ACCOUNT_COUNT} accounts"
  ((OK++))
else
  echo "  ✗ Database (/app/data/accounts.sqlite) — not found"
  ((FAIL++))
fi

echo ""
echo "=== ${OK} ok, ${FAIL} failed ==="

[ "$FAIL" -eq 0 ]
