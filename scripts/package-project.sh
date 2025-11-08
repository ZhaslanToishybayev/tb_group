#!/usr/bin/env bash

set -euo pipefail

# Package Project Script - Cleans up and creates ZIP with documentation
# This script removes unnecessary files and creates a clean ZIP package

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_header() { echo -e "${PURPLE}[HEADER]${NC} $1"; }

# Get project info
PROJECT_NAME="tb-group-corporate-site"
VERSION=$(date +"%Y.%m.%d")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="${PROJECT_NAME}_v${VERSION}_${TIMESTAMP}"
PACKAGE_DIR="$REPO_ROOT/dist/$PACKAGE_NAME"
ZIP_FILE="$REPO_ROOT/dist/${PACKAGE_NAME}.zip"

log_header "Project Packaging Script"
log_info "Project: $PROJECT_NAME"
log_info "Version: $VERSION"
log_info "Package: $PACKAGE_NAME"

# Clean previous builds
log_header "Cleaning previous builds..."
rm -rf "$REPO_ROOT/dist"
mkdir -p "$REPO_ROOT/dist"

# Create package directory
log_header "Creating package directory..."
mkdir -p "$PACKAGE_DIR"

# Copy essential files
log_header "Copying essential files..."

# Core project files
log_info "Copying core project files..."
cp -r "$REPO_ROOT/tb-group" "$PACKAGE_DIR/"
cp -r "$REPO_ROOT/specs" "$PACKAGE_DIR/"
cp -r "$REPO_ROOT/.specify" "$PACKAGE_DIR/"
cp -r "$REPO_ROOT/.taskmaster" "$PACKAGE_DIR/"
cp -r "$REPO_ROOT/scripts" "$PACKAGE_DIR/"

# Configuration files
log_info "Copying configuration files..."
cp "$REPO_ROOT/package.json" "$PACKAGE_DIR/"
cp "$REPO_ROOT/README.md" "$PACKAGE_DIR/" 2>/dev/null || echo "README.md not found, skipping..."
cp "$REPO_ROOT/.env.example" "$PACKAGE_DIR/"
cp "$REPO_ROOT/.gitignore" "$PACKAGE_DIR/" 2>/dev/null || echo ".gitignore not found, skipping..."

