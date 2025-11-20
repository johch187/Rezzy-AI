# Testing

## Frontend
- Run lint/type-check: `npm run lint` (tsc --noEmit)
- Run unit tests: `npm run test` (Vitest, jsdom)

## Backend
- Run tests: `cd backend && pytest`
- Minimal health check test included. Add more API tests via httpx ASGI transport.
