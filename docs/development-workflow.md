# Development Workflow

1. Clone repo and set `export CODEX_HOME=/home/zhaslan/Downloads/bitrix24/.codex`.
2. Launch devcontainer (`.devcontainer/devcontainer.json`) or ensure Node ≥20 locally.
3. Install dependencies:
   - `cd status-service && npm install`
   - `cd taskmaster && npm install`
4. Generate or update specs via Spec Kit commands (`/speckit.*`).
5. Sync tasks: `codex "/tm/spec-sync"`.
6. Pick work item: `task-master next` or `task-master show <id>`.
7. Implement code under `status-service/src/…`; keep tests in `status-service/tests/`.
   - Для демонстрации заполните БД `sqlite`: `npm run dev:seed` (повторный запуск очищает прошлые инциденты).
8. Run quality checks:
   - `npm run ci` (status-service)
   - `npm run format-check`, `npm run test:ci`, `npm run deps:check` (taskmaster — `test:ci` теперь включает покрытие `src/utils` с порогами 85 %/85 %/85 %/70 %; для локального отчёта можно дополнительно запустить `npm run test:coverage`)
   - `npm run build` (taskmaster) — подготовьте `dist/` перед запуском VS Code extension, которая теперь использует локальную сборку MCP server
9. Before PR:
   - Update docs if workflow changed (`docs/*.md`).
   - Confirm Task Master statuses updated.
10. Optional: `npm run build` (status-service) + `docker compose up --build status-service` to smoke-test the container; добавьте мониторинг командой `docker compose --profile observability up` (Prometheus `:9090`, Grafana `:3001`).
11. CI will re-run lint/tests automatically; address failures before merge.
