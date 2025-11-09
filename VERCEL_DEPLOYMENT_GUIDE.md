# 🚀 Vercel Deployment Guide - TB Group Website

## Пошаговый гайд по деплою на Vercel

### Этап 1: Подготовка

#### 1.1 Создание репозитория на GitHub

```bash
# В GitHub создаем новый репозиторий
# tb-group-website (public или private)

# Клонируем локально
git clone https://github.com/ZhaslanToishybayev/tb-group-website.git
cd tb-group-website
```

#### 1.2 Настройка проекта

```bash
# Создаем package.json
npm init -y

# Устанавливаем зависимости
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/react @types/node
npm install @prisma/client
npm install prisma

# Дополнительные пакеты
npm install @vercel/analytics @upstash/ratelimit
npm install next-seo lucide-react
npm install framer-motion
```

#### 1.3 Структура проекта

```
tb-group-website/
├── app/                          # App Router
│   ├── api/
│   │   ├── contact/
│   │   │   └── route.ts
│   │   └── _lib/
│   │       ├── bitrix24.ts
│   │       ├── db.ts
│   │       └── validation.ts
│   ├── about/
│   ├── services/
│   ├── contact/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                   # Components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ContactForm.tsx
│   ├── Button.tsx
│   └── ...
├── lib/                          # Utilities
│   ├── prisma.ts
│   ├── redis.ts
│   ├── utils.ts
│   └── validations.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/                       # Static files
│   ├── images/
│   └── icons/
├── vercel.json                   # Vercel config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

### Этап 2: Настройка базы данных

#### 2.1 Создание Vercel Postgres

1. Переходим в [Vercel Dashboard](https://vercel.com/dashboard)
2. Создаем новый проект
3. Добавляем Vercel Postgres
4. Получаем DATABASE_URL

#### 2.2 Настройка Prisma

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model ContactRequest {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(255)
  email     String   @db.VarChar(255)
  phone     String   @db.VarChar(50)
  company   String?  @db.VarChar(255)
  service   String   @db.VarChar(100)
  message   String   @db.Text
  status    String   @default("new") @db.VarChar(50)
  createdAt DateTime @default(now()) @db.Timestamp

  @@index([email])
  @@index([status])
  @@index([createdAt])
}

model Service {
  id          String   @id @default(cuid())
  name        String   @db.VarChar(255)
  slug        String   @unique @db.VarChar(255)
  description String?  @db.Text
  icon        String?  @db.VarChar(100)
  active      Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now()) @db.Timestamp
}
```

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Этап 3: Настройка Redis (Upstash)

#### 3.1 Создание аккаунта Upstash

1. Переходим на [upstash.com](https://upstash.com)
2. Создаем бесплатный аккаунт
3. Создаем Redis database
4. Получаем UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN

#### 3.2 Настройка Redis клиента

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Helper functions
export async function getCached<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key)
  return cached ? JSON.parse(cached as string) : null
}

export async function setCached<T>(key: string, data: T, ttl: number = 3600) {
  await redis.setex(key, ttl, JSON.stringify(data))
}

export async function deleteCached(key: string) {
  await redis.del(key)
}
```

### Этап 4: Настройка Vercel

#### 4.1 vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["fra1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

#### 4.2 next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-domain.vercel.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

module.exports = nextConfig
```

### Этап 5: Environment Variables

#### 5.1 Создание .env.example

```env
# Database
DATABASE_URL="postgresql://..."

# Redis
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Vercel
VERCEL_ENV=production
VERCEL_URL="tbgroup.kz"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@tbgroup.kz"
SMTP_PASS=""

# Bitrix24
BITRIX24_WEBHOOK_URL="https://..."

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID="G-XXXXXXXXXX"

# ReCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=""
RECAPTCHA_SECRET_KEY=""
```

#### 5.2 Добавление в Vercel

1. Переходим в Vercel Dashboard → Project → Settings
2. Вкладка "Environment Variables"
3. Добавляем каждую переменную:
   - `DATABASE_URL` → (Vercel Postgres)
   - `UPSTASH_REDIS_REST_URL` → (Upstash)
   - `UPSTASH_REDIS_REST_TOKEN` → (Upstash)
   - И другие

### Этап 6: API Routes

#### 6.1 Contact API

```typescript
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { Ratelimit } from '@upstash/ratelimit'

const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
})

const ContactSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email адрес'),
  phone: z.string().min(10, 'Некорректный номер телефона'),
  company: z.string().optional(),
  service: z.string(),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.ip ?? '127.0.0.1'
    const { success } = await rateLimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429 }
      )
    }

    // Parse request
    const body = await req.json()
    const validatedData = ContactSchema.parse(body)

    // Save to database
    const contact = await prisma.contactRequest.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        service: validatedData.service,
        message: validatedData.message,
      },
    })

    // Send to Bitrix24 (example)
    try {
      await fetch(process.env.BITRIX24_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            TITLE: `Новая заявка от ${contact.name}`,
            NAME: contact.name,
            EMAIL: contact.email,
            PHONE: contact.phone,
            COMPANY: contact.company,
            SERVICE: contact.service,
            MESSAGE: contact.message,
          },
        }),
      })
    } catch (error) {
      console.error('Bitrix24 error:', error)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.',
        data: { id: contact.id },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка. Попробуйте позже.' },
      { status: 500 }
    )
  }
}
```

### Этап 7: Components

#### 7.1 Layout

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'TB Group - IT услуги',
  description: 'Корпоративный сайт TB Group',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
```

#### 7.2 Contact Form

```typescript
// components/ContactForm.tsx
'use client'

