import Redis from 'ioredis';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../middleware/logger';
import env from '../../config/env';

export class CacheService {
  private redis: Redis | null = null;
  private isRedisEnabled = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    if (env.REDIS_URL) {
      try {
        this.redis = new Redis(env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('connect', () => {
          logger.info('Redis connected successfully');
          this.isRedisEnabled = true;
        });

        this.redis.on('error', (err) => {
          logger.error({ err }, 'Redis connection error');
          this.isRedisEnabled = false;
        });

        await this.redis.connect();
      } catch (error) {
        logger.warn({ error }, 'Redis initialization failed, cache will be disabled');
        this.isRedisEnabled = false;
      }
    } else {
      logger.info('Redis URL not configured, cache will be disabled');
      this.isRedisEnabled = false;
    }
  }

  // Cache operations
  async get<T>(key: string): Promise<T | null> {
    if (!this.isRedisEnabled || !this.redis) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.warn({ error, key }, 'Cache get failed');
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    if (!this.isRedisEnabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.warn({ error, key }, 'Cache set failed');
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isRedisEnabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.warn({ error, key }, 'Cache delete failed');
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isRedisEnabled || !this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.warn({ error, key }, 'Cache exists check failed');
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.isRedisEnabled || !this.redis) {
      return 0;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      logger.warn({ error, pattern }, 'Cache pattern invalidation failed');
      return 0;
    }
  }

  async flushAll(): Promise<boolean> {
    if (!this.isRedisEnabled || !this.redis) {
      return false;
    }

    try {
      await this.redis.flushdb();
      logger.info('Cache flushed successfully');
      return true;
    } catch (error) {
      logger.warn({ error }, 'Cache flush failed');
      return false;
    }
  }

  // Advanced cache operations for API response caching

  // Cache API responses with intelligent invalidation
  async cacheApiResponse(
    endpoint: string,
    params: Record<string, any>,
    response: any,
    ttl: number = 3600
  ): Promise<boolean> {
    if (!this.isRedisEnabled || !this.redis) {
      return false;
    }

    try {
      // Create cache key based on endpoint and parameters
      const cacheKey = this.generateApiCacheKey(endpoint, params);

      // Store response with metadata
      const cacheData = {
        response,
        timestamp: Date.now(),
        endpoint,
        paramsHash: this.hashParams(params),
        ttl,
      };

      await this.redis.setex(cacheKey, ttl, JSON.stringify(cacheData));

      // Track cache dependencies for intelligent invalidation
      await this.trackCacheDependency(endpoint, cacheKey);

      return true;
    } catch (error) {
      logger.warn({ error, endpoint }, 'API response caching failed');
      return false;
    }
  }

  // Get cached API response
  async getApiResponse(endpoint: string, params: Record<string, any>): Promise<any | null> {
    if (!this.isRedisEnabled || !this.redis) {
      return null;
    }

    try {
      const cacheKey = this.generateApiCacheKey(endpoint, params);
      const cached = await this.redis.get(cacheKey);

      if (!cached) {
        return null;
      }

      const cacheData = JSON.parse(cached);

      // Check if cache is still valid
      if (this.isCacheValid(cacheData)) {
        return cacheData.response;
      }

      // Cache expired, remove it
      await this.redis.del(cacheKey);
      return null;
    } catch (error) {
      logger.warn({ error, endpoint }, 'API response retrieval failed');
      return null;
    }
  }

  // Intelligent cache invalidation based on data dependencies
  async invalidateRelatedCache(entityType: string, entityId?: string): Promise<number> {
    if (!this.isRedisEnabled || !this.redis) {
      return 0;
    }

    try {
      let invalidatedCount = 0;

      if (entityId) {
        // Invalidate specific entity cache
        const patterns = [
          `api:*:${entityType}:${entityId}`,
          `api:*:${entityType}:*:${entityId}`,
          `list:${entityType}:*`,
          `stats:${entityType}:*`,
        ];

        for (const pattern of patterns) {
          invalidatedCount += await this.invalidatePattern(pattern);
        }
      } else {
        // Invalidate all caches related to entity type
        const patterns = [
          `api:*:${entityType}:*`,
          `list:${entityType}:*`,
          `stats:${entityType}:*`,
        ];

        for (const pattern of patterns) {
          invalidatedCount += await this.invalidatePattern(pattern);
        }
      }

      // Invalidate related caches
      const relatedEntities = this.getRelatedEntities(entityType);
      for (const related of relatedEntities) {
        invalidatedCount += await this.invalidatePattern(`api:*:${related}:*`);
      }

      return invalidatedCount;
    } catch (error) {
      logger.warn({ error, entityType, entityId }, 'Intelligent cache invalidation failed');
      return 0;
    }
  }

