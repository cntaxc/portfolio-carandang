FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js ./
COPY lib ./lib
COPY scripts ./scripts
RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 8000
CMD ["node", "server.js"]
