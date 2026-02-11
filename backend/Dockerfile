# Backend Dockerfile
# Multi-stage build for production

# Stage 1: Install all dependencies
FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Production
FROM node:20 AS production
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src/ ./src/

# Create non-root user for security (Debian/Ubuntu syntax)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs --home /app --no-create-home nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start command
CMD ["node", "src/app.js"]