  // Session storage operations
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    if (!this.isRedisEnabled || !this.redis) {
      return false;
    }

    try {
      const sessionKey = `session:${sessionId}`;
      await this.redis.setex(sessionKey, ttl, JSON.stringify({
        data,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
      }));
      return true;
    } catch (error) {
      logger.warn({ error, sessionId }, 'Session storage failed');
      return false;
    }
  }

  async getSession(sessionId: string): Promise<any | null> {
    if (!this.isRedisEnabled || !this.redis) {
      return null;
    }

    try {
      const sessionKey = `session:${sessionId}`;
      const session = await this.redis.get(sessionKey);

      if (!session) {
        return null;
      }

      const sessionData = JSON.parse(session);

      // Update last accessed time
      sessionData.lastAccessed = Date.now();
      await this.redis.setex(sessionKey, 86400, JSON.stringify(sessionData));

      return sessionData.data;
    } catch (error) {
      logger.warn({ error, sessionId }, 'Session retrieval failed');
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    if (!this.isRedisEnabled || !this.redis) {
      return false;
    }

    try {
      const sessionKey = `session:${sessionId}`;
      await this.redis.del(sessionKey);
      return true;
    } catch (error) {
      logger.warn({ error, sessionId }, 'Session deletion failed');
      return false;
    }
  }

  // Cache warming strategies
  async warmCache(): Promise<{ success: boolean; warmed: number; errors: string[] }> {
    if (!this.isRedisEnabled || !this.redis) {
      return { success: false, warmed: 0, errors: ['Redis not enabled'] };
    }

    const errors: string[] = [];
    let warmed = 0;

    try {
      // Pre-warm frequently accessed data
      const warmingTasks = [
        this.warmStaticData(),
        this.warmPopularQueries(),
        this.warmUserSessions(),
      ];

      for (const task of warmingTasks) {
        try {
          const result = await task;
          warmed += result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(errorMessage);
        }
      }

      logger.info({ warmed, errorCount: errors.length }, 'Cache warming completed');

      return { success: true, warmed, errors };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, warmed, errors: [errorMessage] };
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    enabled: boolean;
    connected: boolean;
    memory: {
      used: number;
      peak: number;
      percentage: number;
    };
    keys: {
      total: number;
      api: number;
      sessions: number;
    };
    hits: {
      total: number;
      misses: number;
      hitRate: number;
    };
  }> {
    if (!this.isRedisEnabled || !this.redis) {
      return {
        enabled: false,
        connected: false,
        memory: { used: 0, peak: 0, percentage: 0 },
        keys: { total: 0, api: 0, sessions: 0 },
        hits: { total: 0, misses: 0, hitRate: 0 },
      };
    }

    try {
      const info = await this.redis.info('memory');
      const keyCount = await this.redis.dbSize();
      const apiKeys = await this.redis.keys('api:*').then(keys => keys.length);
      const sessionKeys = await this.redis.keys('session:*').then(keys => keys.length);

      // Parse memory info
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const peakMatch = info.match(/used_memory_peak:(\d+)/);

      const used = memoryMatch ? parseInt(memoryMatch[1]) : 0;
      const peak = peakMatch ? parseInt(peakMatch[1]) : 0;

      return {
        enabled: this.isRedisEnabled,
        connected: this.redis?.status === 'ready',
        memory: {
          used,
          peak,
          percentage: peak > 0 ? (used / peak) * 100 : 0,
        },
        keys: {
          total: keyCount,
          api: apiKeys,
          sessions: sessionKeys,
        },
        hits: {
          total: 0, // Would need custom tracking
          misses: 0,
          hitRate: 0,
        },
      };
    } catch (error) {
      logger.warn({ error }, 'Failed to get cache statistics');
      return {
        enabled: this.isRedisEnabled,
        connected: this.redis?.status === 'ready',
        memory: { used: 0, peak: 0, percentage: 0 },
        keys: { total: 0, api: 0, sessions: 0 },
        hits: { total: 0, misses: 0, hitRate: 0 },
      };
    }
  }

  // Get cache status
  getStatus() {
    return {
      enabled: this.isRedisEnabled,
      connected: this.redis?.status === 'ready',
      url: env.REDIS_URL ? '***' : null,
    };
  }

  // Private helper methods
  private generateApiCacheKey(endpoint: string, params: Record<string, any>): string {
    const paramsStr = JSON.stringify(params);
    const paramsHash = this.hashParams(params);
    return `api:${endpoint}:${paramsHash}`;
  }

  private hashParams(params: Record<string, any>): string {
    const str = JSON.stringify(params, Object.keys(params).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private isCacheValid(cacheData: any): boolean {
    const now = Date.now();
    const age = now - cacheData.timestamp;
    return age < (cacheData.ttl * 1000);
  }

  private async trackCacheDependency(endpoint: string, cacheKey: string): Promise<void> {
    if (!this.redis) return;

    try {
      // Track which endpoints depend on which entities
      const dependencyKey = `dependencies:${endpoint}`;
      await this.redis.sadd(dependencyKey, cacheKey);
      await this.redis.expire(dependencyKey, 3600); // 1 hour
    } catch (error) {
      // Non-critical error, log but don't fail
      logger.warn({ error, endpoint }, 'Failed to track cache dependency');
    }
  }

  private getRelatedEntities(entityType: string): string[] {
    const relations: Record<string, string[]> = {
      service: ['cases', 'reviews'],
      case: ['services', 'reviews'],
      review: ['services', 'cases'],
      user: ['sessions'],
    };

    return relations[entityType] || [];
  }

  private async warmStaticData(): Promise<number> {
    // Implementation for warming static data like configurations, settings
    return 0;
  }

  private async warmPopularQueries(): Promise<number> {
    // Implementation for warming popular API queries
    return 0;
  }

  private async warmUserSessions(): Promise<number> {
    // Implementation for warming active user sessions
    return 0;
  }
}

export class BackupService {
  private readonly backupDir: string;
  private readonly retentionDays: number;

  constructor() {
    this.backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');
    this.ensureBackupDir();
  }

  private async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error({ error, backupDir: this.backupDir }, 'Failed to create backup directory');
    }
  }

  // Create database backup
  async createBackup(options: { type?: 'full' | 'incremental' } = {}): Promise<{
    success: boolean;
    backupPath?: string;
    error?: string;
    size?: number;
  }> {
    const { type = 'full' } = options;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${type}-${timestamp}.sql`;
    const backupPath = path.join(this.backupDir, filename);

    try {
      // Parse DATABASE_URL to get connection details
      const dbUrl = env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      // Extract connection info from DATABASE_URL
      const url = new URL(dbUrl);
      const host = url.hostname;
      const port = url.port || '5432';
      const database = url.pathname.substring(1);
      const username = url.username;
      const password = url.password;

      // Create pg_dump command
      const pgDumpCmd = [
        'pg_dump',
        `--host=${host}`,
        `--port=${port}`,
        `--username=${username}`,
        `--dbname=${database}`,
        '--no-password',
        '--format=custom',
        '--verbose',
        '--no-owner',
        '--no-privileges',
        `--file=${backupPath}`,
      ];

      if (type === 'incremental') {
        // For incremental, we could add --data-only or other options
        pgDumpCmd.push('--data-only');
      }

      // Set password environment variable
      const env = { PGPASSWORD: password };

      logger.info({ 
        type, 
        backupPath, 
        database,
        host,
        port 
      }, 'Starting database backup');

      return new Promise((resolve) => {
        const process = exec(pgDumpCmd.join(' '), { env });

        process.on('exit', async (code) => {
          if (code === 0) {
            try {
              const stats = await fs.stat(backupPath);
              logger.info({ 
                type, 
                backupPath, 
                size: stats.size 
              }, 'Database backup completed successfully');

              resolve({
                success: true,
                backupPath,
                size: stats.size,
              });
            } catch (error) {
              resolve({
                success: false,
                error: 'Failed to get backup file stats',
              });
            }
          } else {
            logger.error({ 
              code, 
              type, 
              backupPath 
            }, 'Database backup failed');
            
            resolve({
              success: false,
              error: `Backup process exited with code ${code}`,
            });
          }
        });

        process.on('error', (error) => {
          logger.error({ error, type }, 'Database backup process error');
          resolve({
            success: false,
            error: error.message,
          });
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error, type }, 'Failed to create database backup');
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Restore from backup
  async restoreBackup(backupPath: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify backup file exists
      await fs.access(backupPath);

      // Parse DATABASE_URL to get connection details
      const dbUrl = env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL not configured');
      }

      const url = new URL(dbUrl);
      const host = url.hostname;
      const port = url.port || '5432';
      const database = url.pathname.substring(1);
      const username = url.username;
      const password = url.password;

      // Create pg_restore command
      const pgRestoreCmd = [
        'pg_restore',
        `--host=${host}`,
        `--port=${port}`,
        `--username=${username}`,
        `--dbname=${database}`,
        '--no-password',
        '--clean',
        '--if-exists',
        '--verbose',
        backupPath,
      ];

      const env = { PGPASSWORD: password };

      logger.info({ backupPath, database, host }, 'Starting database restore');

      return new Promise((resolve) => {
        const process = exec(pgRestoreCmd.join(' '), { env });

        process.on('exit', (code) => {
          if (code === 0) {
            logger.info({ backupPath }, 'Database restore completed successfully');
            resolve({ success: true });
          } else {
            logger.error({ code, backupPath }, 'Database restore failed');
            resolve({
              success: false,
              error: `Restore process exited with code ${code}`,
            });
          }
        });

        process.on('error', (error) => {
          logger.error({ error, backupPath }, 'Database restore process error');
          resolve({
            success: false,
            error: error.message,
          });
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error, backupPath }, 'Failed to restore database backup');
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // List backups
  async listBackups(): Promise<Array<{
    filename: string;
    path: string;
    size: number;
    createdAt: Date;
    type: string;
  }>> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = [];

      for (const file of files) {
        if (file.startsWith('backup-') && file.endsWith('.sql')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          
          // Extract type from filename
          const typeMatch = file.match(/backup-(full|incremental)-/);
          const type = typeMatch ? typeMatch[1] : 'unknown';

          backupFiles.push({
            filename: file,
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            type,
          });
        }
      }

      // Sort by creation date (newest first)
      return backupFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      logger.error({ error }, 'Failed to list backups');
      return [];
    }
  }

  // Clean old backups
  async cleanOldBackups(): Promise<{
    deleted: number;
    errors: string[];
  }> {
    const backups = await this.listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const deleted = 0;
    const errors: string[] = [];

    for (const backup of backups) {
      if (backup.createdAt < cutoffDate) {
        try {
          await fs.unlink(backup.path);
          logger.info({ filename: backup.filename }, 'Deleted old backup');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to delete ${backup.filename}: ${errorMessage}`);
          logger.error({ error, filename: backup.filename }, 'Failed to delete old backup');
        }
      }
    }

    return { deleted, errors };
  }

  // Get backup status
  async getBackupStatus() {
    const backups = await this.listBackups();
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const latestBackup = backups[0];

    return {
      backupDir: this.backupDir,
      totalBackups: backups.length,
      totalSize,
      retentionDays: this.retentionDays,
      latestBackup: latestBackup ? {
        filename: latestBackup.filename,
        createdAt: latestBackup.createdAt,
        size: latestBackup.size,
        type: latestBackup.type,
      } : null,
    };
  }
}

// Export singleton instances
export const cacheService = new CacheService();
export const backupService = new BackupService();