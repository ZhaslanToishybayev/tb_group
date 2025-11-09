# TB Group - Vercel Architecture (Бесплатное решение)

## Overview

Оптимизированная архитектура для TB Group Website с использованием Vercel и бесплатных/недорогих инструментов.

## ✅ Cost Breakdown (Месячно)

| Сервис | Бесплатно | Pro ($20/мес) | В будущем (Hoster.kz/PS.kz) |
|--------|-----------|---------------|-------------------------------|
| **Vercel** | ✓ | $20 | Hoster.kz ($5-10) |
| **База данных** | Vercel Postgres (free tier) | $0 | PS.kz ($10-15) |
| **Redis** | Upstash (free tier) | $0 | $5-10 |
| **Домен** | .kz (~$10/год) | $10/год | $10/год |
| **Мониторинг** | Vercel Analytics | $0 | $0-5 |
| **CDN** | Vercel Edge | ✓ | Hoster CDN |
| **SSL** | Vercel SSL | ✓ | Включено |
| **DNS** | Vercel DNS | ✓ | Hoster DNS |
| **Total** | **$0** | **~$22** | **~$30-50** |

## 🏗️ Архитектура на Vercel

```
┌────────────────────────────────────────────────────────────────────┐
│                        User Browser                                │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │  Global    │  │  Caching   │  │  Routing   │  │  Optimization│  │
│  │ CDN        │  │  Static    │  │  API       │  │  Images     │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
└────────────────────────────────────┬────────────────────────────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     │                               │
                     ▼                               ▼
        ┌────────────────────┐          ┌────────────────────┐
        │  Next.js Website   │          │  API Routes        │
        │  (Static + SSR)    │          │  (Edge Functions)  │
        └────────────────────┘          └────────────────────┘
                     │                               │
                     │               ┌───────────────┴───────────────┐
                     │               │                               │
                     ▼               ▼                               ▼
        ┌────────────────────┐  ┌────────────────┐  ┌────────────────────┐
        │   Vercel Storage   │  │  Vercel KV     │  │  Vercel Postgres   │
        │   (Static Assets)  │  │  (Redis)       │  │  (PostgreSQL)      │
        │                    │  │  10K requests  │  │  1 DB, 1GB storage │
        │   1GB free         │  │  free tier     │  │  1 connection      │
        └────────────────────┘  └────────────────┘  └────────────────────┘
```

## 🔧 Компоненты

### 1. Vercel (Hosting)

**Free Tier Features:**
- 100GB bandwidth
- Unlimited personal repos
- 1 team member
- SSL certificates
- Global CDN
- Serverless functions (100GB-hours)
- Edge Functions

**Pro Tier ($20/month):**
- Team features (up to 10 members)
- 1TB bandwidth
- 1,000 Serverless function invocations
- Advanced analytics
- Preview deployments

**Адвантаги:**
- Автоматический деплой из Git
- Preview для каждого PR
- Edge functions (глобально)
- Автоматическая оптимизация
- Интеграция с GitHub

### 2. База данных

#### Вариант 1: Vercel Postgres (рекомендуется для начала)

**Free Tier:**
- 1 database
- 1GB storage
- 1 connection
- 1 billion reads/month
- 1 million writes/month

**Цена:** Бесплатно

#### Вариант 2: PlanetScale (для production)

**Free Tier:**
- 1 database
- 1 billion reads
- 10 million writes
- Branching workflow

**Цена:** Бесплатно (с ограничениями)

**Pro:** $29/мес за 1000 reads/sec, 10000 writes/sec

#### Вариант 3: PS.kz (будущее)

**Цена:** $10-15/мес
- Локальный хостинг
- Полный контроль
- Техподдержка на казахском

### 3. Кэш

#### Upstash Redis (рекомендуется)

**Free Tier:**
- 10,000 requests/day
- 256MB storage
- 20 concurrent connections

**Цена:** Бесплатно

**Pro:** $90/мес за unlimited

#### Vercel KV

