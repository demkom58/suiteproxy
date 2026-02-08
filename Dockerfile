FROM oven/bun:latest

# Install Chrome dependencies for Puppeteer (Heartbeat logic)
RUN apt-get update && apt-get install -y wget gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && apt-get install -y google-chrome-stable fonts-ipafont-gothic libxss1 --no-install-recommends

WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

# Use local Chromium for renewals
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]

