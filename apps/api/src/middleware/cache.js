import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../modules/cache/cache.service.js';
import { logger } from '../middleware/logger.js';

interface CacheOptions {
  ttl?: number;
  key?: string;
  condition?: (req: Request, res: Response) => boolean;
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, key, condition } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if condition fails
    if (condition && !condition(req, res)) {
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = key || `api:${req.originalUrl}:${JSON.stringify(req.query)}`;

    try {
      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        logger.debug({ url: req.originalUrl, cacheKey }, 'Cache hit');
        return res.json(cachedData);
      }

      logger.debug({ url: req.originalUrl, cacheKey }, 'Cache miss');

      // Intercept res.json to cache the response
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cache the response
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, data, ttl).catch(error => {
            logger.warn({ error, cacheKey }, 'Failed to cache response');
          });
        }
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.warn({ error, cacheKey }, 'Cache middleware error');
      next();
    }
  };
};

export const invalidateCacheMiddleware = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute the request first
    next();

    // Invalidate cache after request completes
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const deletedCount = await cacheService.invalidatePattern(pattern);
          logger.info({ pattern, deletedCount }, 'Cache invalidated');
        } catch (error) {
          logger.warn({ error, pattern }, 'Failed to invalidate cache');
        }
      }
    });
  };
};

// Cache invalidation helpers
export const invalidateCacheByPattern = async (pattern: string) => {
  return cacheService.invalidatePattern(pattern);
};

export const invalidateCacheByKey = async (key: string) => {
  return cacheService.del(key);
};