# Implementation Plan: TB Group Corporate Site

## Phase 0 — Discovery & Architecture
- Уточнить бизнес-цели, каналы лидов, содержание для каждой страницы.
- Решить технические выборы: Express vs. Nest, MongoDB vs. PostgreSQL, Tailwind vs. Styled Components.
- Зафиксировать архитектурную схему: отдельные фронтенды (public/admin) + общее API.
- Определить инфраструктуру: Docker, CI/CD, staging окружение.

## Phase 1 — Boilerplate & Core Setup
1. Создать monorepo (Turbo/Nx или отдельные пакеты) для публичного фронта, админки и API.
2. Настроить TypeScript/ESLint/Prettier, Husky (по согласованию).
3. Сконфигурировать сервер (Express) и подключение к БД.
4. Реализовать базовую систему авторизации (JWT, refresh), модель пользователя-админа.

## Phase 2 — Domain Models & API Foundation
1. Спроектировать схемы данных: Services, Cases, Reviews, ContactRequests, Banners, Settings.
2. CRUD API (через REST) для кейсов, отзывов, услуг, баннеров, контактов.
3. Добавить валидацию (Zod/Joi), обработку ошибок, логирование.
4. Подготовить Swagger/OpenAPI спецификацию.

## Phase 3 — Public Website
1. React-приложение (Vite или Next) с маршрутизацией: Home, Services (3 страницы), Cases, Reviews, About, Contacts.
2. TailwindCSS/Styled Components + Framer Motion: hero, CTA, карточки кейсов/отзывов.
3. Интеграция с API (SSR или CSR). Настроить фильтр кейсов, ленивую загрузку медиа.
4. Формы: обратная связь, услуги — отправка через API c капчей.
5. SEO: meta/OG-теги, sitemap, robots, данные для аналитики.

## Phase 4 — Admin Panel
1. React SPA с авторизацией (JWT + refresh), route-guard.
2. CRUD UI для кейсов, отзывов, услуг, баннеров, контактов.
3. Модерация пользовательских отзывов (approve/reject).
4. Управление мультимедиа: загрузка изображений/видео (хранилище по соглашению).
5. Настройки (контактные данные, CTA, сертификаты).

## Phase 5 — Integrations & Automations
1. Bitrix24: отправка заявок, создание лидов, обработка ошибок.
2. Email уведомления (NodeMailer) для админов.
3. Подключение Google Analytics / Yandex Metrica (скрипты, consent).
4. Видео-отзывы: поддержать YouTube iframe + локальные mp4 (опционально S3/статик).
5. Резервное копирование БД (cron/scripts), кеширование (Redis/HTTP caching).

## Phase 6 — QA & Hardening
1. Тестирование: unit (Jest/Vitest), integration (Supertest), e2e (Playwright/Cypress).
2. Accessibility, performance (Lighthouse), responsive тесты.
3. Безопасность: XSS/CSRF protection, rate limiting, helmet, капча.
4. Регламенты DevOps: CI/CD pipeline, environment promotion, мониторинг.

## Phase 7 — Deployment & Handover
1. Настройка VPS/Nginx/SSL (или облачный сервис).
2. Документация: README, admin-guide, API docs, backup procedures.
3. Финальные демо и обучение заказчика работе с админкой.
4. Передача исходников, доступов, публикация релизных заметок.
