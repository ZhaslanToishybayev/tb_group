# ADR 002 — Backend Stack & Patterns

## Status
Accepted — 2025-10-18

## Context
API должен:
- Обслуживать контент (кейсы, отзывы, услуги, баннеры, настройки).
- Принимать формы (контакты, заявки) и интегрироваться с Bitrix24, email.
- Предоставлять авторизацию для админ-панели (JWT).
- Поддерживать мультимедиа (ссылки/файлы), кеширование, резервное копирование.

Необходимо выбрать server framework, ORM, структуру проекта и слои.

## Decision
- **Framework**: Express 5 + TypeScript. Дополняем архитектурным каркасом (modular controllers, service layer, repository layer). Используем `zod` для валидации запросов.
- **ORM/DB**: Prisma + PostgreSQL 15. Prisma schema управляет миграциями, типами и резолверами; PostgreSQL выбран за реляционную структуру, strong consistency, JSONB поля.
- **Auth**: JWT Access + Refresh tokens, argon2-hashed пароли, sha256-хеш для refresh токенов с хранением в Postgres, ротация и отзыв, опциональный Redis blacklist.
- **Modules**: `auth`, `services`, `cases`, `reviews`, `banners`, `settings`, `contacts`, `media`, `integrations`.
- **Contact pipeline**: `/api/contact` сохраняет заявку, проверяет reCAPTCHA (если включено), создаёт `LeadLog` для Bitrix24 и `EmailNotificationLog` для уведомлений (retry/статусы хранятся в БД).
- **Integrations**: отдельный слой `integrations/bitrix24.ts`, `integrations/email.ts`, абстракции с retry/backoff.
- **Testing**: Vitest/Jest (unit), Supertest (integration). Playwright/Cypress для e2e (API + UI) в следующих фазах.
- **Error Handling**: централизованный middleware, Pino logger, request ID, structured logs.
- **Security**: helmet, cors, rate limiting (express-rate-limit), input sanitization.
- **Caching**: HTTP caching headers + optional Redis for frequently accessed lists (кейсы, отзывы).

## Consequences
- Express требует больше ручной настройки (DI, validation) по сравнению с Nest — компенсируем template-ами, utility helpers.
- Prisma + PostgreSQL обеспечивает сильную типизацию, но повышает порог входа (не Mongo). Нужно управлять connection pooling (pg driver, pgbouncer).
- JWT auth требует безопасного хранения refresh tokens (HTTP-only cookies или secure storage).
- Для интеграций нужны mocks/stubs в тестах и retry/backoff, иначе Bitrix24 downtime приведёт к ошибкам.