**Free Tier:**
- 1GB storage
- 10,000 requests/day

**Цена:** Бесплатно

### 4. Домен

**.kz домен:**
- Цена: $10/год (~0.8/мес)

**Конфигурация:**
- DNS управляется Vercel
- Автоматический SSL
- Subdomains: api.tbgroup.kz, admin.tbgroup.kz

### 5. Мониторинг

#### Vercel Analytics (Pro)

**Features:**
- Web Vitals
- Core Web Vitals
- Real User Monitoring
- Error tracking

**Цена:** $20/мес (включено в Pro)

#### Альтернативы:

**Free:**
- Sentry (100 errors/month)
- LogRocket (14-day trial)
- Google Analytics (free)

### 6. CI/CD

#### GitHub Actions (бесплатно для public repos)

**Features:**
- 2000 minutes/month (public repos)
- Unlimited (public)
- Matrix builds
- Caching

**Workflow:**
```yaml
# .github/workflows/vercel.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📁 Структура проекта на Vercel

```
tb-group-website/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Serverless)
│   │   ├── contact/
│   │   │   └── route.ts
│   │   └── _lib/
│   ├── about/
│   ├── services/
│   ├── contact/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                   # Reusable Components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ContactForm.tsx
│   └── ...
├── lib/                          # Business Logic
│   ├── db.ts                     # Database connection
│   ├── redis.ts                  # Redis client
│   ├── validation.ts             # Validation
│   └── ...
├── prisma/                       # Database schema
│   └── schema.prisma
├── vercel.json                   # Vercel configuration
├── .env.example                  # Environment variables
└── package.json
```

## 🔌 Конфигурация

### vercel.json

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
  "regions": ["fra1"], # Frankfurt для СНГ
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

### Environment Variables (.env.local)

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/db"

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
SMTP_PASS="password"

# External services
BITRIX24_WEBHOOK_URL="https://..."
GA4_MEASUREMENT_ID="G-XXXXXXXXXX"
```

## 🚀 Деплой на Vercel

### Способ 1: GitHub Integration (рекомендуется)

```bash
# 1. Подключаем репозиторий к Vercel
# 2. В Vercel Dashboard → New Project
# 3. Выбираем GitHub репозиторий
# 4. Vercel автоматически деплоит при push в main

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo>
git push -u origin main
```

### Способ 2: Vercel CLI

```bash
# Устанавливаем Vercel CLI
npm i -g vercel

# Логин
vercel login

# Деплой
vercel

# Production деплой
vercel --prod
```

### Способ 3: GitHub Actions (с автоматизацией)

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
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📊 Мониторинг на Vercel

### Vercel Analytics (Pro)

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Альтернативные решения

1. **Sentry** (Error tracking)
   ```bash
   npm install @sentry/nextjs
   ```

2. **Google Analytics** (Traffic)
   ```typescript
   // app/layout.tsx
   import GoogleAnalytics from '@/components/GoogleAnalytics'
   ```

3. **LogRocket** (Session replay)
   ```bash
   npm install logrocket
   ```

## 🔐 Безопасность

### Security Headers (vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'" }
      ]
    }
  ]
}
```

### Rate Limiting (API Routes)

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function rateLimit(key: string) {
  const result = await ratelimit.limit(key)
  return result
}
```

## 💾 База данных

### Prisma Setup

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model ContactRequest {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String
  company   String?
  service   String
  message   String
  status    String   @default("new")
  createdAt DateTime @default(now())
}
```

### Connection (lib/db.ts)

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 📈 Масштабирование

### Edge Functions

```typescript
// app/api/contact/route.ts
export const runtime = 'edge'

export async function POST(request: Request) {
  const data = await request.json()
  // Обработка на edge location
  return Response.json({ success: true })
}
```

### Caching

```typescript
// app/services/page.tsx
export const revalidate = 3600 // Revalidate every hour

export default async function ServicesPage() {
  const services = await getServices()
  return <div>{/* Render services */}</div>
}

