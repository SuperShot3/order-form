# Order Desk - Railway deployment with Puppeteer support
FROM node:20-slim

# Install Chromium + deps (faster than Puppeteer downloading ~200MB)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
    libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 libxcomposite1 \
    libxdamage1 libxfixes3 libxkbcommon0 libxrandr2 xdg-utils \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Skip Puppeteer's Chromium download (saves ~2-5 min build time)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN cd client && npm ci --omit=dev && npm run build

EXPOSE 3000

# Railway sets PORT at runtime; server uses process.env.PORT
CMD ["node", "server/index.js"]
