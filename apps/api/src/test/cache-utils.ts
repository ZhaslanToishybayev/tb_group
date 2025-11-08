import { cacheService } from '../modules/cache/cache.service';

export class CacheUtils {
  private isConnected = false;

  async connect() {
    try {
      const status = cacheService.getStatus();
      if (status.enabled && status.connected) {
        this.isConnected = true;
      }
    } catch (error) {
      console.warn('Cache connection failed:', error);
      this.isConnected = false;
    }
  }

  async disconnect() {
    this.isConnected = false;
  }

  async clearAll() {
    if (this.isConnected) {
      await cacheService.flushAll();
    }
  }

  // Cache operations
  async set(key: string, value: any, ttl: number = 3600) {
    if (!this.isConnected) {
      return false;
    }
    return cacheService.set(key, value, ttl);
  }

  async get(key: string) {
    if (!this.isConnected) {
      return null;
    }
    return cacheService.get(key);
  }

  async del(key: string) {
    if (!this.isConnected) {
      return false;
    }
    return cacheService.del(key);
  }

  async exists(key: string) {
    if (!this.isConnected) {
      return false;
    }
    return cacheService.exists(key);
  }

  // Pattern operations
  async invalidatePattern(pattern: string) {
    if (!this.isConnected) {
      return 0;
    }
    return cacheService.invalidatePattern(pattern);
  }

  // Session operations
  async setSession(sessionId: string, data: any, ttl: number = 86400) {
    if (!this.isConnected) {
      return false;
    }
    return cacheService.setSession(sessionId, data, ttl);
  }

  async getSession(sessionId: string) {
    if (!this.isConnected) {
      return null;
    }
    return cacheService.getSession(sessionId);
  }

  async deleteSession(sessionId: string) {
    if (!this.isConnected) {
      return false;
    }
    return cacheService.deleteSession(sessionId);
  }

  // Cache warming
  async warmCache() {
    if (!this.isConnected) {
      return { success: false, warmed: 0, errors: ['Cache not connected'] };
    }
    return cacheService.warmCache();
  }

  // Statistics
  async getStats() {
    if (!this.isConnected) {
      return null;
    }
    return cacheService.getCacheStats();
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected) {
      return false;
    }
    try {
      const status = cacheService.getStatus();
      return status.enabled && status.connected;
    } catch {
      return false;
    }
  }

  // Test data cache
  async cacheTestData(key: string, data: any, ttl: number = 300) {
    return this.set(`test:${key}`, data, ttl);
  }

  async getTestData(key: string) {
    return this.get(`test:${key}`);
  }

  async clearTestData(key: string) {
    return this.del(`test:${key}`);
  }

  async clearAllTestData() {
    return this.invalidatePattern('test:*');
  }
}