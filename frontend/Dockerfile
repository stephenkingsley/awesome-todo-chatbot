# Frontend Dockerfile
# Multi-stage build for production

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copy build files from root context
COPY package*.json ./
COPY vite.config.js ./
COPY index.html ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY public/ ./

# Copy source files from root context
COPY src/ ./src/

# Install dependencies - use npm install directly
RUN npm install

# Build
RUN npm run build

# Stage 2: Production serve
FROM nginx:alpine AS production

# Copy nginx config from frontend directory
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Security: non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    rm -rf /var/cache/nginx/*

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
