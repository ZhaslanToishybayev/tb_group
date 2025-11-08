# Tasks: Status Page MVP

## Phase 1: Incident Persistence (Core)

- [ ] T101 Create `status-service/src/services/incidents.ts` with SQLite-backed storage (default database at `status-service/data/incidents.sqlite`, override via `INCIDENTS_DB_PATH`), exposing helper methods for `list`, `create`, and `clear`.
- [ ] T102 Wire the admin POST handler in `status-service/src/routes/admin.ts` to persist submissions through the incident service instead of the current TODO and bubble persistence errors.
- [ ] T103 Load incidents from the service in both public and admin routes so views render real data and surface validation feedback.

## Phase 2: Admin Experience

- [ ] T104 Add basic server-side validation (title required, status one of allowed values) and flash feedback on the admin form template (`status-service/src/views/admin.pug`).
- [ ] T105 Extend analytics tracking to include incident IDs/status transitions for observability audits.

## Phase 3: Public Experience

- [ ] T106 Update `status-service/src/views/index.pug` to show incident timestamps and status labels with minimal styling.
- [ ] T107 Ship a lightweight stylesheet under `status-service/public/styles.css` and serve it via Express static middleware.

## Phase 4: Observability & Tests

- [ ] T108 Track admin incident processing latency with a new Prometheus histogram in `status-service/src/services/metrics.ts`.
- [ ] T109 Add integration test coverage for “admin create → public list” flow in `status-service/tests/status.spec.ts`.
- [ ] T110 Publish Prometheus gauge for incident status counts and ensure zeroed labels on reset.
- [ ] T111 Introduce `docker compose --profile observability up` with Prometheus + Grafana provisioning and a starter dashboard.
- [ ] T112 Ship `npm run dev:seed` to reload demo data into the SQLite store.

## Phase 5: Production Hardening

- [ ] T113 Extract persistence behind an incident repository interface to enable alternative backends (e.g., Postgres).
- [ ] T114 Document database overrides + seeding workflow for future deploys.
