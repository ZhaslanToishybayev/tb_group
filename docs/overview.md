# Project Overview & Setup Guide

## 1. Архитектура
- **status-service/** — Express-приложение статуса:
  - Pino HTTP structured logging, `/metrics` Prometheus endpoint.
  - Фичефлаги и хуки аналитики, Vitest + Supertest тесты.
  - Dockerfile + docker-compose для локального стенда с Prometheus.
- **taskmaster/** — CLI/MCP Task Master:
  - Управление бэклогом, профили для Cursor/Claude и др.
  - Жёсткие пороги покрытия (`src/utils`: statements/lines/functions ≥85 %, branches ≥70 %).
  - MCP server используется VS Code расширением.
- **spec-kit/** и `.specify/` — “спека → план → tasks” через `/speckit.*`, скрипт `.specify/scripts/bash/spec-to-taskmaster.sh` синхронизирует задачи.
- **apps/extension/** — VS Code Kanban extension:
  - Подключается к локальному `taskmaster/dist/mcp-server.js`, fallback на `npx task-master-ai`.
- **docs/** — операционные гайды (workflow, deployment, observability, security-baseline, release notes).
- **releases/** — актуальный архив `base-stack-v0.1.1.tar.gz`.

## 2. Первичная настройка
1. Клонируйте репозиторий и экспортируйте контекст:
   ```bash
   git clone <repo>
   cd project
   export CODEX_HOME=$PWD/.codex
   ```
2. Запустите devcontainer (`.devcontainer/devcontainer.json`) или установите Node ≥ 20.
3. Установите зависимости:
   ```bash
   cd status-service && npm install
   cd ../taskmaster && npm install
   ```
4. Постройте Task Master перед запуском extension:
   ```bash
   npm run build   # внутри taskmaster
   ```
5. Подготовьте ключи в `.env` (минимум один AI‑провайдер).

## 3. Работа со Spec Kit и Task Master
1. В агенте запустите `/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`.
2. Синхронизируйте backlog:
   ```bash
   codex "/tm/spec-sync"
   # или
   bash .specify/scripts/bash/spec-to-taskmaster.sh
   ```
3. Просматривайте задачи через `task-master list`, `task-master show <id>`, берите следующую с `task-master next`.

## 4. Цикл разработки
1. Работайте в ветке/feature каталоге → обновляйте код.
2. Журналируйте прогресс в Task Master (`task-master update-subtask --id=…`).
3. Прогоняйте проверки:
   ```bash
   # status-service
   npm run ci

   # taskmaster
   npm run format-check
   npm run test:ci         # включает покрытие и свалится при падении ниже порогов
   npm run deps:check
   npm run test:coverage   # опционально для отчёта
   ```
4. Для extension — `npm run package:direct` (в `apps/extension/`) после успешного `npm run build` в корне.

## 5. Безопасность
- `npm audit --omit dev` выполняется и результаты сохраняются в:
  - `docs/operations/taskmaster-audit.json`
  - `docs/operations/status-service-audit.json`
- Резюме и актуальная дата — в `docs/operations/security-baseline.md`.
- VS Code extension больше не содержит встроенного Task Master CLI; использует локальную сборку либо fallback `npx`.

## 6. Релизы
1. Убедитесь, что Task Master задачи закрыты (`task-master list` → всё `done`).
2. Прогоните:
   ```bash
   (cd taskmaster && npm run test:ci && npm run build)
   (cd status-service && npm run ci && npm run build)
   ```
3. Сборка extension (опционально):
   ```bash
   (cd taskmaster/apps/extension && npm run package:direct)
   ```
4. Создайте архив:
   ```bash
   tar --exclude='*/node_modules' --exclude='.git' \
       --exclude='coverage' --exclude='apps/extension/vsix-build' \
       --exclude='releases/*.tar.gz' \
       -czf releases/base-stack-v0.1.1.tar.gz .
   ```
5. Документируйте результаты в `docs/releases/base-stack-v0.1.1.md`.

## 7. Дополнительно
- Для локальной observability: `docker compose up --build status-service prometheus`.
- VS Code extension: `code --install-extension task-master-<version>.vsix` после `npm run package:direct` + `npx vsce package --no-dependencies`.
- При обновлении требований повторяйте шаги Spec Kit → `/tm/spec-sync` → Task Master.
