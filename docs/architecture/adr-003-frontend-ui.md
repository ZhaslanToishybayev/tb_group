# ADR 003 — Frontend Frameworks & UI Toolkit

## Status
Accepted — 2025-10-18

## Context
Публичный сайт требует SEO, анимаций, адаптивности; админка — быстрый UI для CRUD. Необходимо выбрать фреймворки и стайл-систему.

## Decision
- **Public Web**: Next.js 14 (App Router) + TypeScript + TailwindCSS + Framer Motion.
  - Используем ISR для статичных разделов (кейсы, отзывы) с revalidate при изменениях.
  - Tailwind облегчает корпоративный UI kit, поддерживает дизайн-токены.
  - Framer Motion для hero/CTA анимаций, плавных переходов.
- **Admin Panel**: React 18 + Vite + TypeScript + TailwindCSS + Radix UI primitives.
  - SPA с React Query для data fetching, Zustand для локального состояния.
  - Компонентный кит общий (`packages/ui`) — кнопки, формы, карточки, модальные окна.
- **Shared**: `packages/shared` (типизация API, схемы Zod, helpers). Используем Design Tokens (JSON/TS) для цвета/шрифтов.

## Consequences
- Tailwind требует консистентности (linting, дизайн-токены). Настраиваем eslint-plugin-tailwindcss, storybook (позже).
- Next.js App Router сложнее SSR, нужно обучить команду. Выигрыш: SEO, динамическая выгрузка, Route segments.
- Две разные сборки (Next vs Vite) усложняют CI, но дают специализированные оптимизации.
- Общий UI kit в packages требует компонентов без Next-специфичных зависимостей (только React, Radix, Tailwind classes).
