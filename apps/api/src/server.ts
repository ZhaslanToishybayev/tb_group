import env from './config/env';
import prisma from './lib/prisma';
import { logger } from './middleware/logger';
import app from './app';

const PORT = env.PORT ?? 4000;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'API listening');
});

const shutdown = async (signal: NodeJS.Signals) => {
  logger.info({ signal }, 'Shutting down API');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
