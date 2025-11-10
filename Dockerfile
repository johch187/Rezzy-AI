FROM node:20 AS builder
WORKDIR /app

# Accept build-time arguments for client-side environment variables
# These are embedded in the client bundle during build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set as environment variables for Vite to pick up during build
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Copy package files
COPY package*.json ./
# Install dependencies (using npm install since package-lock.json may not exist)
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy package files and install production dependencies
COPY package*.json ./
# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build/server ./build/server

# Create non-root user and set permissions
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user for security
USER nodejs

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Note: Cloud Run performs HTTP health checks automatically via the service endpoint
# The /api/health endpoint will be used for health monitoring

# Start the server
CMD ["node", "build/server/index.js"]
