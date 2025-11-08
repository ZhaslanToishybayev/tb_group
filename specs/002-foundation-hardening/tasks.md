# Tasks: Foundation Hardening

## Phase 1: Coverage Guardrails

- [ ] T201 Define coverage scope and enable gating in `jest.config.js`
- [ ] T202 Add targeted tests for `src/utils` (stream parser, timeout manager, helpers) to reach ≥85 % coverage

## Phase 2: Dependency Hygiene

- [ ] T203 Refactor VS Code extension to drop vulnerable bundled dependencies and reuse workspace build
- [ ] T204 Re-run `npm audit` (status-service + taskmaster) and document the clean baseline

## Phase 3: Release Refresh

- [ ] T205 Update developer + release docs to describe new guardrails
- [ ] T206 Rebuild `releases/base-stack-v*.tar.gz` after validations
