# Universal Integration Guide - 100% Интеграция Всех Инструментов

## Обзор

Этот гид описывает 100% интеграцию между Spec Kit, Task Master, KILO Code и другими инструментами для бесшовной разработки.

## Архитектура интеграции

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Spec Kit      │◄──►│   Task Master    │◄──►│   KILO Code      │
│                 │    │                  │    │                 │
│ • User Stories  │    │ • Task Management│    │ • GLM-4.6 Model  │
│ • Implementation │    │ • AI Providers   │    │ • Analysis       │
│ • Testing       │    │ • Dependencies   │    │ • Recommendations│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  MCP Protocol   │
                    │                 │
                    │ • Universal API │
                    │ • Tool Bridge   │
                    │ • Context Share │
                    └─────────────────┘
```

## Компоненты интеграции

### 1. Universal Integration Script
**Файл**: `.specify/scripts/bash/universal-integration.sh`

Основной скрипт, который обеспечивает интеграцию всех инструментов:
- Extracts задачи из Spec Kit
- Синхронизирует с Task Master
- Отправляет в KILO Code для анализа
- Генерирует комплексный отчет

### 2. MCP Server для Spec Kit
**Файл**: `.specify/scripts/mcp-server.js`

Model Context Protocol сервер для Spec Kit:
- `spec_kit_extract_tasks` - извлечение задач
- `spec_kit_create_feature` - создание фичи
- `spec_kit_sync_to_taskmaster` - синхронизация с Task Master
- `spec_kit_sync_to_kilo` - синхронизация с KILO Code
- `spec_kit_analyze_feature` - анализ фичи

### 3. MCP Конфигурация
**Файл**: `.mcp-kilo.json`

Конфигурация MCP для всех инструментов:
- Task Master AI
- KILO Code (GLM-4.6)
- Claude Code
- Spec Kit MCP Server

## Использование

### Базовый workflow

```bash
# 1. Создать новую фичу
.speckit.specify "Implement user testimonials with video support"

# 2. Настроить план реализации
.speckit.plan

# 3. Сгенерировать задачи
.speckit.tasks

# 4. Запустить универсальную интеграцию
bash .specify/scripts/bash/universal-integration.sh
```

### Прямая интеграция через MCP

```bash
# Использовать MCP сервер напрямую
mcp call spec_kit_extract_tasks --feature-dir "specs/001-testimonials"

# Синхронизировать с Task Master
mcp call spec_kit_sync_to_taskmaster --feature-dir "specs/001-testimonials" --provider "claude-code"

# Отправить в KILO Code
mcp call spec_kit_sync_to_kilo --feature-dir "specs/001-testimonials" --model "glm-4.6"

# Проанализировать фичу
mcp call spec_kit_analyze_feature --feature-dir "specs/001-testimonials" --analysis_type "implementation"
```

## Интеграция с различными AI провайдерами

### Task Master провайдеры

Скрипт автоматически пробует различные провайдеры в порядке приоритета:
1. **Claude Code** - лучший выбор для кода
2. **Codex CLI** - мощный, но требует настройки
3. **OpenRouter** - доступ к различным моделям
4. **OpenAI** - fallback вариант

### KILO Code интеграция

Прямая интеграция с GLM-4.6:
- Автоматическая генерация промптов
- Контекст проекта
- Структурированные рекомендации

### Другие AI инструменты

Поддержка дополнительных инструментов:
- Claude Code
- Gemini
- Codex CLI

## Файлы и директории

```
.specify/
├── scripts/bash/
│   ├── universal-integration.sh    # Основной скрипт интеграции
│   ├── spec-to-taskmaster-kilo.sh  # KILO Code версия
│   ├── spec-to-taskmaster-manual.sh # Ручная версия
│   └── mcp-server.js               # MCP сервер для Spec Kit
├── temp/                           # Временные файлы
│   ├── kilo-prompt.md              # Промпты для KILO Code
│   ├── kilo-response.md            # Ответы KILO Code
│   ├── taskmaster.log              # Логи Task Master
│   └── integration-report.md       # Отчет интеграции
└── templates/                      # Шаблоны документов

.mcp-kilo.json                     # MCP конфигурация

docs/
├── universal-integration-guide.md  # Этот гид
├── spec-kit-workflow.md           # Spec Kit workflow
└── spec-kit-sync-status.md        # Статус синхронизации
```

## Пример использования

### Создание фичи отзывов

```bash
# 1. Создать фичу
.speckit.specify "Implement user testimonials with video support" --short-name "testimonials"

# 2. Заполнить спецификацию
# Редактировать specs/001-testimonials/spec.md

# 3. Создать план
.speckit.plan
# Редактировать specs/001-testimonials/plan.md

# 4. Сгенерировать задачи
.speckit.tasks
# Редактировать specs/001-testimonials/tasks.md

# 5. Запустить универсальную интеграцию
bash .specify/scripts/bash/universal-integration.sh
```

### Анализ результатов

После выполнения универсальной интеграции:

```bash
# Проверить отчет
cat .specify/temp/integration-report.md

# Проверить ответ KILO Code
cat .specify/temp/kilo-response.md

# Проверить логи Task Master
cat .specify/temp/taskmaster.log
```

## Решение проблем

### Task Master не работает

```bash
# Проверить конфигурацию
task-master models

# Попробовать другой провайдер
task-master models --set-main claude-code

# Проверить API ключи
cat .env | grep -E "(ANTHROPIC|OPENAI|OPENROUTER)"
```

### KILO Code не отвечает

```bash
# Проверить промпт
cat .specify/temp/kilo-prompt.md

# Отправить вручную
# 1. Скопировать промпт
# 2. Вставить в KILO Code
# 3. Сохранить ответ в .specify/temp/kilo-response.md
```

### MCP сервер не запускается

```bash
# Проверить зависимости
npm list @modelcontextprotocol/sdk

# Запустить в режиме отладки
node .specify/scripts/mcp-server.js
```

## Лучшие практики

### 1. Структурирование фичей
- Используйте конкретные описания
- Следуйте приоритетам P1, P2, P3
- Создавайте независимые user stories

### 2. Интеграция
- Запускайте универсальную интеграцию после изменений
- Проверяйте отчеты перед началом работы
- Используйте MCP для прямого доступа

### 3. Анализ
- Сравнивайте рекомендации от разных AI
- Фокусируйтесь на практических шагах
- Обновляйте документы на основе анализа

### 4. Коммуникация
- Делитесь отчетами с командой
- Создавайте общие стандарты
- Документируйте проблемы и решения

## Будущее развитие

### Планируемые улучшения
1. **Автоматическая синхронизация** - полная автоматизация
2. **Больше AI провайдеров** - поддержка дополнительных моделей
3. **Визуальный интерфейс** - веб-интерфейс для управления
4. **Аналитика** - метрики использования и эффективности

### Интеграция с CI/CD
```yaml
# .github/workflows/integration.yml
name: Universal Integration
on:
  push:
    paths: ['specs/**']
jobs:
  integrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Universal Integration
        run: bash .specify/scripts/bash/universal-integration.sh
      - name: Upload Reports
        uses: actions/upload-artifact@v2
        with:
          name: integration-reports
          path: .specify/temp/
```

## Заключение

Универсальная интеграция обеспечивает 100% совместимость между Spec Kit, Task Master, KILO Code и другими инструментами. Это позволяет:

- Бесшовно передавать данные между системами
- Использовать сильные стороны каждого инструмента
- Получать комплексные рекомендации
- Автоматизировать рутинные процессы

Следуйте этому гиду для максимальной эффективности в разработке.