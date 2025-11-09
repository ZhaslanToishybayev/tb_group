#!/bin/bash

# Скрипт автоматической миграции на Neon
# Использование: ./scripts/deploy-to-neon.sh "neon_connection_string"

set -e

echo "🚀 Starting migration to Neon PostgreSQL..."

# Проверяем, есть ли connection string
if [ -z "$1" ]; then
    echo "❌ Error: Please provide Neon connection string"
    echo "Usage: $0 'postgresql://user:pass@host/db?sslmode=require'"
    echo ""
    echo "Get your connection string from: https://neon.tech"
    exit 1
fi

NEON_URL="$1"
echo "✅ Connection string received"

# Устанавливаем временную DATABASE_URL
export DATABASE_URL="$NEON_URL"
echo "✅ DATABASE_URL set"

# Генерируем Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"

# Выполняем миграцию
echo "🔄 Running database migration..."
npx prisma migrate deploy
echo "✅ Migration completed"

# Проверяем подключение
echo "🔍 Verifying connection..."
npx prisma db pull --preview-feature
echo "✅ Database connection verified"

# Генерируем seed данные (если есть)
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
    echo "✅ Database seeded"
fi

echo ""
echo "🎉 Migration to Neon completed successfully!"
echo "✅ Your database is now running on Neon"
echo "✅ Application is ready to use"
echo ""
echo "Next steps:"
echo "1. Update DATABASE_URL in your .env file"
echo "2. Update DATABASE_URL in Vercel environment variables"
echo "3. Deploy your API to Railway or Vercel"
echo ""
