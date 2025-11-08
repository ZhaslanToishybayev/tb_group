# Spec: Foundation Hardening

## Context
The base stack now bundles observability, release automation, and Task Master ↔ Spec Kit workflows, but two gaps remain before we can reuse it as a production-grade template:

1. **Quality gating** — Jest coverage is disabled to keep CI green, leaving the core utility layer unprotected against regressions.
2. **Security hygiene** — The VS Code extension relies on a bundled `task-master-ai` package that drags in a vulnerable `jsondiffpatch` version flagged by `npm audit`.

Without closing these gaps we risk shipping future projects with silent regressions or known vulnerabilities.

## Goals
- Reinstate automated coverage gating focused on the `src/utils` layer with ≥85 % line coverage.
- Eliminate the remaining `npm audit` warnings by removing legacy dependency paths.
- Update the release deliverables and documentation so new projects inherit the hardened baseline.

## Non-Goals
- Rewriting Task Master integration tests outside of the utility layer.
- Changing public CLI APIs or the Spec Kit to Task Master synchronization contract.
- Shipping the VS Code extension to the marketplace (local bundling only).

## Success Metrics
- `npm run test:ci` fails if `src/utils` coverage drops below 85 %.
- `npm audit` reports zero vulnerabilities in both `status-service` and `taskmaster` workspaces.
- Release notes document the new guarantees and the `releases/base-stack-*.tar.gz` artifact is refreshed.
