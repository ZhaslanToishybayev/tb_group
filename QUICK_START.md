# ⚡ QUICK START - БЫСТРЫЙ СТАРТ

## 🚀 ГОТОВЫЕ КОМАНДЫ

### 1️⃣ КЛОНИРОВАНИЕ ПРОЕКТА

```bash
# Клонировать репозиторий
git clone https://github.com/ZhaslanToishybayev/tb-group-base.git
cd tb-group-base

# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env
```

### 2️⃣ ЛОКАЛЬНЫЙ ЗАПУСК

```bash
# Запустить всё (web + api)
npm run dev

# Или по отдельности:
# Backend
cd apps/api
npm run dev

# Frontend
cd apps/web
npm run dev
```

**URL после запуска:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Health: http://localhost:4000/api/health

---

## 🌐 ДЕПЛОЙ (Railway + Vercel)

### ШАГ 1: Railway Backend

```bash
# 1. Зайти на https://railway.app
# 2. New Project → Deploy from GitHub repo
# 3. Выбрать: ZhaslanToishybayev/tb-group-base
# 4. Root Directory: apps/api
# 5. Добавить PostgreSQL
# 6. Скопировать DATABASE_URL
```

**Variables для Railway (скопировать и вставить):**
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:xxx@xxx:5432/railway
JWT_ACCESS_SECRET=b9b75bee41b4dc4fb57a232f5b79693131a467f8aec568de81bbc8ffe64602be
JWT_REFRESH_SECRET=11bcbb6d92fadf5c6c11a92ddba99b62261c149b4078bf70a035f68b6e8263a1
ADMIN_BOOTSTRAP_EMAIL=admin@tbgroup.kz
ADMIN_BOOTSTRAP_PASSWORD=SecurePass123!
ALLOWED_ORIGINS=https://your-vercel-url.vercel.app,https://tbgroup.kz
BITRIX24_USE_STUB=false
EMAIL_USE_STUB=true
```

**⚠️ Заменить YOUR-VERCEL-URL на реальный URL после деплоя Vercel!**

---

### ШАГ 2: Vercel Frontend

```bash
# 1. Зайти на https://vercel.com
# 2. Add New Project
# 3. Импортировать: ZhaslanToishybayev/tb-group-base
```

**Настройки Vercel:**
- Framework Preset: `Next.js`
- Root Directory: `apps/web`
- Build Command: `npm run build`
- Output Directory: `.next`

**Environment Variables для Vercel:**
```
NEXT_PUBLIC_API_BASE_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_BASE_URL=https://your-vercel-url.vercel.app
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LcXXXXXXXXXXXXXXXXXXXX
```

**⚠️ Заменить YOUR-RAILWAY-APP на URL из Railway!**

---

### ШАГ 3: Обновить Railway

После получения Vercel URL:
```bash
# В Railway → Variables
# Обновить ALLOWED_ORIGINS:
ALLOWED_ORIGINS=https://реальный-vercel-url.vercel.app,https://tbgroup.kz
```

---

## 🔐 ПОЛУЧИТЬ reCAPTCHA

```bash
# 1. Зайти на https://www.google.com/recaptcha/admin
# 2. Create → reCAPTCHA v2 → "I'm not a robot"
# 3. Добавить домены:
#    - localhost
#    - ваш-vercel-url.vercel.app
# 4. Скопировать ключи
# 5. Добавить в Railway И в Vercel
```

---

## 📁 СТРУКТУРА ПРОЕКТА

```
tb-group-base/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # Express.js Backend
├── .env.example      # Шаблон переменных
├── .env              # Ваши переменные (НЕ в Git!)
└── docs/             # Документация
```

---

## 🧪 ТЕСТИРОВАНИЕ

### Проверить Backend (Railway):
```bash
curl https://ваш-railway-app.railway.app/api/health
# Должно вернуть: {"status":"ok"}
```

### Проверить Frontend (Vercel):
```bash
# Открыть в браузере:
https://ваш-vercel-url.vercel.app
```

### Проверить форму:
```bash
# Перейти на:
https://ваш-vercel-url.vercel.app/contact

# Заполнить и отправить форму
# Должно появиться уведомление об успехе
```

---

## 🆘 ПРОБЛЕМЫ?

### Ошибка: DATABASE_URL
```bash
# Убедитесь что PostgreSQL добавлен в Railway
# DATABASE_URL должен быть в формате:
# postgresql://postgres:password@host:port/database
```

### Ошибка: CORS
```bash
# Проверьте ALLOWED_ORIGINS в Railway:
# Должно содержать точный URL Vercel БЕЗ слеша в конце
```

### Ошибка: reCAPTCHA
```bash
# Проверьте что:
# - NEXT_PUBLIC_RECAPTCHA_SITE_KEY в Vercel
# - RECAPTCHA_SECRET в Railway
# - Домены добавлены в настройках reCAPTCHA
```

---

## 🎯 ФИНАЛЬНЫЙ ЧЕКЛИСТ

- [ ] Проект склонирован
- [ ] Зависимости установлены
- [ ] .env создан
- [ ] Railway настроен
- [ ] Vercel настроен
- [ ] reCAPTCHA настроен
- [ ] Сайт открывается
- [ ] Форма отправляется

---

## 📞 ССЫЛКИ

- **GitHub:** https://github.com/ZhaslanToishybayev/tb-group-base
- **Railway:** https://railway.app
- **Vercel:** https://vercel.com
- **reCAPTCHA:** https://www.google.com/recaptcha/admin
- **Документация:** DEPLOYMENT_GUIDE.md
- **ENV Шпаргалка:** ENV_VARIABLES_QUICK.md

---

## ✅ ГОТОВО!

**Ваш сайт готов к продакшену! 🎉**

- Frontend: https://ваш-vercel-url.vercel.app
- Backend: https://ваш-railway-app.railway.app
- Админ: https://ваш-vercel-url.vercel.app/admin
