# Production image: build the React app, then serve it with Nginx.
# Build context is ./frontend (see docker-compose.prod.yml).

# --- Stage 1: build -----------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY . .
RUN npm run build

# --- Stage 2: serve -----------------------------------------------------------
FROM nginx:alpine

# dumb-init forwards signals so the container stops cleanly.
RUN apk add --no-cache dumb-init

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build /usr/share/nginx/html

# Run Nginx as an unprivileged user.
RUN addgroup -g 1001 -S web && \
    adduser -S web -u 1001 -G web && \
    chown -R web:web /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown web:web /var/run/nginx.pid

USER web
EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
