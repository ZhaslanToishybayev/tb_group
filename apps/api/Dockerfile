# Use Node.js runtime
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY apps/admin/package*.json ./apps/admin/
COPY packages/*/package*.json ./packages/*/

# Install dependencies
RUN npm ci --only=production

# Copy Prisma files
COPY apps/api/prisma ./apps/api/prisma

# Generate Prisma client
RUN npm --prefix apps/api run prisma:generate

# Copy source code
COPY apps/api/src ./apps/api/src
COPY packages/ ./packages/

# Build the application
RUN npm --prefix apps/api run build

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=base /app/apps/api/prisma ./apps/api/prisma
COPY --from=base /app/packages ./packages

# Create required directories
RUN mkdir -p logs backups uploads

# Set permissions
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/api/dist/server.js"]