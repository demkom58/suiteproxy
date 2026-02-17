# SuiteProxy — Production container
# Bun runtime + Camoufox (stealth Firefox) + Xvfb for headless display
#
# Build:  docker build -t suiteproxy .
# Run:    docker run -d -p 3000:3000 -v ./data:/app/data --env-file .env suiteproxy
#
FROM oven/bun:1.3-debian AS base

# ── System dependencies for Camoufox (Firefox) + virtual display ────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core tools
    curl ca-certificates procps \
    # Virtual framebuffer (headless display for Firefox)
    xvfb \
    # GTK3 + GUI libs required by Firefox/Camoufox
    libgtk-3-0 libdbus-glib-1-2 libasound2 \
    libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 libxtst6 \
    libpango-1.0-0 libcairo2 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libgbm1 libxshmfence1 \
    # D-Bus (needed by Firefox for IPC)
    dbus dbus-x11 \
    # Fonts (needed for page rendering)
    fonts-liberation fonts-noto-core \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Install dependencies ────────────────────────────────────────────────
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Download Camoufox browser binary ────────────────────────────────────
# Clean any stale cache first to avoid EBUSY errors on overlayfs
RUN rm -rf /root/.cache/camoufox 2>/dev/null; bunx camoufox-js fetch

# ── Copy application source ────────────────────────────────────────────
COPY nuxt.config.ts tsconfig.json eslint.config.mjs vitest.config.ts ./
COPY app/ ./app/
COPY server/ ./server/
COPY shared/ ./shared/
COPY public/ ./public/

# ── Build Nuxt for production ──────────────────────────────────────────
RUN bun run build

# ── Prepare data directory ─────────────────────────────────────────────
RUN mkdir -p /app/data/snapshots

# ── Entrypoint ─────────────────────────────────────────────────────────
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

# Health check — hits the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=30s \
  CMD curl -sf http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
