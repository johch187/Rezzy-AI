## Build frontend
FROM node:20-slim AS frontend
WORKDIR /app

# Build args for injecting client config (publishable Supabase key is safe to embed)
ARG VITE_API_BASE_URL=/
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

## Backend / runtime
FROM python:3.11-slim AS runtime
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

ARG TECTONIC_VERSION=0.15.0
ARG TECTONIC_ARCH=x86_64-unknown-linux-gnu

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    curl -L -o /tmp/tectonic.tar.gz "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${TECTONIC_VERSION}/tectonic-${TECTONIC_VERSION}-${TECTONIC_ARCH}.tar.gz" && \
    mkdir -p /tmp/tectonic && tar -xzf /tmp/tectonic.tar.gz -C /tmp/tectonic && \
    find /tmp/tectonic -type f -name tectonic -exec mv {} /usr/local/bin/tectonic \; && \
    chmod +x /usr/local/bin/tectonic && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend /app/backend
COPY --from=frontend /app/dist /app/frontend
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV FRONTEND_DIST=/app/frontend
ENV PORT=8080

EXPOSE 8080
CMD ["./start.sh"]