import { useState } from 'react'

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  service: string
  message: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        message: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Спасибо! Ваша заявка отправлена.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Имя *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Телефон *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1">
            Компания
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="service" className="block text-sm font-medium mb-1">
          Услуга *
        </label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Выберите услугу</option>
          <option value="bitrix24">Внедрение Битрикс24</option>
          <option value="crm">Разработка CRM</option>
          <option value="web">Разработка сайта</option>
          <option value="mobile">Мобильное приложение</option>
          <option value="integration">Интеграция систем</option>
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Сообщение *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Отправка...' : 'Отправить заявку'}
      </button>
    </form>
  )
}
```

### Этап 8: Деплой

#### 8.1 Через Vercel Dashboard

1. Заходим на [vercel.com](https://vercel.com)
2. Нажимаем "New Project"
3. Импортируем GitHub репозиторий
4. Настраиваем environment variables
5. Нажимаем "Deploy"

#### 8.2 Через GitHub Integration

```bash
# Подключаем репозиторий
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ZhaslanToishybayev/tb-group-website.git
git push -u origin main

# Vercel автоматически начнет деплой
```

#### 8.3 Через Vercel CLI

```bash
# Устанавливаем Vercel CLI
npm i -g vercel

# Логин в Vercel
vercel login

# Деплой (preview)
vercel

# Production деплой
vercel --prod
```

### Этап 9: Пост-деплой

#### 9.1 Проверка работы

```bash
# Проверяем endpoints
curl https://your-app.vercel.app/api/contact
curl https://your-app.vercel.app/api/health

# Проверяем главную страницу
curl -I https://your-app.vercel.app
```

#### 9.2 Настройка домена

1. В Vercel Dashboard → Project → Settings → Domains
2. Добавляем домен (например, tbgroup.kz)
3. Следуем инструкциям по DNS
4. Vercel автоматически выдаст SSL сертификат

#### 9.3 Настройка Previews

```typescript
// В Pull Request автоматически создается preview
// URL: https://project-abc123.vercel.app
```

#### 9.4 Настройка Analytics

```typescript
// app/layout.tsx (уже добавлен)
import { Analytics } from '@vercel/analytics/react'

// Просмотр analytics в Vercel Dashboard
```

### Этап 10: Мониторинг

#### 10.1 Vercel Analytics (Pro)

```bash
# В Vercel Dashboard доступны:
# - Core Web Vitals
# - Performance metrics
# - Error tracking
# - Real-time logs
```

#### 10.2 Дополнительные инструменты

1. **Sentry** (Error tracking)
   ```bash
   npm install @sentry/nextjs
   ```

2. **LogRocket** (Session replay)
   ```bash
   npm install logrocket
   ```

3. **Google Analytics**
   ```typescript
   // app/components/GoogleAnalytics.tsx
   import Script from 'next/script'
   ```

### Этап 11: CI/CD (опционально)

#### 11.1 GitHub Actions для тестов

```yaml
# .github/workflows/test.yml
name: Test
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run type-check
```

#### 11.2 Автоматический деплой

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Этап 12: Backup

#### 12.1 База данных

```bash
# Создание бэкапа (local)
npx prisma db pull
npx prisma generate

# Экспорт данных
pg_dump $DATABASE_URL > backup.sql
```

#### 12.2 Автоматические бэкапы

```typescript
// scripts/backup.ts
import { prisma } from '@/lib/prisma'

async function createBackup() {
  const contacts = await prisma.contactRequest.findMany()
  const services = await prisma.service.findMany()

  const backup = {
    timestamp: new Date().toISOString(),
    contacts,
    services,
  }

  // Save to file or cloud storage
  console.log('Backup created:', backup)
}
```

### 🆘 Troubleshooting

#### Проблема: Ошибка сборки

```bash
# Проверяем логи
vercel logs

# Проверяем local build
npm run build

# Проверяем TypeScript
npm run type-check
```

#### Проблема: Не работает API

```bash
# Проверяем environment variables
vercel env ls

# Проверяем логи
vercel logs --follow
```

#### Проблема: Медленная загрузка

- Включаем Vercel Analytics Pro
- Настраиваем кэширование
- Оптимизируем изображения
- Используем Edge Functions

#### Проблема: Ошибки базы данных

- Проверяем DATABASE_URL
- Запускаем `npx prisma migrate deploy`
- Проверяем логи базы данных

### 📊 Мониторинг и метрики

#### Ключевые метрики

- **Core Web Vitals**: LCP, FID, CLS
- **Error Rate**: < 1%
- **Response Time**: P95 < 500ms
- **Uptime**: 99.9%

#### Мониторинг

- Vercel Analytics (Pro)
- Sentry для ошибок
- LogRocket для сессий
- UptimeRobot для проверки доступности

### 💰 Оптимизация стоимости

#### Free Tier Limits (Vercel)

- 100GB bandwidth
- Unlimited deployments
- 1 team member
- 1GB storage

#### Способы экономии

1. Используем кэширование (Redis)
2. Оптимизируем изображения
3. Включаем компрессию
4. Удаляем неиспользуемый код
5. Используем Edge Functions

### 📚 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Upstash Documentation](https://upstash.com/docs)
- [Zod Validation](https://zod.dev/)

### 🎯 Следующие шаги

1. ✅ Деплой на Vercel
2. ✅ Настройка домена
3. ✅ Мониторинг и аналитика
4. 🔄 Настройка CI/CD
5. 📊 A/B тестирование
6. 🔍 SEO оптимизация
7. 📱 PWA настройка
8. 🌍 i18n (локализация)

---

**Статус:** ✅ Готово к деплою
**Время деплоя:** 5-10 минут
**Сложность:** Низкая
**Стоимость:** $0/мес (Free tier)
