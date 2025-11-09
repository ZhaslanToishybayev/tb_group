# 🚀 Инструкция по деплою TB Group Website

## ✅ Уже выполнено

### 1. Frontend (Vercel)
- **URL:** https://tb-group-website-p87o7qjyq-zhaslantoishybayevs-projects.vercel.app
- **Статус:** ✅ Деплой успешно завершен
- **Сборка:** TypeScript компиляция прошла без ошибок

## 📋 Требуется выполнить

### 2. Backend (Railway)

#### Вариант 1: Через веб-интерфейс Railway (рекомендуется)

1. Зайдите на https://railway.app
2. Нажмите "Login" и авторизуйтесь
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите репозиторий: `ZhaslanToishybayev/tb-group-base`
6. Выберите папку для деплоя: `apps/api`
7. Дождитесь завершения деплоя
8. После деплоя скопируйте URL сервиса (например: `https://tb-group-api-production-xxxx.up.railway.app`)

#### Вариант 2: Через Railway CLI (требует интерактивного логина)

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Залогиньтесь (откроется браузер)
railway login

# Перейдите в папку backend
cd apps/api

# Инициализируйте проект
railway init

# Задеплойте
railway up
```

#### Переменные окружения для Railway

Создайте файл `.env` в папке `apps/api` со следующими переменными:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/tb_group"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Bitrix24 Integration
BITRIX24_WEBHOOK_URL="https://your-bitrix24-domain/webhook-url"
BITRIX24_DEFAULT_ASSIGNED_BY_ID="1"

# reCAPTCHA
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"

# Server
PORT=4000
NODE_ENV=production
```

### 3. Обновление переменных на Vercel

После деплоя backend на Railway:

1. Перейдите в панель управления Vercel: https://vercel.com/zhaslantoishybayevs-projects/tb-group-website
2. Откройте Settings → Environment Variables
3. Добавьте переменную:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** URL вашего backend на Railway (например: `https://tb-group-api-production-xxxx.up.railway.app`)
   - **Environments:** Production, Preview, Development
4. Сохраните
5. Перезадеплойте проект

### 4. Проверка

После выполнения всех шагов:
- Откройте https://tb-group-website-p87o7qjyq-zhaslantoishybayevs-projects.vercel.app
- Проверьте, что сайт загружается
- Проверьте, что формы отправляются (контактная форма)
- Проверьте, что все секции отображаются корректно

## 🔧 Структура проекта

```
tb-group-base/
├── apps/
│   ├── web/          # Frontend (Next.js) - ДЕПЛОЙ НА VERCEL ✅
│   └── api/          # Backend (Express + Prisma) - НУЖЕН ДЕПЛОЙ НА RAILWAY
├── packages/
│   └── config/       # Общие конфигурации
└── docs/             # Документация
```

## 📝 Дополнительная информация

- **Frontend Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend Stack:** Express.js, Prisma ORM, PostgreSQL
- **Хостинг Frontend:** Vercel
- **Хостинг Backend:** Railway
- **База данных:** PostgreSQL (Railway предоставляет)

## 🆘 Решение проблем

### Ошибка: "Cannot find module '../../packages/config/vitest.config'"
**Решение:** Уже исправлено. Удален импорт из витнест конфигурации.

### Ошибка TypeScript: "Property does not exist"
**Решение:** Исправлены все ошибки типов, связанные с framer-motion, performance API, и дубликатами свойств.

### Проблемы с Railway CLI
**Решение:** Используйте веб-интерфейс Railway для деплоя через GitHub.

## 📞 Поддержка

Если у вас возникли вопросы или проблемы, проверьте:
1. Логи деплоя в Vercel/Railway
2. Переменные окружения
3. Подключение к базе данных
