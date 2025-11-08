# Tasks: TB Group Corporate Site

## Phase 0 — Discovery & Architecture
- [x] T001 Уточнить требования, собрать контент-лист и пользовательские сценарии.
- [x] T002 Разработать архитектурную схему (fronts, API, БД, интеграции) и ADR.
- [x] T003 Выбрать стек (Express vs. Nest, MongoDB vs. PostgreSQL, Tailwind vs. Styled) и зафиксировать решение.

## Phase 1 — Boilerplate & Core Setup
- [x] T010 Настроить monorepo/репозитории, окружения, базовую конфигурацию TypeScript/ESLint/Prettier.
- [x] T011 Создать API-сервер (Node.js + Express/Nest), подключение к БД, базовый health-check.
- [x] T012 Реализовать auth-модуль: модель администратора, регистрация bootstrap-аккаунта, JWT/refresh.

## Phase 2 — Domain Models & API
- [x] T020 Спроектировать схемы данных для Services, Cases, Reviews, ContactRequests, Banners, Settings.
- [x] T021 Реализовать CRUD эндпоинты `/api/services`, `/api/cases`, `/api/reviews`, `/api/banners`, `/api/settings`.
- [x] T022 Добавить валидацию, обработку ошибок, логирование и OpenAPI-документацию.
- [x] T023 Реализовать эндпоинт `/api/contact` с интеграцией Bitrix24 stub + email уведомление.

## Phase 3 — Public Website
- [x] T030 Сверстать главную страницу: hero, слайдер услуг, преимущества, логотипы клиентов, CTA.
- [x] T031 Реализовать страницы услуг (Мой Склад, Битрикс24, Телефония) с формами и медиагалереей.
- [x] T032 Создать раздел кейсов: список, фильтры, карточки с данными.
- [x] T033 Создать раздел отзывов: вывод текстовых и видео-отзывов.
- [x] T034 Раздел "О компании" + "Контакты" с картой и формой (интеграция с API).
- [x] T035 Добавить SEO (meta/OG), sitemap.xml, robots.txt, ленивую загрузку медиа.

## Phase 4 — Admin Panel
- [x] T040 Настроить React SPA для админки с авторизацией и route-guard.
- [x] T041 Реализовать CRUD интерфейсы: услуги, кейсы, отзывы, баннеры, настройки контактов.
- [x] T042 Добавить модерацию отзывов, загрузку изображений/видео и управление медиа.
- [x] T043 Настроить UI-kit и анимации (Framer Motion) для админ-панели.

## Phase 5 — Integrations & Operations
- [x] T050 Интегрировать Bitrix24 API: создание лидов при заявках.
- [x] T051 Реализовать отправку email-уведомлений (NodeMailer) с fallback.
- [x] T052 Подключить Google Analytics / Яндекс Метрику.
- [x] T053 Настроить резервное копирование БД и кеширование (Redis/HTTP).

## Phase 6 — QA & Deployment
- [x] T060 Написать unit/integration/e2e тесты, провести перфоманс и A11y аудит.
- [x] T061 Настроить CI/CD pipeline, Docker + Nginx (или выбранный хостинг), SSL.
- [x] **AI Analytics System**: OpenAI-powered analytics with insights generation and A/B testing
- [ ] T062 Подготовить документацию (admin guide, API docs, DevOps runbook) и провести handover.
