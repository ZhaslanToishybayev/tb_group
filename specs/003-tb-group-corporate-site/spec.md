# Spec: TB Group Corporate Site

## Problem Overview
TB Group needs корпоративный сайт, который презентует услуги по внедрению облачных решений (Мой Склад, Битрикс24, Телефония), демонстрирует результаты и собирает заявки. Текущего решения нет; необходимо создать фронтенд, бэкенд/API, административную панель и интеграции (Bitrix24, email, аналитика).

## Goals & Success Criteria
- Публичный сайт с разделами: Главная, Услуги (3 страницы), Кейсы, Отзывы, О компании, Контакты.
- Форма заявки → создание лида в Bitrix24 и уведомление по email.
- Админ-панель для управления контентом (кейсы, отзывы, услуги, баннеры, контакты).
- SEO-базис: meta/OG-теги, sitemap, robots, быстрая загрузка (lazy-loading, кеш).
- Видео-отзывы с поддержкой YouTube и локальных файлов.
- Адаптивность, современный дизайн (Tailwind/Styled Components + Framer Motion).
- Бэкенд: Node.js + Express (или Nest по итоговой оценке) и БД (MongoDB или PostgreSQL).
- Без CMS; всё редактирование через кастомную админку.

## Non-Goals / Out of Scope
- Автоматическая выставка счетов и биллинговые процессы.
- Интеграции за пределами перечисленных сервисов (Bitrix24, e-mail, Analytics).
- Контент-производство (копирайтинг, фото/видео) — поставляется заказчиком.

## Users & Personas
- **Потенциальные клиенты** — ищут решение по внедрению облачных сервисов.
- **Администратор контента** — обновляет услуги, кейсы, отзывы, баннеры.
- **Менеджер по продажам** — получает заявки в Bitrix24, мониторит лиды.

## Key Features
1. **Публичный сайт**: hero/CTA, преимущества, услуги, фильтруемые кейсы, отзывы (текст/видео), блок «О компании», контакты с картой и формой.
2. **Админ-панель**: авторизация, CRUD для кейсов/отзывов/услуг, управление баннерами и контактами, модерация пользовательских отзывов.
3. **API**: REST (или GraphQL) с эндпоинтами `/api/cases`, `/api/reviews`, `/api/services`, `/api/contact`, `/api/auth`.
4. **Интеграции**: отправка форм в Bitrix24, email-уведомления, аналитика (GA/ЯМ), видео-отзывы.
5. **Инфраструктура**: деплой на VPS/облако, резервное копирование БД, HTTPS, защита от XSS/SQL-инъекций, капча.

## Constraints & Assumptions
- Стек: React (ES6+), TailwindCSS или Styled Components, Node.js + Express, MongoDB или PostgreSQL (решить на этапе архитектуры).
- JWT авторизация, хранение секретов в `.env`, SSL обязателен.
- Серверная интеграция с Bitrix24 требует актуальных API-ключей.
- Дизайн создаётся с нуля, UI-kit формируется в ходе проекта.

## Implementation Status (as of 2025-10-31)

### ✅ Completed Features
- **T001-T003: Discovery & Architecture**: Monorepo setup with pnpm, TypeScript configuration, architecture (Next.js + Express + PostgreSQL + Prisma)
- **T010-T012: Boilerplate & Core Setup**: Express API server, PostgreSQL database, Prisma ORM, JWT authentication, Zod validation
- **T020-T023: Domain Models & API**: All models implemented (Services, Cases, Reviews, ContactRequests, Banners, Settings), Full CRUD API with OpenAPI documentation
- **T030-T032: Public Website Core**: Animated hero section, services carousel, advantages, client logos, CasesExplorer with filters and search
- **T033: Reviews Section**: Full reviews page with filtering/pagination, video review cards with YouTube/Vimeo embedding
- **T034: About & Contact Pages**: About page with Framer Motion animations, Contact page with Google Maps, form with reCAPTCHA v3
- **T035: SEO Implementation**: Meta tags, OG tags, sitemap.xml, robots.txt, lazy loading
- **T040-T043: Admin Panel**: Full admin interface with authentication, CRUD for all entities, media management, Framer Motion animations
- **T050-T052: Integrations**: Bitrix24 lead creation, email notifications (NodeMailer), Google Analytics, user behavior tracking
- **T053: Caching & Performance**: Advanced Redis caching with intelligent invalidation, API response caching middleware
- **T060: Testing Infrastructure**: Vitest for unit tests, Playwright for E2E testing, test utilities, API tests, smoke tests
- **T061: CI/CD Pipeline**: Complete GitHub Actions workflow, multi-stage Docker builds, automated testing, security scanning
- **AI Analytics System**: OpenAI GPT-4 integration, smart insights generation, A/B testing, admin dashboard, Redis caching

### 🔄 In Progress
- **T062: Documentation**: OpenAPI docs available, README.md complete, pending admin guide and DevOps runbook

## Technical Implementation Details

### Frontend Stack
- **Next.js 14** с App Router и TypeScript
- **Tailwind CSS** для стилизации
- **Framer Motion** для анимаций
- **React Query/TanStack Query** для управления состоянием

### Backend Stack
- **Node.js + Express** REST API
- **PostgreSQL** с Prisma ORM
- **JWT** аутентификация с refresh токенами
- **Zod** для валидации данных

### Key Components Implemented
- `ContactForm` - форма с валидацией, reCAPTCHA v3, accordion для доп. полей
- `ContactDetails` - отображение контактной информации
- `ContactMap` - Google Maps интеграция
- `SocialLinks` - социальные сети с анимациями
- `CasesExplorer` - интерактивное портфолио кейсов
- `HeroPromo`, `ServicesCarousel` - маркетинговые компоненты

### Security Features
- **reCAPTCHA v3** с fallback механизмом
- **Honeypot поля** для защиты от спама
- **Rate limiting** на API
- **Helmet** security headers
- **CORS** конфигурация
- **Валидация** через Zod схемы

### Performance Optimizations
- **Async Server Components** для SSR
- **Lazy loading** для изображений и карт
- **Кэширование** API запросов (revalidate: 120)
- **Оптимизированные bundle** размеры

## Risks
- Сроки внедрения Bitrix24 API (зависимости от их доступности).
- Управление видео (встроенный YouTube предпочтителен для уменьшения хостинг-издержек).
- Требования к бэкапу и безопасности — нужно заранее заложить в архитектуру.
- **Spec Kit синхронизация**: Codex CLI требует настройки для автоматической синхронизации

