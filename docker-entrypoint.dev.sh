#!/bin/bash
# NOTE: Do NOT use `set -e` — it interacts poorly with background processes
# (Xvfb) and piped commands. We handle errors explicitly instead.

# ── Signal Handling ────────────────────────────────────────────────────
# With `init: true` in docker-compose.yml, tini is PID 1 and handles signal
# forwarding. The `exec` at the end replaces this shell with bun, making
# bun a direct child of tini. This trap handles the case where signals
# arrive during the setup phase (before exec).
cleanup() {
  echo "[entrypoint] Received signal during setup, shutting down..."
  if [ -n "$XVFB_PID" ]; then
    kill -TERM "$XVFB_PID" 2>/dev/null
  fi
  exit 0
}
trap cleanup SIGTERM SIGINT

# ── Start D-Bus (required by Firefox) ──────────────────────────────────
if command -v dbus-daemon &>/dev/null; then
  mkdir -p /run/dbus
  dbus-daemon --system --fork 2>/dev/null || true
  echo "[entrypoint] D-Bus started"
fi

# ── Start Xvfb ─────────────────────────────────────────────────────────
echo "[entrypoint] Starting Xvfb on :99..."

# Kill any stale Xvfb
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null || true

Xvfb :99 -screen 0 1280x800x24 -nolisten tcp -ac &
XVFB_PID=$!
export DISPLAY=:99

# Wait for Xvfb socket to appear (up to 5 seconds)
for i in $(seq 1 50); do
  if [ -S /tmp/.X11-unix/X99 ]; then
    echo "[entrypoint] Xvfb ready (pid=$XVFB_PID, DISPLAY=:99)"
    break
  fi
  if ! kill -0 $XVFB_PID 2>/dev/null; then
    echo "[entrypoint] ERROR: Xvfb crashed during startup"
    exit 1
  fi
  sleep 0.1
done

if [ ! -S /tmp/.X11-unix/X99 ]; then
  echo "[entrypoint] ERROR: Xvfb socket never appeared after 5s"
  exit 1
fi

# ── Install dependencies (skip if already up-to-date) ──────────────────
# Compare lockfile hash to skip unnecessary install that invalidates Vite cache
# Bun 1.3+ uses text-based bun.lock; older versions used binary bun.lockb
LOCKFILE_HASH=""
CACHED_HASH=""
if [ -f /app/bun.lock ]; then
  LOCKFILE_HASH=$(md5sum /app/bun.lock 2>/dev/null | cut -d' ' -f1)
elif [ -f /app/bun.lockb ]; then
  LOCKFILE_HASH=$(md5sum /app/bun.lockb 2>/dev/null | cut -d' ' -f1)
fi
if [ -f /app/node_modules/.lock_hash ]; then
  CACHED_HASH=$(cat /app/node_modules/.lock_hash 2>/dev/null)
fi

if [ -n "$LOCKFILE_HASH" ] && [ "$LOCKFILE_HASH" = "$CACHED_HASH" ] && [ -d /app/node_modules/.cache ]; then
  echo "[entrypoint] Dependencies up-to-date (lockfile unchanged), skipping install"
else
  echo "[entrypoint] Installing dependencies..."
  if ! bun install; then
    echo "[entrypoint] WARNING: bun install failed, continuing anyway..."
  fi
  # Cache the lockfile hash so we can skip next time
  if [ -n "$LOCKFILE_HASH" ]; then
    echo "$LOCKFILE_HASH" > /app/node_modules/.lock_hash
  fi
fi

# ── Download Camoufox binary ───────────────────────────────────────────
# Skip fetch if already installed (avoid ~260MB re-download).
# The camoufox-js package is patched to handle EBUSY when the cache dir
# is a Docker volume mount point (see patches/camoufox-js@0.9.0.patch).
CAMOUFOX_CACHE="$HOME/.cache/camoufox"
if [ -x "$CAMOUFOX_CACHE/camoufox-bin" ] && [ -f "$CAMOUFOX_CACHE/version.json" ]; then
  echo "[entrypoint] Camoufox already installed, skipping fetch"
else
  echo "[entrypoint] Fetching Camoufox browser..."
  bunx camoufox-js fetch || echo "[entrypoint] WARNING: Camoufox fetch failed, browser automation may not work"
fi

# ── Ensure data directory ──────────────────────────────────────────────
mkdir -p /app/data/snapshots

# ── Start Nuxt dev server ──────────────────────────────────────────────
echo "[entrypoint] Starting Nuxt dev server..."
exec bun --bun run dev -- --host 0.0.0.0
