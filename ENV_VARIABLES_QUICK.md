# 🔐 ENV VARIABLES - КОПИПАСТ ШПАРГАЛКА

## 🚂 RAILWAY (Backend) - Variables

### СКОПИРУЙТЕ И ВСТАВЬТЕ В Railway → Variables:

```
NODE_ENV = production
PORT = 4000
DATABASE_URL = postgresql://postgres:password@host:5432/railway
JWT_ACCESS_SECRET = b9b75bee41b4dc4fb57a232f5b79693131a467f8aec568de81bbc8ffe64602be
JWT_REFRESH_SECRET = 11bcbb6d92fadf5c6c11a92ddba99b62261c149b4078bf70a035f68b6e8263a1
ADMIN_BOOTSTRAP_EMAIL = admin@tbgroup.kz
ADMIN_BOOTSTRAP_PASSWORD = SecurePass123!
ALLOWED_ORIGINS = https://ваш-vercel-url.vercel.app,https://tbgroup.kz
BITRIX24_USE_STUB = false
EMAIL_USE_STUB = true
```

### ПОСЛЕ ПОЛУЧЕНИЯ reCAPTCHA ДОБАВЬТЕ:
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 6LcXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET = 6LcXXXXXXXXXXXXXXXXXXXX
```

### ПОСЛЕ ПОЛУЧЕНИЯ BITRIX24 ДОБАВЬТЕ:
```
BITRIX24_WEBHOOK_URL = https://ваш-домен.bitrix24.kz/rest/1/xxx/webhook/
```

---

## 🌐 VERCEL (Frontend) - Environment Variables

### СКОПИРУЙТЕ И ВСТАВЬТЕ В Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE_URL = https://ваш-railway-app.railway.app
NEXT_PUBLIC_BASE_URL = https://ваш-vercel-url.vercel.app
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 6LcXXXXXXXXXXXXXXXXXXXX
```

---

## 📋 ПОШАГОВО:

### 1️⃣ RAILWAY
- [ ] Создать проект на https://railway.app
- [ ] Добавить PostgreSQL
- [ ] Скопировать DATABASE_URL
- [ ] Вставить все переменные из раздела "RAILWAY"
- [ ] Дождаться деплоя
- [ ] **Скопировать Railway URL** (например: `https://abc123.railway.app`)

### 2️⃣ VERCEL
- [ ] Создать проект на https://vercel.com
- [ ] Импортировать GitHub репо
- [ ] Root Directory: `apps/web`
- [ ] Вставить NEXT_PUBLIC_API_BASE_URL = ваш Railway URL
- [ ] Вставить NEXT_PUBLIC_BASE_URL = ваш Vercel URL (будет после деплоя)
- [ ] Дождаться деплоя
- [ ] **Скопировать Vercel URL**

### 3️⃣ reCAPTCHA
- [ ] Зайти на https://www.google.com/recaptcha/admin
- [ ] Создать reCAPTCHA v2 "Я не робот"
- [ ] Добавить домены: localhost, ваш-vercel-url.vercel.app
- [ ] Скопировать Site Key и Secret Key
- [ ] Добавить в Railway и Vercel

### 4️⃣ ОБНОВИТЬ RAILWAY
После получения Vercel URL:
- [ ] В Railway обновить ALLOWED_ORIGINS:
  ```
  ALLOWED_ORIGINS = https://ваш-реальный-vercel-url.vercel.app,https://tbgroup.kz
  ```

### 5️⃣ ПРОВЕРИТЬ
- [ ] Сайт открывается: `https://ваш-vercel-url.vercel.app`
- [ ] API работает: `https://ваш-railway-url.railway.app/api/health`
- [ ] Форма отправляется: `/contact`

---

## 🔑 БЫСТРЫЕ ССЫЛКИ:

- **Railway:** https://railway.app
- **Vercel:** https://vercel.com
- **reCAPTCHA:** https://www.google.com/recaptcha/admin
- **GitHub:** https://github.com/ZhaslanToishybayev/tb-group-base

---

## ⚠️ ВАЖНО:

1. **DATABASE_URL** создается автоматически в Railway при добавлении PostgreSQL
2. **NEXT_PUBLIC_API_BASE_URL** в Vercel = ваш Railway URL
3. **NEXT_PUBLIC_BASE_URL** в Vercel = ваш Vercel URL
4. **ALLOWED_ORIGINS** в Railway должен содержать ваш Vercel URL
5. **.env файлы НЕ попадают в Git** (они в .gitignore)

---

## 🎯 ПОСЛЕДОВАТЕЛЬНОСТЬ:

1. Railway → Создать + PostgreSQL + Variables
2. **Получить Railway URL**
3. Vercel → Создать + Variables (с Railway URL)
4. **Получить Vercel URL**
5. Railway → Обновить ALLOWED_ORIGINS (с Vercel URL)
6. reCAPTCHA → Создать + Добавить в оба сервиса

**Готово! 🎉**
