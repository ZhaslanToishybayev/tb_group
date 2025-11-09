# ⚡ Quick Start - TB Group на Vercel (5 минут)

## 🚀 Самый быстрый способ запустить сайт

### Шаг 1: Создаем репозиторий (1 мин)

```bash
# 1. Заходим на https://github.com
# 2. Создаем новый репозиторий: tb-group-website
# 3. Клонируем:
git clone https://github.com/your-username/tb-group-website.git
cd tb-group-website
```

### Шаг 2: Создаем проект (2 мин)

```bash
# Инициализируем Next.js проект
npx create-next-app@latest . --typescript --tailwind --eslint --app

# Устанавливаем дополнительные пакеты
npm install @prisma/client @upstash/ratelimit zod
npm install -D prisma
```

### Шаг 3: Добавляем файлы (1 мин)

Создаем `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

Создаем `.env.example`:

```env
DATABASE_URL=""
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### Шаг 4: Подключаем Vercel (1 мин)

1. Заходим на [vercel.com](https://vercel.com)
2. Регистрируемся через GitHub
3. Нажимаем "New Project"
4. Выбираем наш репозиторий
5. Нажимаем "Deploy"

**Готово! Сайт уже доступен на https://your-app.vercel.app**

## 🎯 Что дальше?

### Для полноценного сайта:

1. **База данных** → Создаем Vercel Postgres (бесплатно)
2. **Redis** → Регистрируемся в Upstash (бесплатно)
3. **Домен** → Покупаем .kz домен ($10/год)
4. **Контент** → Добавляем страницы и контент

### Быстрые команды:

```bash
# Добавить страницу
npx create-next-app@latest --ts --app about

# Добавить API
touch app/api/contact/route.ts

# Добавить компонент
touch components/ContactForm.tsx

# Локальная разработка
npm run dev

# Проверить build
npm run build

# Задеплоить
vercel --prod
```

## 📊 Что бесплатно на Vercel?

- ✅ Неограниченные репозитории
- ✅ 100GB bandwidth/мес
- ✅ Автоматический SSL
- ✅ Глобальный CDN
- ✅ Serverless functions
- ✅ Edge Functions
- ✅ Preview для каждого PR

## 💰 Стоимость (месячно)

| Сервис | Free | Pro ($20) |
|--------|------|-----------|
| Vercel | ✅ | + 1TB bandwidth, team features |
| Postgres | 1GB | Unlimited |
| Redis | 10K requests/day | Unlimited |
| Analytics | Basic | Advanced |
| **Total** | **$0** | **$20** |

## 🔧 Полезные команды

```bash
# Установить Vercel CLI
npm i -g vercel

# Логин
vercel login

# Деплой (preview)
vercel

# Production деплой
vercel --prod

# Посмотреть логи
vercel logs

# Переменные окружения
vercel env ls
vercel env add DATABASE_URL

# Домены
vercel domains
vercel dns
```

## 📚 Документация

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)

## 🎓 Обучение

- [Next.js Tutorial](https://nextjs.org/learn)
- [Vercel Guide](https://vercel.com/docs/concepts)
- [App Router Guide](https://nextjs.org/docs/app)

## 🆘 Поддержка

- [Vercel Discord](https://vercel.com/discord)
- [GitHub Issues](https://github.com/vercel/next.js/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js+vercel)

---

**🎉 Готово! Ваш сайт уже работает на Vercel!**

**Время настройки:** 5 минут
**Стоимость:** $0/мес
**Сложность:** ⭐ (самая простая)
