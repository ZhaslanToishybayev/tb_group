# Architecture Overview — TB Group Corporate Site

## System Components
- **Public Web (Next.js)** — SEO-ориентированный фронтенд, страницы: Главная, Услуги (3), Кейсы, Отзывы, О компании, Контакты. Получает контент через REST API, ISR/lazy-loading.
- **Admin Panel (React + Vite)** — SPA для администраторов: CRUD кейсов, отзывов, услуг, баннеров, настроек контактов, модерация отзывов. Аутентификация через JWT.
- **API (Express + Prisma)** — сервис, обслуживающий контент, заявки, интеграции (Bitrix24, email), отвечающий за аутентификацию (JWT + refresh), кеши, отдачу медиа ссылок и контактный pipeline с логами.
- **Database (PostgreSQL)** — хранит структуры данных и метаданные, Prisma управляет миграциями.
- **Integrations** — внешние сервисы: Bitrix24 REST, SMTP (NodeMailer), Google Analytics / Яндекс Метрика, медиа-хранилище (S3/YouTube).
- **Data Operations** — резервное копирование (`pg_dump` по cron + ручные snapshots перед релизами), менеджмент секретов, мониторинг БД.

## Data Flow
1. Пользователь → Public Web → `/api/services/cases/reviews` → Postgres (через Prisma) → ответ.
2. Форма контактов → `/api/contact` → Bitrix24 lead + email уведомление.
3. Админ → Admin Panel → `/api/*` (auth JWT) → CRUD → Postgres → invalidate ISR/кеш.

## Deployment
- Контейнеры: `public-web` (Next.js), `admin-panel` (static), `api`, `postgres`, `redis` (optional), `nginx` (reverse proxy, SSL).
- CI/CD: lint/test/build каждого пакета; deploy via GH Actions → Docker registry → VPS/Cloud run.
- Observability: Prometheus/Grafana, логирование (Pino), Sentry (опционально).

## ADRs
- [ADR 001 — Platform Architecture Overview](adr-001-platform-overview.md)
- [ADR 002 — Backend Stack & Patterns](adr-002-backend-stack.md)
- [ADR 003 — Frontend Frameworks & UI Toolkit](adr-003-frontend-ui.md)

Следующие ADR покроют интеграции (Bitrix24), управление медиа, DevOps политику и безопасность.
