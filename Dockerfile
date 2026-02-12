# Order Desk - Railway deployment with Puppeteer support
FROM node:20-slim

# Chromium dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    gnupg wget ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 \
    libnss3 libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 libxrandr2 \
    xdg-utils \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN cd client && npm ci --omit=dev && npm run build

EXPOSE 3000

# Railway sets PORT at runtime; server uses process.env.PORT
CMD ["node", "server/index.js"]
