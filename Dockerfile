# Multi-stage Dockerfile optimized for UGREEN NAS (UGOS Docker) and standard Docker environments
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install all dependencies including build devDependencies
RUN npm install

# Copy application source
COPY . .

# Build Vite client production assets
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json ./
RUN npm install --omit=dev

# Copy compiled frontend from builder
COPY --from=builder /app/dist ./dist
# Copy backend source and server configuration
COPY server.ts ./
COPY src ./src
COPY tsconfig.json ./

# Expose web application port
EXPOSE 3000

# Healthcheck for Ugreen NAS Docker Container Manager
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/stats || exit 1

# Start full-stack Node server using tsx
CMD ["npx", "tsx", "server.ts"]
