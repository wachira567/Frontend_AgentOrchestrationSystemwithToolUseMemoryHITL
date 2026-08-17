# ==========================================
# Multi-Stage Production Dockerfile: Frontend
# ==========================================

# ----------------- Stage 1: Build -----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm ci

# Copy source code and build configurations
COPY . .

# Run Vite build to output optimized static bundle in /app/dist
RUN npm run build

# ----------------- Stage 2: Serve -----------------
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with API proxy and SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
