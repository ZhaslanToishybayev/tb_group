# 🚀 ДЕПЛОЙ TB GROUP - ПОШАГОВОЕ РУКОВОДСТВО

## 📋 ЧТО МЫ БУДЕМ ДЕПЛОИТЬ:
- **Backend (Express + PostgreSQL)** → Railway
- **Frontend (Next.js)** → Vercel

---

## 🎯 ЭТАП 1: НАСТРОЙКА RAILWAY (Backend)

### 1.1 Создание аккаунта
1. Зайдите на https://railway.app
2. Нажмите "Login"
3. Войдите через GitHub

### 1.2 Создание проекта
1. Нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Найдите репозиторий: `ZhaslanToishybayev/tb-group-base`
4. Нажмите "Deploy Now"

### 1.3 Настройка Root Directory
1. В настройках проекта найдите "Root Directory"
2. Установите: `apps/api`
3. Сохраните

### 1.4 Добавление PostgreSQL
1. В проекте нажмите "New"
2. Выберите "Database" → "Add PostgreSQL"
3. Дождитесь создания (2-3 минуты)
4. **ВАЖНО:** Скопируйте DATABASE_URL из вкладки "Connect"

### 1.5 Настройка переменных окружения (Railway Variables)

**1. Откройте Variables tab**

**2. Добавьте по одной (нажимая "Add Variable" каждый раз):**

```
NODE_ENV = production
PORT = 4000
DATABASE_URL = [ВСТАВЬТЕ СКОПИРОВАННЫЙ URL ИЗ ПУНКТА 1.4]
JWT_ACCESS_SECRET = b9b75bee41b4dc4fb57a232f5b79693131a467f8aec568de81bbc8ffe64602be
JWT_REFRESH_SECRET = 11bcbb6d92fadf5c6c11a92ddba99b62261c149b4078bf70a035f68b6e8263a1
ADMIN_BOOTSTRAP_EMAIL = admin@tbgroup.kz
ADMIN_BOOTSTRAP_PASSWORD = SecurePass123!
ALLOWED_ORIGINS = https://your-vercel-url.vercel.app,https://tbgroup.kz
```

**3. Для Bitrix24 (если есть):**
```
BITRIX24_WEBHOOK_URL = https://your-domain.bitrix24.kz/rest/1/xxx/webhook/
BITRIX24_USE_STUB = false
```

