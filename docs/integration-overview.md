# Spec Kit ↔ Task Master Infrastructure Guide

This document explains how the project’s planning (Spec Kit) and execution (Task Master) layers work together, why the workflow is structured this way, and what a fresh AI session must know to stay aligned.

## 1. Architecture Snapshot

| Layer | Role | Key Paths |
|-------|------|-----------|
| Spec Kit | Captures product intent, plans, and story-based task lists | `.specify/`, `specs/<feature>/` |
| Automation bridge | Converts Spec Kit task lists into a Task Master–readable PRD | `.specify/scripts/bash/spec-to-taskmaster.sh` |
| Task Master | Tracks execution status, dependencies, and subtasks | `.taskmaster/` (`config.json`, `tasks/`, `docs/`) |
| Delivery projects | Houses runnable code + quality tooling | `status-service/` |
| CI/CD | Validates code and tasks on every push | `.github/workflows/ci.yml` |
| Agent instructions | Keeps conversational agents aware of the workflow | `AGENT.md`, `.claude/commands/tm/spec-sync.md`, `.taskmaster/AGENT.md`, `.taskmaster/CLAUDE.md` |

**Why this split?**
- Spec Kit enforces “spec → plan → tasks” discipline so requirements are explicit before code starts.
- Task Master owns the live backlog (status, dependencies, telemetry). It is the single source of truth once tasks are approved.
- The bridge script keeps both views in sync without manual copy/paste, so teams can iterate specs safely while preserving execution history.

## 2. Environment & Session Bootstrap

1. `export CODEX_HOME=/home/zhaslan/Downloads/bitrix24/.codex` — enables `/speckit.*` slash commands inside Codex CLI (`.taskmaster/AGENT.md:5`).
2. Load credentials (`source .env` or set providers manually); Task Master reads API keys from there.
3. Ensure Spec Kit helpers are executable: `chmod +x .specify/scripts/bash/*.sh` (already applied).
4. Provide a feature context for Spec Kit by checking out a branch like `001-feature-name` or exporting `SPECIFY_FEATURE=001-feature-name`.
5. Optional but recommended: run `task-master models --setup` to confirm model assignments (`.taskmaster/config.json`).

These steps are required whenever a new shell or AI session starts; they guarantee both toolchains are reachable.

## 3. Creating or Updating Feature Specs

Use the Spec Kit slash-command sequence in Codex/Claude (works in any order once prerequisites are satisfied):

1. `/speckit.constitution` — define or amend project principles in `.specify/memory/`.
2. `/speckit.specify "<feature description>"` — scaffolds `specs/<feature>/spec.md` and related checklist.
3. `/speckit.plan` — fills `plan.md`, `research.md`, `data-model.md`, etc., and updates agent instructions.
4. `/speckit.tasks` — generates `tasks.md` with story-driven task IDs.

All artifacts are stored under `specs/<feature>/`. They remain the authoritative documentation even after tasks are synchronized.

## 4. Delivery Repositories & Quality Tooling

- `status-service/` is the primary application workspace aligned with Spec Kit plans.
  - `package.json` defines scripts (`npm run ci`, `npm run lint`, `npm run test`).
  - Quick fixtures: `npm run dev:seed` wipes/represents incidents for demos.
  - `eslint.config.js`, `vitest.config.ts`, `tsconfig.json` enforce quality gates (tests use `tsconfig.vitest.json`).
  - Observability baked in: Pino HTTP logging, Prometheus metrics (`/metrics` endpoint, see `src/services/metrics.ts`), Grafana profile via `docker compose --profile observability up`.
  - Incident data persists to disk in a SQLite store (`status-service/data/incidents.sqlite`, override with `INCIDENTS_DB_PATH`); service recreates the schema automatically on first run.
  - Persistence goes through `configureIncidentRepository` so production can swap in Postgres/remote adapters without refactoring routes.
  - Feature flags (`FEATURE_FLAGS`) and analytics hooks (`trackEvent`) wired for future instrumentation.
  - Containerisation ready (`status-service/Dockerfile`) and local stack via `docker-compose.yml` + `observability/prometheus.yml`.
  - Tests live under `status-service/tests/` and run via Vitest + Supertest.
- Task Master workspace (`taskmaster/`) retains its original tooling; CI calls `format-check`, `test:ci`, and `deps:check` to ensure stability.

