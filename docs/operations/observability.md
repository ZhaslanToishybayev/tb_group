# Observability Playbook

## Goals
- Provide actionable visibility into the status page service health.
- Detect regressions introduced via automated deployments.
- Offer breadcrumbs for on-call or AI agents investigating incidents.

## Metrics
| Metric | Source | Notes |
|--------|--------|-------|
| `status_service_render_duration_seconds` | `src/services/metrics.ts` histogram | Automatically tracks view render latency by route. |
| `status_service_incident_updates_total` | `incidentUpdateCounter.inc()` in admin route | Count of incident submissions (used for throughput alerting). |
| `status_service_incident_status_total` | `setIncidentStatusGauge()` in incidents service | Gauge of open incidents by status label (investigating/identified/monitoring/resolved). |
| Default system metrics | `prom-client` `collectDefaultMetrics()` | CPU, memory, event loop lag. |
| Health endpoint uptime | Synthetic checks (GitHub Action or external service) | Failures page on-call. |
| Task Master backlog size | `task-master list --json` | Alert when pending high-priority tasks > threshold. |

## Logs
- Use structured JSON logs (Pino via `src/services/logger.ts`) for request events.
- Redact secrets before logging (`config.redact`).
- Forward logs to centralized store (CloudWatch, ELK, Grafana Loki).

## Traces
- Wrap Express with OpenTelemetry auto-instrumentation.
- Propagate trace IDs to frontend so user reports can be correlated.

## Alerts
- Budget latency >200ms p95 for public route.
- Health endpoint failure triggers PagerDuty/Slack.
- CI/CD failure or `task-master validate-dependencies` issues ping dev channel.

- Run `docker compose --profile observability up` to spin up Prometheus + Grafana (dashboards auto-provisioned from `observability/grafana/`).

## Dashboards
- Status overview: traffic, errors, incidents.
- Incident workflow: timeline of admin actions.
- Deploy vs. error correlation: overlay release tags with error rates.

## Local Observability
- Provide `npm run dev:trace` script enabling OTEL exporter to console.
- Use the new `observability` compose profile for a one-command monitoring sandbox.
