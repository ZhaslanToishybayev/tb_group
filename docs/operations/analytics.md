# Product Analytics & Feature Flags

## Objectives
- Measure adoption of public status page and admin actions.
- Enable gradual rollout of advanced features (e.g., SMS alerts).

## Instrumentation
- Client events: `status.view`, `status.incident.open`, `admin.incident.create`.
- Server events: `incident.persist.success`, `incident.persist.failure`.
- Server-side logging currently flows through Pino (`trackEvent` in `src/services/analytics.ts`). Replace with Segment/PostHog exporters as needed; buffer when unavailable.

## Data Model
| Event | Properties |
|-------|------------|
| `status.view` | `userId`, `referrer`, `incidentsVisible` |
| `admin.incident.create` | `adminId`, `severity`, `durationEstimate` |

## Feature Flags
- Adopt LaunchDarkly / Statsig / Unleash.
- Flags to consider:
  - `email-notifications`
  - `sla-dashboard`
  - `planned-maintenance-editor`
- Spec Kit tasks should mention the flag lifecycle (enablement criteria, rollback plan).

Current runtime implementation: `FEATURE_FLAGS` env variable powers `isFeatureEnabled(flag)` helper.

## Reporting
- Weekly Task Master reminder to review key metrics.
- Dashboards in Looker/Metabase for leadership.

## Privacy
- Store minimal PII; hash admin identifiers where feasible.
- Ensure data retention policy documented in `docs/compliance.md` (todo).