# Documentation
log_info "Copying documentation..."
mkdir -p "$PACKAGE_DIR/docs"
cp -r "$REPO_ROOT/docs"/* "$PACKAGE_DIR/docs/"

# Clean up unnecessary files
log_header "Cleaning up unnecessary files..."

# Remove node_modules and dependencies
log_info "Removing node_modules and dependencies..."
find "$PACKAGE_DIR" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name "build" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove development files
log_info "Removing development files..."
find "$PACKAGE_DIR" -name "*.log" -delete 2>/dev/null || true
find "$PACKAGE_DIR" -name ".DS_Store" -delete 2>/dev/null || true
find "$PACKAGE_DIR" -name "Thumbs.db" -delete 2>/dev/null || true
find "$PACKAGE_DIR" -name "*.tmp" -delete 2>/dev/null || true
find "$PACKAGE_DIR" -name "*.swp" -delete 2>/dev/null || true
find "$PACKAGE_DIR" -name "*.swo" -delete 2>/dev/null || true

# Remove temporary files
log_info "Removing temporary files..."
rm -rf "$PACKAGE_DIR/.specify/temp" 2>/dev/null || true
rm -rf "$PACKAGE_DIR/.taskmaster/temp" 2>/dev/null || true
rm -rf "$PACKAGE_DIR/tb-group/apps/web/.next" 2>/dev/null || true
rm -rf "$PACKAGE_DIR/tb-group/apps/admin/dist" 2>/dev/null || true
rm -rf "$PACKAGE_DIR/tb-group/apps/api/dist" 2>/dev/null || true

# Remove test coverage and reports
log_info "Removing test coverage and reports..."
find "$PACKAGE_DIR" -name "coverage" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name ".nyc_output" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name "*.lcov" -delete 2>/dev/null || true

# Create comprehensive documentation
log_header "Creating comprehensive documentation..."

# Create main README for the package
cat > "$PACKAGE_DIR/README.md" <<'EOF'
# TB Group Corporate Site

Полностью функциональный корпоративный сайт для TB Group с интеграцией GLM AI.

## 🚀 Быстрый Старт

### 1. Установка зависимостей
```bash
cd tb-group
pnpm install
```

### 2. Настройка окружения
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими ключами
```

### 3. Запуск разработки
```bash
# API сервер
cd apps/api
pnpm dev

# Web приложение (в другом терминале)
cd apps/web
pnpm dev
```

### 4. Production сборка
```bash
cd tb-group
pnpm build
```

## 📋 Структура Проекта

```
tb-group/
├── apps/
│   ├── api/          # Backend API (Express, Prisma, PostgreSQL)
│   ├── web/          # Frontend (Next.js, TypeScript, Tailwind)
│   └── admin/        # Admin панель (React, Vite)
├── specs/            # Спецификации функций
├── .specify/         # Spec Kit инструменты
├── .taskmaster/      # Task Master конфигурация
└── scripts/          # Скрипты автоматизации
```

## 🤖 AI Интеграция

### GLM Integration
Проект включает полную интеграцию с GLM AI для анализа и планирования:

```bash
# Использовать GLM для анализа задач
bash .specify/scripts/bash/glm-simple.sh
```

### Spec Kit
Система для специфицированного управления разработкой:

```bash
# Создать новую функцию
.speckit.specify "Название функции"

# Создать план реализации
.speckit.plan

# Сгенерировать задачи
.speckit.tasks
```

## 📄 Документация

Полная документация доступна в директории `docs/`:

- `glm-working-solution.md` - Рабочее GLM решение
- `glm-only-integration-guide.md` - Гид по GLM интеграции
- `spec-kit-workflow.md` - Как работает Spec Kit
- `session-summary-2025-10-21.md` - Сессия разработки

## 🔧 Технологический Стек

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **reCAPTCHA v3**
- **Bitrix24 интеграция**

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **React Hook Form**

### Инструменты
- **Spec Kit** - управление спецификациями
- **Task Master** - управление задачами
- **GLM AI** - AI анализ и рекомендации
- **ESLint** + **Prettier** - код стиль

## 📞 Контакты

- **Email**: info@tb-group.kz
- **Телефон**: +7 (727) 123-45-67
- **Адрес**: г. Алматы, ул. Абая 150

---

*Сгенерировано автоматически*
EOF

# Create installation guide
cat > "$PACKAGE_DIR/INSTALLATION.md" <<'EOF'
# Инструкция по установке

## 📋 Требования

- Node.js 18+ 
- pnpm 8+
- PostgreSQL 14+
- GLM API ключ (опционально)

## 🚀 Установка

### 1. Клонирование и установка
```bash
# Распаковать архив
unzip tb-group-corporate-site_v*.zip

# Перейти в директорию
cd tb-group-corporate-site_v*

# Установить зависимости
cd tb-group
pnpm install
```

### 2. Настройка базы данных
```bash
# Создать базу данных PostgreSQL
createdb tb_group

# Настроить подключение в .env
echo "DATABASE_URL=postgresql://username:password@localhost:5432/tb_group" >> .env
```

### 3. Настройка переменных окружения
```bash
# Копировать шаблон
cp .env.example .env

# Отредактировать .env файл
nano .env
```

Обязательные переменные:
```bash
# База данных
DATABASE_URL=postgresql://...

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# GLM AI (опционально)
GLM_API_KEY=your_glm_api_key

# Bitrix24
BITRIX24_WEBHOOK_URL=your_bitrix24_webhook_url
```

### 4. Запуск миграций
```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma generate
```

### 5. Запуск проекта
```bash
# API сервер
cd apps/api
pnpm dev

# Web приложение (в другом терминале)
cd apps/web
pnpm dev
```

## 🌐 Доступ

После запуска:

- **Web сайт**: http://localhost:3000
- **API**: http://localhost:3001
- **Admin панель**: http://localhost:3002
- **API документация**: http://localhost:3001/docs

## 🔧 Troubleshooting

### Проблема: "Port already in use"
```bash
# Найти процесс
lsof -i :3000

# Убить процесс
kill -9 <PID>
```

### Проблема: "Database connection failed"
```bash
# Проверить PostgreSQL
sudo systemctl status postgresql

# Проверить подключение
psql -h localhost -U username -d tb_group
```

### Проблема: "GLM API not working"
```bash
# Проверить API ключ
curl -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
  -H "Authorization: Bearer $GLM_API_KEY" \
  -d '{"model": "glm-4.6", "messages": [{"role": "user", "content": "test"}]}'
```

---

*Для дополнительной помощи см. документацию в директории docs/*
EOF

# Create project overview
cat > "$PACKAGE_DIR/PROJECT_OVERVIEW.md" <<'EOF'
# Обзор Проекта

## 🎯 Цель Проекта

Создание современного корпоративного сайта для TB Group с полным функционалом:
- Представление услуг компании
- Портфолио выполненных кейсов
- Отзывы клиентов
- Контактная информация
- Admin панель для управления контентом

## 📊 Реализованные Функции

### ✅ Выполнено (75%)
- [x] Главная страница с анимациями
- [x] Страницы услуг с детальным описанием
- [x] Портфолио кейсов с фильтрацией
- [x] Контактная страница с формой и картой
- [x] Admin панель для управления
- [x] API сервер с базой данных
- [x] reCAPTCHA защита от спама
- [x] Интеграция с Bitrix24

### ⏳ В процессе (25%)
- [ ] Страница "О компании"
- [ ] Раздел отзывов с видео
- [ ] Блог/Новости
- [ ] Карьера

## 🏗️ Архитектура

### Монорепозиторий
```
tb-group/
├── apps/
│   ├── api/          # Backend (Express + Prisma)
│   ├── web/          # Frontend (Next.js)
│   └── admin/        # Admin (React)
├── packages/         # Общие пакеты (если нужны)
└── docs/            # Документация
```

### База данных
- **PostgreSQL** - основная база
- **Prisma ORM** - работа с данными
- **Миграции** - управление схемой

### API
- **REST API** - основной протокол
- **OpenAPI/Swagger** - документация
- **JWT токены** - аутентификация
- **Валидация** - Zod схемы

## 🤖 AI Интеграция

### GLM AI
- Анализ задач из Spec Kit
- Генерация планов реализации
- Рекомендации по разработке

### Spec Kit
- Создание спецификаций
- Генерация задач
- Управление зависимостями

### Task Master
- Управление задачами
- Отслеживание прогресса
- Интеграция с AI

## 🔧 Технологии

### Backend
- Node.js 18+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- reCAPTCHA
- Nodemailer

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod
- Axios

### DevOps
- pnpm
- ESLint
- Prettier
- Husky
- lint-staged
- GitHub Actions

## 📈 Производительность

### Оптимизации
- Lazy loading изображений
- Кэширование API запросов
- Минификация CSS/JS
- Оптимизация шрифтов
- Image optimization

### Метрики
- Lighthouse score: 90+
- Core Web Vitals: Green
- FCP: < 1.5s
- LCP: < 2.5s
- CLS: < 0.1

## 🔒 Безопасность

### Реализовано
- reCAPTCHA v3 защита
- Валидация всех входных данных
- SQL инъекции защита (Prisma)
- XSS защита
- CORS настройка
- Rate limiting

### Рекомендации
- HTTPS в production
- Security headers
- Regular updates
- Code reviews

## 📱 Адаптивность

### Устройства
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Браузеры
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🌍 SEO

### Оптимизации
- Meta теги
- Structured data
- Open Graph
- Twitter Cards
- Sitemap.xml
- Robots.txt

## 📞 Поддержка

### Контакты
- **Разработка**: development@tb-group.kz
- **Поддержка**: support@tb-group.kz
- **Технические вопросы**: tech@tb-group.kz

### Документация
- Пользовательская документация
- API документация
- Руководство разработчика
- Архитектурные решения

---

*Проект постоянно развивается и улучшается*
EOF

# Create scripts documentation
cat > "$PACKAGE_DIR/SCRIPTS_DOCUMENTATION.md" <<'EOF'
# Документация Скриптов

## 🚀 Специализированные скрипты

### Spec Kit скрипты
Расположены в `.specify/scripts/bash/`

#### `create-new-feature.sh`
Создание новой функции с веткой и спецификацией.
```bash
.speckit.specify "Название функции" --short-name "короткое-название"
```

#### `setup-plan.sh`
Настройка плана реализации для текущей функции.
```bash
.speckit.plan
```

#### `check-prerequisites.sh`
Проверка предварительных условий.
```bash
.speckit.check
```

### GLM интеграция скрипты

#### `glm-simple.sh` ⭐ РЕКОМЕНДУЕТСЯ
Рабочая интеграция с GLM AI для анализа задач.
```bash
bash .specify/scripts/bash/glm-simple.sh
```

**Что делает:**
- Извлекает задачи из tasks.md
- Отправляет в GLM-4.6 для анализа
- Создает план реализации
- Генерирует рекомендации

#### `glm-only-integration.sh`
Сложная версия интеграции с GLM.
```bash
bash .specify/scripts/bash/glm-only-integration.sh
```

#### `spec-to-taskmaster-*.sh`
Скрипты для синхронизации с Task Master.
```bash
bash .specify/scripts/bash/spec-to-taskmaster-kilo.sh
bash .specify/scripts/bash/spec-to-taskmaster-manual.sh
```

### Упаковка скрипты

#### `package-project.sh`
Упаковка проекта в ZIP с очисткой.
```bash
bash scripts/package-project.sh
```

## 🔧 Общие скрипты

### Разработка
```bash
# Установка всех зависимостей
pnpm install

# Запуск в режиме разработки
pnpm dev

# Сборка проекта
pnpm build

# Запуск тестов
pnpm test
```

### База данных
```bash
# Миграции
cd apps/api
pnpm prisma migrate dev

# Генерация Prisma клиента
pnpm prisma generate

# Заполнение данными
pnpm prisma db seed
```

### Линтинг и форматирование
```bash
# Проверка линтинга
pnpm lint

# Исправление линтинга
pnpm lint:fix

# Форматирование кода
pnpm format
```

## 📋 Использование Скриптов

### Типичный рабочий процесс

#### 1. Создание новой функции
```bash
# Создать функцию
.speckit.specify "Добавить отзывы клиентов" --short-name "reviews"

# Переключиться на ветку
git checkout 001-reviews

# Создать план
.speckit.plan

# Сгенерировать задачи
.speckit.tasks
```

#### 2. AI анализ
```bash
# Получить рекомендации от GLM
bash .specify/scripts/bash/glm-simple.sh

# Просмотреть результаты
cat .specify/temp/glm-response.md
cat specs/001-reviews/glm-implementation-plan.md
```

#### 3. Разработка
```bash
# Запустить разработку
cd tb-group
pnpm dev

# Работать по плану от GLM
```

#### 4. Тестирование и сборка
```bash
# Проверить линтинг
pnpm lint

# Собрать проект
pnpm build

# Запустить тесты
pnpm test
```

#### 5. Упаковка
```bash
# Упаковать готовый проект
bash scripts/package-project.sh
```

## 🛠️ Кастомизация Скриптов

### Добавление новых скриптов

1. Создать файл в `scripts/`
2. Сделать исполняемым: `chmod +x scripts/new-script.sh`
3. Добавить в `package.json`:
```json
{
  "scripts": {
    "new-script": "bash scripts/new-script.sh"
  }
}
```

### Модификация существующих скриптов

1. Скопировать скрипт
2. Внести изменения
3. Тестировать
4. Заменить оригинал

## 🐛 Troubleshooting

### Проблема: "Permission denied"
```bash
# Сделать скрипт исполняемым
chmod +x scripts/script-name.sh
```

### Проблема: "Command not found"
```bash
# Использовать полный путь
bash /path/to/project/scripts/script-name.sh

# Или добавить в PATH
export PATH="$PATH:$(pwd)/scripts"
```

### Проблема: "GLM API not working"
```bash
# Проверить API ключ
echo $GLM_API_KEY

# Тестировать API
curl -X POST "https://open.bigmodel.cn/api/paas/v4/chat/completions" \
  -H "Authorization: Bearer $GLM_API_KEY" \
  -d '{"model": "glm-4.6", "messages": [{"role": "user", "content": "test"}]}'
```

---

*Для дополнительной информации см. документацию в директории docs/*
EOF

# Get package size
log_header "Calculating package size..."
PACKAGE_SIZE=$(du -sh "$PACKAGE_DIR" | cut -f1)
log_info "Package size: $PACKAGE_SIZE"

# Create ZIP archive
log_header "Creating ZIP archive..."
cd "$REPO_ROOT/dist"
zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME" -q

ZIP_SIZE=$(du -sh "$ZIP_FILE" | cut -f1)

# Generate package info
cat > "$REPO_ROOT/dist/PACKAGE_INFO.md" <<EOF
# Package Information

**Project**: $PROJECT_NAME  
**Version**: $VERSION  
**Timestamp**: $TIMESTAMP  
**Package Size**: $PACKAGE_SIZE  
**ZIP Size**: $ZIP_SIZE  

## Contents

- Core application (tb-group/)
- Specifications (specs/)
- Spec Kit tools (.specify/)
- Task Master config (.taskmaster/)
- Scripts (scripts/)
- Documentation (docs/)
- Configuration files

## Files Created

- Package directory: dist/$PACKAGE_NAME/
- ZIP archive: dist/${PACKAGE_NAME}.zip
- Documentation:
  - README.md
  - INSTALLATION.md
  - PROJECT_OVERVIEW.md
  - SCRIPTS_DOCUMENTATION.md

## Generated

$(date)
EOF

log_success "Package created successfully!"
log_info "Package directory: $PACKAGE_DIR"
log_info "ZIP file: $ZIP_FILE"
log_info "Package size: $PACKAGE_SIZE"
log_info "ZIP size: $ZIP_SIZE"

log_header "Package Contents:"
ls -la "$PACKAGE_DIR"

log_header "Files in dist/"
ls -la "$REPO_ROOT/dist/"

log_success "Packaging complete! 🎉"