async function getServices() {
  // Кэш на 1 час
  const cacheKey = 'services:list'
  const cached = await redis.get(cacheKey)

  if (cached) return JSON.parse(cached as string)

  const services = await prisma.service.findMany()
  await redis.setex(cacheKey, 3600, JSON.stringify(services))

  return services
}
```

## 🔄 Миграция на Hoster.kz/PS.kz

### План миграции

#### Этап 1: Подготовка (1-2 недели)
- [ ] Настроить Docker для локального dev
- [ ] Создать CI/CD с Vercel → Hoster deployment
- [ ] Тестировать идентичную конфигурацию

#### Этап 2: Дублирование (1 неделя)
- [ ] Запустить параллельные инсталляции
- [ ] Настроить DNS для A/B тестирования
- [ ] Проверить функциональность

#### Этап 3: Миграция (1 день)
- [ ] Остановить Vercel deployments
- [ ] Обновить DNS на Hoster
- [ ] Мониторить в течение 24 часов

#### Этап 4: Оптимизация (1 неделя)
- [ ] Оптимизировать под локальный хостинг
- [ ] Настроить мониторинг
- [ ] Тестировать производительность

### Конфигурация для Hoster.kz

```yaml
# docker-compose.yml (для production)
version: '3.8'
services:
  web:
    image: tb-group-web:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
      - redis

  api:
    image: tb-group-api:latest
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=tbgroup
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### CI/CD для Hoster

```yaml
# .github/workflows/hoster-deploy.yml
name: Deploy to Hoster
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker images
        run: |
          docker build -t tb-group-web:latest ./apps/web
          docker build -t tb-group-api:latest ./apps/api
      - name: Deploy to Hoster
        run: |
          ssh root@hoster.kz "cd /opt/tb-group && docker-compose pull && docker-compose up -d"
```

## 💰 Сравнение с AWS архитектурой

| Аспект | AWS (Предыдущая) | Vercel (Текущая) | Hoster.kz (Будущая) |
|--------|------------------|------------------|---------------------|
| **Стоимость/мес** | $495 | $0-22 | $30-50 |
| **Сложность** | Высокая | Низкая | Средняя |
| **Maintenance** | Высокий | Минимальный | Средний |
| **Масштабирование** | Авто | Авто | Ручное |
| **Мониторинг** | Prom/Grafana | Vercel Analytics | Custom |
| **Деплой** | Terraform/Helm | Git push | Docker/CI |
| **DNS** | Route 53 | Vercel | Hoster |
| **SSL** | ACM | Vercel | Hoster |
| **Backup** | S3 | Manual | Server backup |

## 🎯 Рекомендации

### Для старта (0-1000 пользователей/месяц)

1. **Vercel Free** - полностью бесплатно
2. **Vercel Postgres** - бесплатная БД
3. **Upstash Redis** - бесплатный кэш
4. **GitHub Actions** - бесплатный CI/CD
5. **Sentry** - 100 errors/мес бесплатно

### Рост (1000-10000 пользователей/месяц)

1. **Vercel Pro** - $20/мес
2. **Vercel Postgres Pro** - если нужно больше ресурсов
3. **Sentry Team** - $26/мес для 50k errors

### Production (10000+ пользователей/месяц)

1. **Hoster.kz или PS.kz** - $30-50/мес
2. **Локальный мониторинг** - Custom или UptimeRobot
3. **Professional backup** - ежедневные бэкапы

## 📚 Документация

### Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Pricing](https://vercel.com/pricing)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Database](https://vercel.com/docs/storage/vercel-postgres)
- [Upstash Redis](https://upstash.com/docs)

### Гайды

1. [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
2. [Database Migration Guide](./DATABASE_MIGRATION.md)
3. [Monitoring Setup](./VERCEL_MONITORING.md)

---

**Статус:** ✅ Готово к использованию
**Стоимость:** $0/мес (Free tier)
**Сложность:** Низкая
**Maintenance:** Минимальный
