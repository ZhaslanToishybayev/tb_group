import argon2 from 'argon2';

import env from '../config/env';
import prisma from '../lib/prisma';

async function main() {
  const existing = await prisma.adminUser.findUnique({ where: { email: env.ADMIN_BOOTSTRAP_EMAIL } });
  if (existing) {
    console.info('Admin user already exists, skipping bootstrap');
    return;
  }

  const passwordHash = await argon2.hash(env.ADMIN_BOOTSTRAP_PASSWORD);
  await prisma.adminUser.create({
    data: {
      email: env.ADMIN_BOOTSTRAP_EMAIL,
      passwordHash,
      displayName: 'TB Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.info(`Admin user created: ${env.ADMIN_BOOTSTRAP_EMAIL}`);
}

main()
  .catch((error) => {
    console.error('Bootstrap admin failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
