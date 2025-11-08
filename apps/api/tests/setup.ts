import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll } from 'vitest';

process.env.BITRIX24_WEBHOOK_URL = 'https://example.com';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/tbgroup_test';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
