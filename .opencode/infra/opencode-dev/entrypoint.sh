#!/bin/bash
set -e

echo "=== opencode-dev container starting ==="

# --- Start D-Bus (needed by Firefox/Camoufox) ---
if command -v dbus-daemon &>/dev/null; then
  mkdir -p /run/dbus
  dbus-daemon --system --fork 2>/dev/null || true
fi

# --- Start Xvfb (virtual display for Camoufox) ---
echo "[xvfb] Starting Xvfb on :99..."
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null || true
Xvfb :99 -screen 0 1280x800x24 -nolisten tcp -ac &
export DISPLAY=:99

for i in $(seq 1 50); do
  [ -S /tmp/.X11-unix/X99 ] && break
  sleep 0.1
done
if [ -S /tmp/.X11-unix/X99 ]; then
  echo "[xvfb] Xvfb ready (DISPLAY=:99)"
else
  echo "[xvfb] WARNING: Xvfb socket not found, continuing anyway"
fi

# --- Overlay container-specific config ---
echo "[config] Installing container-specific opencode.json..."
cp /opt/opencode-dev/opencode.json /app/opencode.json

echo "[config] Installing container-specific agent docs..."
mkdir -p /app/.opencode/agents
shopt -s nullglob
for f in /opt/opencode-dev/agents/*.md; do
  cp "$f" /app/.opencode/agents/
done

echo "[config] Installing container-specific rules..."
mkdir -p /app/.opencode/rules
for f in /opt/opencode-dev/rules/*.md; do
  cp "$f" /app/.opencode/rules/
done
shopt -u nullglob

# --- Update CIE config for container ---
if [ -f /app/.cie/project.yaml ]; then
  echo "[config] Updating .cie/project.yaml for container networking..."
  sed -i 's|http://127.0.0.1:1234|http://host.docker.internal:1234|g' /app/.cie/project.yaml
fi

# --- Install dependencies ---
echo "[deps] Running bun install..."
bun install --frozen-lockfile 2>/dev/null || bun install

# --- Fetch Camoufox binary (skips if already cached) ---
# The camoufox-js package is patched to handle EBUSY when the cache dir
# is a Docker volume mount point (see patches/camoufox-js@0.9.0.patch).
CAMOUFOX_CACHE="$HOME/.cache/camoufox"
if [ -x "$CAMOUFOX_CACHE/camoufox-bin" ] && [ -f "$CAMOUFOX_CACHE/version.json" ]; then
  echo "[deps] Camoufox already installed, skipping fetch"
else
  echo "[deps] Fetching Camoufox browser..."
  bunx camoufox-js fetch
fi

# --- Git safe directory (mounted volume) ---
git config --global --add safe.directory /app

# --- Verify tools ---
echo "[tools] Checking installed tools..."
echo "  bun:      $(bun --version)"
echo "  opencode: $(opencode version 2>/dev/null || echo 'installed')"
echo "  cie:      $(cie version 2>/dev/null || echo 'installed')"
echo "  git:      $(git --version)"
echo "  xvfb:     $(pgrep -x Xvfb > /dev/null && echo 'running on :99' || echo 'NOT running')"
echo "  camoufox: $(ls /root/.cache/camoufox/camoufox-bin 2>/dev/null && echo 'installed' || echo 'NOT found')"

# --- Wait for sibling services ---
echo "[wait] Waiting for OpenMemory..."
for i in $(seq 1 15); do
  if curl -sf http://openmemory:8080/api/memory/list > /dev/null 2>&1; then
    echo "[wait] OpenMemory ready!"
    break
  fi
  [ "$i" -eq 15 ] && echo "[wait] WARNING: OpenMemory not responding after 15s, continuing anyway"
  sleep 1
done

echo "=== Starting OpenCode Web UI on :4096 ==="
exec opencode web --port 4096 --hostname 0.0.0.0
