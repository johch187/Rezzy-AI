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

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential curl ca-certificates && \
    curl -L -o /tmp/tectonic.deb "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${TECTONIC_VERSION}/tectonic_${TECTONIC_VERSION}_amd64.deb" && \
    apt-get install -y --no-install-recommends /tmp/tectonic.deb && \
    rm -rf /var/lib/apt/lists/* /tmp/tectonic.deb

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
