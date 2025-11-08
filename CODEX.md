# Codex CLI Integration

## Environment Setup
- Run `export CODEX_HOME=/home/zhaslan/Downloads/bitrix24/.codex` before launching Codex CLI so the `/speckit.*` prompts resolve.
- Keep API keys for Taskmaster in `.env` (copy from `.env.example`) and restart Codex after updating environment variables.

## Spec Kit Slash Commands
- `/speckit.constitution` → establish or amend project principles in `.specify/memory/`.
- `/speckit.specify` → capture product requirements at a spec level.
- `/speckit.plan` → generate technical implementation plan tied to the spec.
- `/speckit.tasks` → break the plan into executable tasks.
- `/speckit.implement` → (optional) let the agent implement from the plan once Taskmaster backlog is aligned.
- `/speckit.clarify`, `/speckit.checklist`, `/speckit.analyze` → enrichment utilities for clarifications, QA checklists, and cross-artifact analysis.

## Taskmaster Commands (run in terminal panes the agent opens)
- `task-master parse-prd .taskmaster/docs/prd.txt --append` to import new work items captured by Spec Kit.
- `task-master list`, `next`, `show <id>`, `set-status --id=<id> --status=…` to drive execution.
- `task-master add-task --prompt="..." --research` for ad-hoc items surfaced during Spec Kit clarifications.
- `task-master generate` after structural changes so `.taskmaster/tasks/` markdown remains in sync for Codex context.

## Workflow Tips
- Treat `.specify/` as the living specification and `.taskmaster/` as the single source of truth for status.
- When Spec Kit updates scope, reflect the changes immediately in Taskmaster and note the linkage inside the relevant Taskmaster task.
- Use Codex slash commands for drafting/updating specs, then call Taskmaster commands for scheduling, tracking, and logging implementation progress.
- Keep `docs/integration-overview.md` and the `docs/operations/` runbooks up to date—Codex sessions rely on them for context continuity.
