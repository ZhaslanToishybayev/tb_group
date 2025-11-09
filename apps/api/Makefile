# Makefile для TB Group API

.PHONY: help install migrate-neon dev build test clean

# Настройки
DB_NAME ?= tb_group
NEON_URL ?= "postgresql://postgres:password@ep-xxx.neon.tech/tb_group?sslmode=require"

help: ## Показать справку
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Установить зависимости
	pnpm install

migrate-neon: ## Мигрировать на Neon (требует NEON_URL)
	@if [ -z "$(NEON_URL)" ] || [ "$(NEON_URL)" = "postgresql://postgres:password@ep-xxx.neon.tech/tb_group?sslmode=require" ]; then \
		echo "❌ Error: Please set NEON_URL"; \
		echo "Usage: make migrate-neon NEON_URL='postgresql://...'; \
		exit 1; \
	fi
	@echo "🚀 Starting migration to Neon..."
	export DATABASE_URL=$(NEON_URL) && \
	npx prisma generate && \
	npx prisma migrate deploy && \
	echo "✅ Migration completed!"

db-push: ## Обновить схему БД (для разработки)
	npx prisma db push

db-reset: ## Сбросить БД (ОСТОРОЖНО! Удалит все данные)
	npx prisma migrate reset --force

db-seed: ## Заполнить БД тестовыми данными
	npx prisma db seed

db-studio: ## Открыть Prisma Studio
	npx prisma studio

dev: ## Запустить в режиме разработки
	NODE_ENV=development npm run dev

build: ## Собрать проект
	npm run build

test: ## Запустить тесты
	npm run test

test-unit: ## Запустить unit тесты
	npm run test:unit

test-integration: ## Запустить integration тесты
	npm run test:integration

test-e2e: ## Запустить e2e тесты
	npm run test:e2e

test-all: ## Запустить все тесты
	npm run test:all

lint: ## Проверить код линтером
	npm run lint

lint-fix: ## Исправить ошибки линтера
	npm run lint:fix

clean: ## Очистить сборку
	npm run clean

openapi: ## Сгенерировать OpenAPI документацию
	npx tsx src/openapi/generate.ts

bootstrap-admin: ## Создать первого админа
	npx tsx src/scripts/bootstrap-admin.ts

# Составные команды
setup-dev: install db-push db-seed ## Полная настройка для разработки

test-ci: lint test-all ## Проверка для CI

deploy: migrate-neon build ## Подготовить к деплою

help-migrate: ## Показать инструкции по миграции на Neon
	@echo "Инструкции по миграции на Neon:"
	@echo "1. Создайте проект на https://neon.tech"
	@echo "2. Получите connection string"
	@echo "3. Выполните: make migrate-neon NEON_URL='ваш_connection_string'"
	@echo ""
	@echo "Полные инструкции: https://github.com/your-repo/NEON_MIGRATION_GUIDE.md"
