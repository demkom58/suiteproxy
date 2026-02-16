#!/bin/bash
set -e

echo "=== opencode-dev container starting ==="

# --- Overlay container-specific config ---
# These replace the host-mounted (Windows-oriented) configs with Linux-native versions
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

# --- Git safe directory (mounted volume) ---
git config --global --add safe.directory /app

# --- Verify tools ---
echo "[tools] Checking installed tools..."
echo "  bun:      $(bun --version)"
echo "  opencode: $(opencode version 2>/dev/null || echo 'installed')"
echo "  cie:      $(cie version 2>/dev/null || echo 'installed')"
echo "  git:      $(git --version)"

# --- Wait for sibling services ---
echo "[wait] Waiting for Edge browser CDP..."
for i in $(seq 1 30); do
  if curl -sf http://browser:9223/json/version > /dev/null 2>&1; then
    echo "[wait] Edge browser ready!"
    break
  fi
  [ "$i" -eq 30 ] && echo "[wait] WARNING: Edge browser not responding after 30s, continuing anyway"
  sleep 1
done

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