### Local Development Environment
- `.devcontainer/devcontainer.json` provisions Node 20, ESLint, Prettier, GitHub Actions tooling, installs dependencies, and makes the Task Master CLI available.
- Developers without devcontainers can follow `docs/development-workflow.md` for manual setup steps.

## 5. Automation Bridge Explained

File: `.specify/scripts/bash/spec-to-taskmaster.sh`  
Highlights:

- Detects the active feature directory via `SPECIFY_FEATURE`/branch lookup (`check-prerequisites.sh`).
- Requires `tasks.md`; if missing, prompts you to run `/speckit.tasks`.
- Uses Python (configurable via `PYTHON_BIN`) to normalize tasks into a succinct PRD (`.taskmaster/docs/speckit-sync-prd.txt`) where each task becomes `Txxx: Description`.
- Invokes `task-master parse-prd … --force` to seed or refresh Task Master’s backlog, then runs `task-master generate` to regenerate per-task markdown files.

This script is idempotent. Running it again overwrites the Task Master backlog with the latest Spec Kit tasks, ensuring the execution tracker mirrors the approved plan.

## 6. One-Command Sync via Codex

Shortcut: `.claude/commands/tm/spec-sync.md`  
What it does:

1. Assumes `/speckit.tasks` has been executed for the active feature.
2. Runs `bash .specify/scripts/bash/spec-to-taskmaster.sh`.
3. Calls `task-master list` to confirm the updated backlog.
4. Summarizes any issues to the user/agent.

**Usage pattern:** After revising a spec or regenerating tasks, type `codex "/tm/spec-sync"` (or the equivalent in Claude). No manual shell work is required beyond that command.

## 7. Day-to-Day Task Master Usage

- Inspect backlog: `task-master list`, `task-master show <id>`.
- Progress work: `task-master set-status --id=<id> --status=in-progress|done`, `task-master next`.
- Evolve backlog: `task-master add-task`, `task-master expand`, `task-master update-subtask`, etc.
- Regenerate context after manual tweaks: `task-master generate`.

Task Master’s instructions (`.taskmaster/AGENT.md`, `.taskmaster/CLAUDE.md`) are imported into all agent files (see `AGENT.md`, `CLAUDE.md` at repo root), so every assistant starts with the latest operational guidance.

## 8. Bringing a New AI Session Up to Speed

When opening a new chat (Codex, Claude, Gemini, etc.):

1. Load or mention this document (`docs/integration-overview.md`) for context.
2. Confirm environment bootstrap (Section 2).
3. Review `AGENT.md` / `CLAUDE.md` to inherit Task Master guidelines.
4. If continuing an existing feature, run `/tm/spec-sync` to make sure the backlog reflects the latest `tasks.md`.
5. Use `task-master next` or `task-master show <id>` to resume work.

A short prompt for cold-start sessions:
```
Consult docs/integration-overview.md. Workflow = Spec Kit docs → /tm/spec-sync → Task Master backlog. Follow automation script for sync.
```

## 9. Operational Runbooks

- `docs/operations/observability.md` — metrics, alerts, dashboards.
- `docs/operations/secrets.md` — secret rotation policy and tooling.
- `docs/operations/analytics.md` — instrumentation & feature flags.
- `docs/operations/deployment.md` — release & rollback strategies.
- `docs/development-workflow.md` — end-to-end routine for contributors.

Always update these documents in tandem with Spec Kit/Task Master changes to keep new AI sessions aligned.

## 10. Troubleshooting & Tips

- **Branch errors**: The bridge script demands `SPECIFY_FEATURE` or a branch named `###-*`. Switch branches or export the variable before syncing.
- **Missing python/jq**: Install system packages (`python3`, `jq`) or adjust `PYTHON_BIN` in the environment.
- **Large PRDs**: `task-master parse-prd` consumes tokens; keep `tasks.md` focused. Consider running `task-master expand` afterward for fine-grained subtasks.
- **Manual Task Master edits**: Always run `task-master generate` if tasks are changed via CLI to keep markdown files in sync.
- **Spec updates post-sync**: Re-run `/speckit.tasks` and `/tm/spec-sync` to overwrite Task Master with the revised scope.

## 11. Summary

1. Spec Kit captures intent and produces `tasks.md`.
2. `spec-to-taskmaster.sh` converts tasks into Task Master’s backlog automatically.
3. Task Master drives execution, while agent files keep every assistant in sync.

Following these steps guarantees that any future AI (or human) session immediately understands where plans live, how the backlog is populated, and how to keep both ends aligned.
