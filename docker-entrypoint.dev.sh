#!/bin/bash
set -e

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

# ── Install dependencies ───────────────────────────────────────────────
echo "[entrypoint] Installing dependencies..."
bun install

# ── Download Camoufox binary ───────────────────────────────────────────
# Skip fetch if already installed (avoid ~260MB re-download).
# The camoufox-js package is patched to handle EBUSY when the cache dir
# is a Docker volume mount point (see patches/camoufox-js@0.9.0.patch).
CAMOUFOX_CACHE="$HOME/.cache/camoufox"
if [ -x "$CAMOUFOX_CACHE/camoufox-bin" ] && [ -f "$CAMOUFOX_CACHE/version.json" ]; then
  echo "[entrypoint] Camoufox already installed, skipping fetch"
else
  echo "[entrypoint] Fetching Camoufox browser..."
  bunx camoufox-js fetch
fi

# ── Ensure data directory ──────────────────────────────────────────────
mkdir -p /app/data/snapshots

# ── Start Nuxt dev server ──────────────────────────────────────────────
echo "[entrypoint] Starting Nuxt dev server..."
exec bun --bun run dev --host 0.0.0.0
