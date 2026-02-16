# opencode-dev — portable dev container for OpenCode + agent tools
# Base: oven/bun (Debian) — bun handles all JS/TS/MJS natively, no Node needed
FROM oven/bun:1.3-debian AS base

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl jq sqlite3 procps lsof net-tools ca-certificates \
    unzip xz-utils \
  && rm -rf /var/lib/apt/lists/*

# --- Tool binaries ---

# OpenCode v1.2.5
RUN curl -fsSL https://github.com/anomalyco/opencode/releases/download/v1.2.5/opencode-linux-x64.tar.gz \
    | tar xz -C /usr/local/bin/ \
  && chmod +x /usr/local/bin/opencode

# CIE v0.7.20 (code intelligence engine) — binary is named cie-linux-amd64 in tarball
RUN curl -fsSL https://github.com/kraklabs/cie/releases/download/v0.7.20/cie_v0.7.20_linux_amd64.tar.gz \
    | tar xz -C /usr/local/bin/ cie-linux-amd64 \
  && mv /usr/local/bin/cie-linux-amd64 /usr/local/bin/cie \
  && chmod +x /usr/local/bin/cie

# GitHub MCP Server v0.30.3
RUN curl -fsSL https://github.com/github/github-mcp-server/releases/download/v0.30.3/github-mcp-server_Linux_x86_64.tar.gz \
    | tar xz -C /usr/local/bin/ github-mcp-server \
  && chmod +x /usr/local/bin/github-mcp-server

# --- Container-specific config ---
COPY opencode.json /opt/opencode-dev/opencode.json
COPY rules/ /opt/opencode-dev/rules/
COPY agents/ /opt/opencode-dev/agents/
COPY entrypoint.sh /opt/opencode-dev/entrypoint.sh
RUN chmod +x /opt/opencode-dev/entrypoint.sh

WORKDIR /app

# Ports: 4096 (OpenCode Web UI), 3000 (Nuxt dev)
EXPOSE 4096 3000

ENTRYPOINT ["/opt/opencode-dev/entrypoint.sh"]
