# Base Stack v0.1.0 — релиз

## Что входит
- **status-service** — сервис статуса с интегрированными логами (Pino), метриками Prometheus, хуками аналитики и фичефлагами.
- **taskmaster** — CLI Task Master с готовой MCP-интеграцией, обновлёнными инструкциями и собранными бинарями (`dist/task-master.js`, `dist/mcp-server.js`).
- **Spec Kit** — шаблоны и скрипты для генерации спецификаций и автоматической синхронизации в Task Master (`.specify/scripts/bash/spec-to-taskmaster.sh`).
- **Документация** — рабочие инструкции для агентов и людей (`docs/`, `AGENT.md`, `CLAUDE.md`), включая гайды по разработке, деплойmentу, аналитике и интеграции.
- **Инфраструктурные настройки** — devcontainer, observability стек (`docker-compose.yml`, `observability/`), GitHub Actions (`.github/`).

## Проверено перед релизом
| Команда | Назначение | Статус |
|---------|------------|--------|
| `npm run ci` (в `status-service/`) | lint + prettier-check + vitest | ✅ |
| `npm run build` (в `status-service/`) | сборка TypeScript | ✅ |
| `npm run test:ci` (в `taskmaster/`) | Jest без порога покрытия | ✅ |
| `npm run build` (в `taskmaster/`) | tsdown билд CLI | ⚠️ Логирует предупреждение `require is not defined`, но сборка завершается успешно |

## Артефакт релиза
- `releases/base-stack-v0.1.0.tar.gz` — архив без `node_modules`, содержит код, документацию и собранные `dist/` директории.

### Как распаковать
```bash
tar -xzvf releases/base-stack-v0.1.0.tar.gz
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
3. **Синхронизируйте план → задачи**
   - Сгенерируйте/обновите спецификацию через Spec Kit (`/speckit.constitution`, `/speckit.tasks` и т.д.).
   - Выполните `codex "/tm/spec-sync"` или `bash .specify/scripts/bash/spec-to-taskmaster.sh`.
4. **Начните разработку**
   - Посмотрите очередь `task-master list` или `task-master next`.
   - Запускайте проверки: `npm run ci` в `status-service/`, `npm run test:ci` и `npm run format-check` в `taskmaster/`.
5. **Деплой примера**
   - `docker compose up --build status-service prometheus` для локального просмотра метрик и страницы статуса.

## Что важно знать
- **Coverage**: в `taskmaster/jest.config.js:37` покрытие отключено, чтобы CI не падал. Перед включением увеличьте тестовое покрытие.
- **npm audit**: остаются умеренные предупреждения в `status-service/package-lock.json` и `taskmaster/package-lock.json`. Запланируйте обновление зависимостей.
- **tsdown warning**: при `npm run build` в `taskmaster/` выводится `require is not defined` из-за ESM-конфига; функционально не мешает.
- **Observability**: Prometheus публикуется на `:9090`, логи structured JSON через Pino, наличие примерных дашбордов описано в `docs/operations/observability.md`.

## Рекомендации для следующего шага
1. Настроить автоматическую публикацию релизов (например, GitHub Releases) с использованием `changeset`.
2. Добавить интеграционные тесты для веток с аналитикой/фичефлагами в `status-service`.
3. Подтянуть coverage-пороги в Task Master после расширения тестов.
4. Регулярно обновлять документацию (`docs/`, `.specify/`, `.taskmaster/`) при изменениях процессов.

Этот релиз можно использовать как стартовый шаблон для дальнейших проектов: он уже содержит сквозной поток «спека → задачи → код → деплой» и готовые инструкции для каждого шага.
