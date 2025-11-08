# TB Group API

## Setup

```bash
cp ../../.env.example ../../.env
docker compose -f ../../docker-compose.db.yml up -d
npm run prisma:migrate -- --name init
npm run bootstrap:admin
npm run dev
npm run openapi:generate
```

## Authentication
- `POST /api/auth/login` — returns access/refresh tokens (15m / configurable days).
- `POST /api/auth/refresh` — rotates refresh token and returns new pair.
- `POST /api/auth/logout` — revokes provided refresh token.

Set secrets via `.env`:

```
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXP_DAYS=30
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=changeMe123!
```

- `/docs` — Swagger UI, powered by zod-to-openapi. Use `npm run openapi:generate` to refresh `openapi.generated.json`.

## Scripts
- `npm run dev` — start API (Express + Prisma).
- `npm run bootstrap:admin` — create initial admin user from env values.
- `npm run prisma:migrate` — run migrations.
- `npm run prisma:generate` — regenerate Prisma client.
- `npm run openapi:generate` — produce OpenAPI spec (`openapi.generated.json`).
