/**
 * Status Service Server
 *
 * Express server that demonstrates the admin routes and incident service integration.
 * This provides a complete working example of the status service API.
 */

import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import { getMetrics, register } from './services/metrics.js';

const logger = pino({ name: 'status-server' });

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(pinoHttp({
  logger,
  autoLogging: true,
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        headers: req.headers,
        remoteAddress: req.socket?.remoteAddress,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from public directory
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'status-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await getMetrics();
    res.end(metrics);
  } catch (error) {
    logger.error({ error }, 'Failed to generate Prometheus metrics');
    res.status(500).end('Failed to generate metrics');
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    service: 'TB Group Status Service',
    version: '1.0.0',
    description: 'Incident tracking and status page management API',
    endpoints: {
      public: {
        'GET /': 'Public status page (HTML)',
        'GET /api/incidents': 'Public incident list (JSON)',
        'GET /api/status': 'Current system status (JSON)',
      },
      admin: {
        'GET /admin/incidents': 'List all incidents',
        'GET /admin/incidents/:id': 'Get specific incident',
        'POST /admin/incidents': 'Create new incident',
        'PUT /admin/incidents/:id': 'Update incident',
        'POST /admin/incidents/:id/status': 'Update incident status',
        'DELETE /admin/incidents/:id': 'Delete incident',
        'GET /admin/stats': 'Get incident statistics',
        'POST /admin/incidents/clear': 'Clear all incidents',
      },
      metrics: {
        'GET /metrics': 'Prometheus metrics endpoint',
      },
    },
    documentation: 'See README.md for detailed API documentation',
  });
});

// Mount public routes
app.use('/', publicRoutes);

// Mount admin routes
app.use('/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ error, method: req.method, url: req.url }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
});

// Start server
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    logger.info(`🚀 Status Service server running on port ${PORT}`);
    logger.info(`🌐 Public Status Page: http://localhost:${PORT}/`);
    logger.info(`📊 Admin API: http://localhost:${PORT}/admin`);
    logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
    logger.info(`📋 API info: http://localhost:${PORT}/api`);
  });
}

export default app;
