# Plan: Foundation Hardening

## Phase 1 – Coverage Guardrails
1. Define the coverage scope for reusable utilities (`src/utils/**`).
2. Enable coverage collection in `jest.config.js` and add thresholds.
3. Backfill targeted tests (stream parser, timeout manager, formatting helpers, path utilities).

## Phase 2 – Dependency Hygiene
1. Decouple the VS Code extension from the legacy bundled `task-master-ai` dependency.
2. Point the extension to the workspace build outputs and verify the build scripts.
3. Re-run `npm audit` across both workspaces until reports are clean.

## Phase 3 – Release Refresh
1. Update docs (development workflow, operations, release notes) with the new guardrails.
2. Regenerate the release archive with the hardened baseline.
3. Capture follow-up actions (e.g., future expansion of coverage scope) in Task Master.
