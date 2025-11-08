# Deployment & Release Management

## Pipelines
- GitHub Actions workflow `CI` runs on every push/PR (`.github/workflows/ci.yml`).
- Deployment skeleton ready: `.github/workflows/deploy.yml` builds the `status-service` container image (see `status-service/Dockerfile`) and can be extended to push to a registry or trigger your platform deploy.
- Local smoke tests: `docker compose up --build status-service` (Prometheus available on `:9090` when `prometheus` service enabled).

## Environments
| Stage | Purpose | Notes |
|-------|---------|-------|
| `dev` | Feature validation, rapid iteration | Auto-deploy from PR branches using preview URLs. |
| `staging` | End-to-end verification | Gate to production; run smoke + load tests. |
| `prod` | Customer-facing | Blue/green or canary recommended. |

## Release Process
1. Ensure Task Master tasks for current release are `done`.
2. Tag repository (`git tag vX.Y.Z`) and trigger the `Deploy` workflow (manually or via push).
3. Publish release notes derived from Task Master (`task-master export --format release-notes` future).
4. Monitor dashboards (see observability doc) for 30 minutes; ready to roll back.

## Rollback
- Keep previous container image available.
- Use feature flags to disable risky functionality quickly.
- Document incident post-mortems in `docs/postmortems/YYYY-MM-DD.md`.

## Data Store & Persistence
- Default runtime uses SQLite under `status-service/data/incidents.sqlite`; change location with `INCIDENTS_DB_PATH`.
- Persistence goes through `configureIncidentRepository` — implement and register a Postgres adapter to share incidents across replicas.
- Seed or refresh demo data locally with `npm run dev:seed` (resets the SQLite file before inserting fixtures).

## Change Management
- All structural changes should be captured via Spec Kit updates → `/tm/spec-sync`.
- Add Task Master dependencies to enforce order (e.g., deploy blocked until tests pass).
