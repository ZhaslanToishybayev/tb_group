import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'node:path';

import env from './config/env';
import prisma from './lib/prisma';
import { httpLogger, logger } from './middleware/logger';
import { errorHandler } from './middleware/error-handler';
import { apiCacheMiddleware, cacheInvalidationMiddleware, sessionMiddleware } from './middleware/api-cache.middleware';
import authRouter from './modules/auth/auth.router';
import servicesRouter from './modules/services/services.router';
import casesRouter from './modules/cases/cases.router';
import reviewsRouter from './modules/reviews/reviews.router';
import bannersRouter from './modules/banners/banners.router';
import settingsRouter from './modules/settings/settings.router';
import mediaRouter from './modules/media/media.router';
import contactRouter from './modules/contact/contact.router';
import uploadsRouter from './modules/uploads/uploads.router';
// import analyticsRouter from './modules/analytics/analytics.router';
// import emailRouter from './modules/email/email.router';
import cacheRouter from './modules/cache/cache.router';
// import analyticsAIRouter from './modules/analytics-ai/analytics-ai.router';
import swaggerUi from 'swagger-ui-express';
import openApiDocument from './openapi/document';

const app = express();
const uploadsDir = env.UPLOADS_DIR ?? path.resolve(process.cwd(), 'uploads');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
  }),
);
app.use(httpLogger);
app.use('/uploads', express.static(uploadsDir));

// Apply cache middleware to API routes
app.use('/api', sessionMiddleware);
app.use('/api', apiCacheMiddleware);
app.use('/api', cacheInvalidationMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/cases', casesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/contact', contactRouter);
app.use('/api/uploads', uploadsRouter);
// app.use('/api/analytics', analyticsRouter);
// app.use('/api/email', emailRouter);
app.use('/api/cache', cacheRouter);
// app.use('/api/analytics-ai', analyticsAIRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, 'Database health check failed');
    res.status(500).json({ ok: false, error: 'DB_UNAVAILABLE' });
  }
});

app.use(errorHandler);

export default app;
