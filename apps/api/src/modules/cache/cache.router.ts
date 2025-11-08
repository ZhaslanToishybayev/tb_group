import { Router } from 'express';

import { cacheService, backupService } from './cache.service';
import asyncHandler from '../../utils/async-handler';
import { validateBody } from '../../utils/validate';
import { ApiError } from '../../middleware/error-handler';
import { z } from 'zod';

const router = Router();

// Cache management endpoints

// Get cache status
router.get(
  '/cache/status',
  asyncHandler(async (_req, res) => {
    const status = cacheService.getStatus();
    res.json({ data: status });
  }),
);

// Get cache value
router.get(
  '/cache/:key',
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const value = await cacheService.get(key);
    res.json({ data: { key, value, exists: value !== null } });
  }),
);

// Set cache value
router.post(
  '/cache/:key',
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value, ttl = 3600 } = req.body;
    
    if (value === undefined) {
      throw new ApiError('MISSING_VALUE', 400, 'Value is required');
    }

    const success = await cacheService.set(key, value, ttl);
    res.json({ data: { key, success, ttl } });
  }),
);

// Delete cache value
router.delete(
  '/cache/:key',
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const success = await cacheService.del(key);
    res.json({ data: { key, success } });
  }),
);

// Invalidate cache by pattern
router.post(
  '/cache/invalidate',
  asyncHandler(async (req, res) => {
    const { pattern } = req.body;
    
    if (!pattern) {
      throw new ApiError('MISSING_PATTERN', 400, 'Pattern is required');
    }

    const deletedCount = await cacheService.invalidatePattern(pattern);
    res.json({ data: { pattern, deletedCount } });
  }),
);

// Flush all cache
router.post(
  '/cache/flush',
  asyncHandler(async (_req, res) => {
    const success = await cacheService.flushAll();
    res.json({ data: { success } });
  }),
);

// Get cache statistics
router.get(
  '/cache/stats',
  asyncHandler(async (_req, res) => {
    const stats = await cacheService.getCacheStats();
    res.json({ data: stats });
  }),
);

// Cache API response
router.post(
  '/cache/api/:endpoint',
  asyncHandler(async (req, res) => {
    const { endpoint } = req.params;
    const { params, response, ttl = 3600 } = req.body;

    if (!params || response === undefined) {
      throw new ApiError('MISSING_DATA', 400, 'Params and response are required');
    }

    const success = await cacheService.cacheApiResponse(endpoint, params, response, ttl);
    res.json({ data: { endpoint, success, ttl } });
  }),
);

// Get cached API response
router.get(
  '/cache/api/:endpoint',
  asyncHandler(async (req, res) => {
    const { endpoint } = req.params;
    const params = req.query;

    const response = await cacheService.getApiResponse(endpoint, params as Record<string, any>);
    res.json({ data: { endpoint, params, response, exists: response !== null } });
  }),
);

// Intelligent cache invalidation
router.post(
  '/cache/invalidate/related',
  asyncHandler(async (req, res) => {
    const { entityType, entityId } = req.body;

    if (!entityType) {
      throw new ApiError('MISSING_ENTITY_TYPE', 400, 'Entity type is required');
    }

    const invalidatedCount = await cacheService.invalidateRelatedCache(entityType, entityId);
    res.json({ data: { entityType, entityId, invalidatedCount } });
  }),
);

// Session management
router.post(
  '/session/:sessionId',
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { data, ttl = 86400 } = req.body;

    if (!data) {
      throw new ApiError('MISSING_SESSION_DATA', 400, 'Session data is required');
    }

    const success = await cacheService.setSession(sessionId, data, ttl);
    res.json({ data: { sessionId, success, ttl } });
  }),
);

router.get(
  '/session/:sessionId',
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const data = await cacheService.getSession(sessionId);
    res.json({ data: { sessionId, data, exists: data !== null } });
  }),
);

router.delete(
  '/session/:sessionId',
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const success = await cacheService.deleteSession(sessionId);
    res.json({ data: { sessionId, success } });
  }),
);

// Cache warming
router.post(
  '/cache/warm',
  asyncHandler(async (_req, res) => {
    const result = await cacheService.warmCache();
    res.json({ data: result });
  }),
);

// Backup management endpoints

// Create backup
router.post(
  '/backup/create',
  asyncHandler(async (req, res) => {
    const { type = 'full' } = req.body;
    
    if (!['full', 'incremental'].includes(type)) {
      throw new ApiError('INVALID_TYPE', 400, 'Type must be "full" or "incremental"');
    }

    const result = await backupService.createBackup({ type });
    res.json({ data: result });
  }),
);

// Restore from backup
router.post(
  '/backup/restore',
  asyncHandler(async (req, res) => {
    const { backupPath } = req.body;
    
    if (!backupPath) {
      throw new ApiError('MISSING_PATH', 400, 'Backup path is required');
    }

    const result = await backupService.restoreBackup(backupPath);
    res.json({ data: result });
  }),
);

// List backups
router.get(
  '/backup/list',
  asyncHandler(async (_req, res) => {
    const backups = await backupService.listBackups();
    res.json({ data: { backups } });
  }),
);

// Get backup status
router.get(
  '/backup/status',
  asyncHandler(async (_req, res) => {
    const status = await backupService.getBackupStatus();
    res.json({ data: status });
  }),
);

// Clean old backups
router.post(
  '/backup/cleanup',
  asyncHandler(async (_req, res) => {
    const result = await backupService.cleanOldBackups();
    res.json({ data: result });
  }),
);

// Download backup file
router.get(
  '/backup/download/:filename',
  asyncHandler(async (req, res) => {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename.startsWith('backup-') || !filename.endsWith('.sql')) {
      throw new ApiError('INVALID_FILENAME', 400, 'Invalid backup filename');
    }

    const backups = await backupService.listBackups();
    const backup = backups.find(b => b.filename === filename);
    
    if (!backup) {
      throw new ApiError('BACKUP_NOT_FOUND', 404, 'Backup file not found');
    }

    res.download(backup.path, filename);
  }),
);

export default router;