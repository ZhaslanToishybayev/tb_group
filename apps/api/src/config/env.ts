import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .transform((value) => Number(value))
    .or(z.number())
    .optional()
    .pipe(z.number().int().positive().max(65535).default(4000)),
  ALLOWED_ORIGINS: z
    .string()
    .transform((value) => value.split(',').map((origin) => origin.trim()))
    .or(z.array(z.string()))
    .default(['http://localhost:3000', 'http://localhost:5173']),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXP_DAYS: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .or(z.number())
    .pipe(z.number().int().positive().default(30)),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email(),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8),
  BITRIX24_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
  BITRIX24_USE_STUB: z
    .string()
    .transform((value) => value === 'true')
    .or(z.boolean())
    .default(true),
  BITRIX24_DOMAIN: z.string().optional(),
  BITRIX24_ASSIGNED_ID: z.string().optional(),
  BITRIX24_CATEGORY_ID: z.string().optional(),
  BITRIX24_STATUS_ID: z.string().default('NEW'),
  BITRIX24_SOURCE_ID: z.string().default('WEB'),
  BITRIX24_CURRENCY_ID: z.string().default('KZT'),
  BITRIX24_CUSTOM_FIELDS: z.string().optional(),
  BITRIX24_ENABLE_LOGGING: z
    .string()
    .transform((value) => value === 'true')
    .or(z.boolean())
    .default(true),
  BITRIX24_RETRY_ATTEMPTS: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .or(z.number())
    .default(3),
  BITRIX24_RETRY_DELAY: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .or(z.number())
    .default(1000),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .or(z.number())
    .optional(),
  SMTP_SECURE: z
    .string()
    .transform((value) => value === 'true')
    .or(z.boolean())
    .default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_BACKUP_HOST: z.string().optional(),
  SMTP_BACKUP_PORT: z
    .string()
    .transform((value) => Number.parseInt(value, 10))
    .or(z.number())
    .optional(),
  SMTP_BACKUP_SECURE: z
    .string()
    .transform((value) => value === 'true')
    .or(z.boolean())
    .default(false),
  SMTP_BACKUP_USER: z.string().optional(),
  SMTP_BACKUP_PASS: z.string().optional(),
  SMTP_BACKUP_FROM: z.string().optional(),
  EMAIL_NOTIFICATIONS_TO: z
    .string()
    .transform((value) => value.split(',').map((item) => item.trim()).filter(Boolean))
    .or(z.array(z.string()))
    .default([]),
  EMAIL_USE_STUB: z
    .string()
    .transform((value) => value === 'true')
    .or(z.boolean())
    .default(true),
  RECAPTCHA_SECRET: z.string().optional(),
  UPLOADS_DIR: z.string().optional(),
  ASSET_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: parsed.data.PORT ?? 4000,
  ALLOWED_ORIGINS: Array.isArray(parsed.data.ALLOWED_ORIGINS)
    ? parsed.data.ALLOWED_ORIGINS
    : [parsed.data.ALLOWED_ORIGINS],
  JWT_REFRESH_EXP_DAYS: parsed.data.JWT_REFRESH_EXP_DAYS,
  EMAIL_NOTIFICATIONS_TO: Array.isArray(parsed.data.EMAIL_NOTIFICATIONS_TO)
    ? parsed.data.EMAIL_NOTIFICATIONS_TO
    : [parsed.data.EMAIL_NOTIFICATIONS_TO],
};

export default env;
