# ADR 001 — Platform Architecture Overview

## Status
Accepted — 2025-10-18

## Context
TB Group needs корпоративный сайт с публичной витриной, административной панелью и API, обслуживающим контент, заявки и интеграции (Bitrix24, email, аналитика). Требуются:
- SEO-дружелюбный фронтенд для публичного сайта.
- Отдельная админ-панель без CMS.
- Backend с REST API, интеграциями и безопасностью.
- Возможность развёртывания на VPS с Nginx + SSL.

## Decision
- **Monorepo**: один репозиторий, управляемый Turborepo (или Nx), с отдельными package для `apps/public-web`, `apps/admin-panel`, `apps/api`, `packages/ui`, `packages/shared`.
- **Public Web**: Next.js (React 18) + TypeScript; CSR + SSR/ISR для SEO, meta-теги, sitemap, динамическая подгрузка контента из API.
- **Admin Panel**: React + Vite + TypeScript SPA, деплой как отдельный bundle, аутентификация через API (JWT).
- **API**: Node.js 20 + Express + TypeScript (структура controllers/services/repositories), Prisma ORM, PostgreSQL.
- **Data Layer**: PostgreSQL 15 (Managed или self-hosted), Prisma для схем и миграций.
- **Infra**: Docker-compose для локальной разработки; прод — контейнеры behind Nginx reverse proxy (HTTPS, static assets, API). CI/CD через GitHub Actions (lint/test/build, deploy).
- **Integrations**: Bitrix24 REST API (лиды), Nodemailer (SMTP), Google Analytics/Яндекс Метрика (frontend), S3-совместимое хранилище (или локальный CDN) для медиа при необходимости.
- **Observability**: Pino (API), Prometheus/Grafana profile, Sentry (опционально) для ошибок.

## Consequences
- Monorepo упрощает reuse UI-kit и утилит, но требует конфигурации Turborepo и workspace scripts.
- Next.js обеспечивает SEO и SSR, но требует аккуратной работы с ISR и кэшированием; стоимость билда выше, чем у чистого SPA.
- Два frontend-приложения увеличивают накладные расходы на CI/CD, но разделение контекста (public vs admin) снижает риски и упрощает UX.
- Express + Prisma на PostgreSQL даёт гибкость и сильную типизацию, но требует дополнительной обёртки для стандартов Nest (guard/pipe). Нужно внедрить архитектурные соглашения (validation, dependency injection).
- Для медиа (видео) требуется стратегия хранения: YouTube iframe предпочтителен, локальные mp4 — через S3/статик (учтено в backlog).
- Nginx конфигурация должна обслуживать: `public.en` (Next.js static + SSR), `/admin` (SPA bundle), `/api` (Express). TLS и rate limiting станут частью DevOps задачи.
