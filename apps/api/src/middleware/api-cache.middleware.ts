import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../modules/cache/cache.service';

// Cache configuration for different endpoints
const CACHE_CONFIGS = {
  // Services - cache for 1 hour
  'api/services': { ttl: 3600, enabled: true },
  'api/services/*': { ttl: 3600, enabled: true },

  // Cases - cache for 30 minutes (more dynamic content)
  'api/cases': { ttl: 1800, enabled: true },
  'api/cases/*': { ttl: 1800, enabled: true },

  // Reviews - cache for 2 hours (less frequently updated)
  'api/reviews': { ttl: 7200, enabled: true },
  'api/reviews/*': { ttl: 7200, enabled: true },

  // Static content - cache for 24 hours
  'api/banners': { ttl: 86400, enabled: true },
  'api/settings': { ttl: 86400, enabled: true },

  // Contact requests - never cache (POST requests)
  'api/contact': { ttl: 0, enabled: false },

  // Admin endpoints - cache for 5 minutes
  'api/admin/*': { ttl: 300, enabled: true },
};

// Cache exempt patterns (requests that should never be cached)
const CACHE_EXEMPT_PATTERNS = [
  /\/api\/contact/,
  /\/api\/auth/,
  /\/api\/admin\/users/,
  /\/api\/backup/,
];

interface CachedResponse {
  response: any;
  timestamp: number;
  endpoint: string;
  paramsHash: string;
  ttl: number;
}

// Middleware for caching API responses
export function apiCacheMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { method, path } = req;

  // Only cache GET requests
  if (method !== 'GET') {
    return next();
  }

  // Check if endpoint should be cached
  const cacheConfig = getCacheConfig(path);
  if (!cacheConfig.enabled) {
    return next();
  }

  // Check if request is exempt from caching
  if (isCacheExempt(path)) {
    return next();
  }

  // Extract parameters for cache key
  const params = {
    query: req.query,
    // Add user-specific parameters if authenticated
    userId: req.user?.id,
    locale: req.get('accept-language')?.split(',')[0],
  };

  // Try to get cached response
  cacheService.getApiResponse(path, params)
    .then(cachedResponse => {
      if (cachedResponse) {
        // Cache hit - return cached response
        logger.info({ path, params }, 'Cache hit for API endpoint');

        // Add cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Age': Math.floor((Date.now() - cachedResponse.timestamp) / 1000),
          'X-Cache-TTL': cacheConfig.ttl,
        });

        return res.json(cachedResponse);
      }

      // Cache miss - intercept response to cache it
      cacheApiResponse(res, path, params, cacheConfig.ttl, next);
    })
    .catch(error => {
      logger.warn({ error, path }, 'Cache middleware error');
      next();
    });
}

// Cache response interceptor
function cacheApiResponse(
  res: Response,
  endpoint: string,
  params: Record<string, any>,
  ttl: number,
  next: NextFunction
): void {
  // Store original res.json function
  const originalJson = res.json.bind(res);

  // Override res.json to cache the response
  res.json = function(data: any) {
    // Don't cache error responses
    if (res.statusCode >= 400) {
      return originalJson(data);
    }

    // Cache the response
    cacheService.cacheApiResponse(endpoint, params, data, ttl)
      .then(success => {
        if (success) {
          logger.debug({ endpoint }, 'API response cached successfully');

          // Add cache headers
          res.set({
            'X-Cache': 'MISS',
            'X-Cache-TTL': ttl,
            'X-Cache-Status': 'STORED',
          });
        }
      })
      .catch(error => {
        logger.warn({ error, endpoint }, 'Failed to cache API response');
      });

    // Return original response
    return originalJson(data);
  };

  next();
}

// Middleware for cache invalidation
export function cacheInvalidationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { method, path } = req;
  const originalJson = res.json.bind(res);

  // Only invalidate cache for POST, PUT, PATCH, DELETE requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return next();
  }

  // Intercept response to invalidate cache after successful operations
  res.json = async function(data: any) {
    try {
      // Extract entity type and ID from path
      const entityInfo = extractEntityInfo(path);

      if (entityInfo) {
        const { entityType, entityId } = entityInfo;

        // Invalidate related caches
        const invalidatedCount = await cacheService.invalidateRelatedCache(entityType, entityId);

        if (invalidatedCount > 0) {
          logger.info({
            entityType,
            entityId,
            invalidatedCount,
            path
          }, 'Cache invalidated after data modification');

          // Add invalidation headers
          res.set({
            'X-Cache-Invalidated': 'true',
            'X-Cache-Invalidated-Count': invalidatedCount.toString(),
          });
        }
      }
    } catch (error) {
      logger.warn({ error, path }, 'Cache invalidation failed');
    }

    return originalJson(data);
  };

  next();
}

// Session middleware for Redis session storage
export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.headers['x-session-id'] as string;

  if (!sessionId) {
    return next();
  }

  // Attach session data to request
  cacheService.getSession(sessionId)
    .then(sessionData => {
      if (sessionData) {
        req.session = sessionData;
        logger.debug({ sessionId }, 'Session data loaded from Redis');
      }
      next();
    })
    .catch(error => {
      logger.warn({ error, sessionId }, 'Session middleware error');
      next();
    });
}

// Utility functions
function getCacheConfig(path: string): { ttl: number; enabled: boolean } {
  // Try exact match first
  for (const [pattern, config] of Object.entries(CACHE_CONFIGS)) {
    if (path === pattern || path.endsWith(pattern)) {
      return config;
    }
  }

  // Default: no cache
  return { ttl: 0, enabled: false };
}

function isCacheExempt(path: string): boolean {
  return CACHE_EXEMPT_PATTERNS.some(pattern => pattern.test(path));
}

function extractEntityInfo(path: string): { entityType: string; entityId?: string } | null {
  // Extract entity type and ID from common API patterns
  const patterns = [
    // /api/services/:id
    /^\/api\/(\w+)\/([^\/\?]+)/,
    // /api/cases/:id
    /^\/api\/(\w+)\/([^\/\?]+)/,
    // /api/reviews/:id
    /^\/api\/(\w+)\/([^\/\?]+)/,
  ];

  for (const pattern of patterns) {
    const match = path.match(pattern);
    if (match) {
      return {
        entityType: match[1],
        entityId: match[2],
      };
    }
  }

  return null;
}

// Export cache service
export { cacheService };

// Type augmentation for session
declare global {
  namespace Express {
    interface Request {
      session?: any;
    }
  }
}

import { logger } from './logger';