**4. Для reCAPTCHA (получите на https://www.google.com/recaptcha/admin):**
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 6LcXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET = 6LcXXXXXXXXXXXXXXXXXXXX
```

**5. Нажмите "Deploy"**

### 1.6 Проверка деплоя
1. Перейдите на вкладку "Deploy"
2. Дождитесь зеленого статуса "Success"
3. **Скопируйте URL приложения** (например: `https://my-app-12345.railway.app`)

---

## 🎯 ЭТАП 2: НАСТРОЙКА VERCEL (Frontend)

### 2.1 Создание проекта
1. Зайдите на https://vercel.com
2. Нажмите "Add New Project"
3. Импортируйте репозиторий: `ZhaslanToishybayev/tb-group-base`

### 2.2 Настройка конфигурации

**Framework Preset:** Next.js

**Root Directory:** `apps/web`

**Build Command:** `npm run build`

**Output Directory:** `.next`

**Install Command:** `npm install`

### 2.3 Настройка переменных окружения (Vercel)

**В разделе Environment Variables добавьте:**

```
NEXT_PUBLIC_API_BASE_URL = https://ВАШ-RAILWAY-URL.railway.app
NEXT_PUBLIC_BASE_URL = https://ваш-vercel-url.vercel.app
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 6LcXXXXXXXXXXXXXXXXXXXX
```

**⚠️ ВАЖНО:**
- `NEXT_PUBLIC_API_BASE_URL` = URL из Railway (пункт 1.6)
- `NEXT_PUBLIC_BASE_URL` = URL который покажет Vercel после деплоя

### 2.4 Деплой
1. Нажмите "Deploy"
2. Дождитесь завершения (3-5 минут)
3. **Скопируйте Vercel URL** (например: `https://tb-group-xyz.vercel.app`)

### 2.5 Обновление Railway ALLOWED_ORIGINS
Вернитесь в Railway → Variables
Обновите `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS = https://tb-group-xyz.vercel.app,https://tbgroup.kz
```
(замените на ваш реальный Vercel URL)

---

## 🎯 ЭТАП 3: ПОЛУЧЕНИЕ reCAPTCHA

### 3.1 Создание reCAPTCHA
1. Зайдите на https://www.google.com/recaptcha/admin
2. Нажмите "Create"
3. Label: `TB Group Contact Form`
4. reCAPTCHA type: `reCAPTCHA v2` → `I'm not a robot Checkbox`
5. Domains:
   - `localhost` (для тестов)
   - `your-vercel-url.vercel.app`
   - `tbgroup.kz` (если есть)
6. Нажмите "Submit"

### 3.2 Копирование ключей
**Site Key:** `6LcXXXXXXXXXXXXXXXXXXXX` (публичный, можно в frontend)
**Secret Key:** `6LcXXXXXXXXXXXXXXXXXXXX` (секретный, только в backend)

### 3.3 Добавление в сервисы
- **Railway:** Оба ключа
- **Vercel:** Только Site Key

---

## 🎯 ЭТАП 4: ПОЛУЧЕНИЕ BITRIX24 WEBHOOK (опционально)

### 4.1 Создание Webhook
1. Зайдите в Bitrix24
2. Настройки → Интеграции → Входящий вебхук
3. Нажмите "Создать вебхук"
4. Название: `TB Group Website`
5. Обработчик события: `crm.lead.add`
6. Права доступа: `CRM (write)`
7. Нажмите "Сохранить"

### 4.2 Копирование URL
Скопируйте "Входящий вебхук URL" вида:
`https://your-domain.bitrix24.kz/rest/1/xxx/webhook/`

### 4.3 Добавление в Railway
В Railway → Variables:
```
BITRIX24_WEBHOOK_URL = https://ваш-URL
BITRIX24_USE_STUB = false
```

---

## 🎯 ЭТАП 5: ПРОВЕРКА РАБОТЫ

### 5.1 Проверка Backend (Railway)
1. Откройте: `https://ВАШ-RAILWAY-URL.railway.app/api/health`
2. Должен вернуть: `{"status":"ok"}`

### 5.2 Проверка Frontend (Vercel)
1. Откройте: `https://ВАШ-VERCEL-URL.vercel.app`
2. Сайт должен открыться без ошибок

### 5.3 Проверка контактной формы
1. Перейдите на `/contact`
2. Заполните форму
3. Нажмите "Отправить"
4. Должно появиться уведомление об успехе

### 5.4 Проверка Bitrix24
Если настроили webhook:
1. Заполните форму на сайте
2. Проверьте Bitrix24 → CRM → Лиды
3. Должен появиться новый лид

---

## 🆘 ТРОУБЛШУТИНГ

### Backend не запускается (Railway)
**Проверьте логи:**
1. Railway → Ваш проект → Deploy → View Logs
2. Ищите ошибки:
   - DATABASE_URL неверный
   - JWT_SECRET слишком короткий
   - ALLOWED_ORIGINS не содержит Vercel URL

### Frontend не видит API (Vercel)
**Проверьте переменные:**
1. Vercel → Ваш проект → Settings → Environment Variables
2. Убедитесь что `NEXT_PUBLIC_API_BASE_URL` указан правильно
3. Перезадеплойте после изменения

### reCAPTCHA не работает
**Проверьте:**
1. Ключи добавлены и в Railway, и в Vercel
2. Домены добавлены в настройках reCAPTCHA
3. Site Key в Vercel, Secret Key в Railway

### CORS ошибки
**Проверьте ALLOWED_ORIGINS в Railway:**
```
ALLOWED_ORIGINS = https://tb-group-xyz.vercel.app,https://tbgroup.kz
```
(должны быть точные URL без слешей в конце)

---

## ✅ ЧЕКЛИСТ ЗАВЕРШЕНИЯ

- [ ] Railway проект создан и задеплоен
- [ ] PostgreSQL добавлен в Railway
- [ ] Переменные окружения настроены в Railway
- [ ] Railway URL скопирован
- [ ] Vercel проект создан и задеплоен
- [ ] Переменные окружения настроены в Vercel
- [ ] reCAPTCHA настроен и добавлен
- [ ] ALLOWED_ORIGINS обновлен в Railway
- [ ] Сайт открывается и работает
- [ ] Контактная форма отправляется

---

## 🎉 ГОТОВО!

После выполнения всех пунктов у вас будет:
- ✅ Рабочий сайт на Vercel
- ✅ Рабочий API на Railway
- ✅ База данных PostgreSQL
- ✅ Интеграция с Bitrix24
- ✅ Защита от ботов (reCAPTCHA)

**URL для проверки:**
- **Сайт:** `https://ВАШ-VERCEL-URL.vercel.app`
- **API:** `https://ВАШ-RAILWAY-URL.railway.app`
- **Админ панель:** `https://ВАШ-VERCEL-URL.vercel.app/admin`

---

## 📞 ПОДДЕРЖКА

Если что-то не работает:
1. Проверьте логи в Railway и Vercel
2. Убедитесь что все переменные настроены
3. Перезадеплойте после изменений

**Удачи! 🚀**
