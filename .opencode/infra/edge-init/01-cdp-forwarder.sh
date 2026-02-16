#!/bin/bash
# Forward CDP from 127.0.0.1:9222 to 0.0.0.0:9223
# Edge binds its debug port to localhost only, so we use socat to expose it
echo "[cdp-forwarder] Starting socat: 0.0.0.0:9223 → 127.0.0.1:9222"
nohup bash -c '
  # Wait for Edge to start and bind to 9222
  for i in $(seq 1 30); do
    if ss -tlnp 2>/dev/null | grep -q ":9222"; then
      break
    fi
    sleep 1
  done
  socat TCP-LISTEN:9223,fork,reuseaddr,bind=0.0.0.0 TCP:127.0.0.1:9222 &
  echo "[cdp-forwarder] socat started"
' &>/dev/null &
