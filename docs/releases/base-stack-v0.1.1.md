# Base Stack v0.1.1 — релиз стабилизации

## Что входит
- **status-service** — сервис статуса с логированием (Pino), метриками Prometheus, хуками аналитики и фичефлагами.
- **taskmaster** — CLI + MCP сервер с включённым покрытием для `src/utils`, обновлёнными тестами и логикой подключения VS Code extension к локальной сборке.
- **Spec Kit** — шаблоны и скрипты (`.specify/scripts/bash/spec-to-taskmaster.sh`) для автоматической синхронизации задач.
- **Документация** — обновлённые гайды (`docs/`, `AGENT.md`, `CLAUDE.md`), включая workflow с новыми требованиями к покрытиям.
- **Инфраструктура** — devcontainer, observability стек (`docker-compose.yml`, `observability/`), GitHub Actions (`.github/`), готовый VS Code extension без встроенного уязвимого CLI.

## Проверено перед релизом
| Команда | Назначение | Статус |
|---------|------------|--------|
| `npm run ci` (в `status-service/`) | lint + prettier-check + vitest | ✅ |
| `npm run build` (в `status-service/`) | сборка TypeScript | ✅ |
| `npm run test:ci` (в `taskmaster/`) | Jest с включённым покрытием `src/utils` (порог: statements/lines/functions ≥85 %, branches ≥70 %) | ✅ |
| `npm run build` (в `taskmaster/`) | tsdown билд CLI + MCP | ✅ |
| `npm audit --omit dev` (в `taskmaster/`) | проверка уязвимостей | ✅ (0) |
| `npm audit --omit dev` (в `status-service/`) | проверка уязвимостей | ✅ (0) |

## Артефакт релиза
- `releases/base-stack-v0.1.1.tar.gz` — архив без `node_modules`, содержит актуальный код, документацию и собранные `dist/`.

### Как распаковать
```bash
tar -xzvf releases/base-stack-v0.1.1.tar.gz
```

## Быстрый старт после распаковки
1. **Подготовьте окружение**
   ```bash
   export CODEX_HOME=/path/to/project/.codex
   source .env  # добавьте ключи для хотя бы одного AI-провайдера
   ```
2. **Установите зависимости**
   ```bash
   cd status-service && npm install
   cd ../taskmaster && npm install
   ```
3. **Постройте локальные артефакты**
   ```bash
   npm run build  # внутри taskmaster — требуется для VS Code extension
   ```
4. **Синхронизируйте план → задачи**
   - Обновите спецификацию через Spec Kit (`/speckit.*`).
   - Выполните `codex "/tm/spec-sync"` или `bash .specify/scripts/bash/spec-to-taskmaster.sh`.
5. **Начните разработку**
   - Посмотрите очередь `task-master list` или `task-master next`.
   - Запускайте проверки: `npm run ci` (status-service), `npm run test:ci` + `npm run deps:check` (taskmaster). Для локального отчёта покрытия используйте `npm run test:coverage`.
6. **Деплой примера**
   - `docker compose up --build status-service prometheus` для локальной проверки метрик и страницы статуса.

## Что важно знать
- **Coverage gate**: Jest теперь падает, если покрытие `src/utils` опускается ниже 85 % (statements/lines/functions) или 70 % (branches). Поддерживайте новую базу тестами.
- **VS Code extension**: MCP сервер больше не поставляется внутри зависимостей — расширение использует локальный `taskmaster/dist/mcp-server.js` и при отсутствии сборки откатывается к `npx task-master-ai`.
- **Security baseline**: JSON отчёты `npm audit --omit dev` сохранены в `docs/operations/taskmaster-audit.json` и `docs/operations/status-service-audit.json`; резюме в `docs/operations/security-baseline.md`.
- **Архив**: в `releases/` отсутствуют `node_modules`; все сборки готовятся через `npm run build` перед упаковкой.

## Рекомендации для следующего шага
1. Настроить автоматическую публикацию релизов (например, через `changeset` + GitHub Releases) с автогенерацией release notes на основе Task Master.
2. Добавить интеграционные тесты на ветки с аналитикой/фичефлагами в `status-service`.
3. Расширить покрытие в Task Master за пределы `src/utils` перед повышением порогов.
4. Поддерживать документацию (`docs/`, `.specify/`, `.taskmaster/`) в актуальном состоянии при каждом изменении процессов.

Этот релиз можно использовать как основу для масштабируемых проектов: он включает сквозной поток «спека → задачи → код → покрытие → экспорта» и обновлённый безопасный VS Code extension.
