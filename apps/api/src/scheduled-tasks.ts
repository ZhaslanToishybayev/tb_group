import cron from 'node-cron';
import { backupService } from './modules/cache/cache.service';
import { logger } from './middleware/logger';
import env from './config/env';

class ScheduledTasks {
  private backupJob: cron.ScheduledTask | null = null;
  private cleanupJob: cron.ScheduledTask | null = null;

  constructor() {
    this.setupScheduledTasks();
  }

  private setupScheduledTasks() {
    // Backup schedule (default: daily at 2 AM)
    const backupSchedule = env.BACKUP_SCHEDULE || '0 2 * * *';
    
    if (env.BACKUP_ENABLED === 'true') {
      this.backupJob = cron.schedule(backupSchedule, async () => {
        logger.info('Starting scheduled database backup');
        
        try {
          const result = await backupService.createBackup({ type: 'full' });
          
          if (result.success) {
            logger.info({ 
              backupPath: result.backupPath,
              size: result.size 
            }, 'Scheduled backup completed successfully');
          } else {
            logger.error({ error: result.error }, 'Scheduled backup failed');
          }
        } catch (error) {
          logger.error({ error }, 'Scheduled backup failed with exception');
        }
      }, {
        scheduled: true,
        timezone: 'Asia/Almaty',
      });

      logger.info({ schedule: backupSchedule }, 'Backup job scheduled');
    } else {
      logger.info('Backup scheduling is disabled');
    }

    // Cleanup schedule (default: weekly on Sunday at 3 AM)
    const cleanupSchedule = env.CLEANUP_SCHEDULE || '0 3 * * 0';
    
    this.cleanupJob = cron.schedule(cleanupSchedule, async () => {
      logger.info('Starting scheduled backup cleanup');
      
      try {
        const result = await backupService.cleanOldBackups();
        
        logger.info({ 
          deleted: result.deleted,
          errors: result.errors.length 
        }, 'Scheduled cleanup completed');
        
        if (result.errors.length > 0) {
          logger.warn({ errors: result.errors }, 'Cleanup had errors');
        }
      } catch (error) {
        logger.error({ error }, 'Scheduled cleanup failed');
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Almaty',
    });

    logger.info({ schedule: cleanupSchedule }, 'Cleanup job scheduled');
  }

  // Graceful shutdown
  stop() {
    if (this.backupJob) {
      this.backupJob.stop();
      logger.info('Backup job stopped');
    }
    
    if (this.cleanupJob) {
      this.cleanupJob.stop();
      logger.info('Cleanup job stopped');
    }
  }

  // Manual backup trigger
  async triggerBackup(type: 'full' | 'incremental' = 'full') {
    logger.info({ type }, 'Manual backup triggered');
    
    try {
      const result = await backupService.createBackup({ type });
      
      if (result.success) {
        logger.info({ 
          backupPath: result.backupPath,
          size: result.size 
        }, 'Manual backup completed successfully');
      } else {
        logger.error({ error: result.error }, 'Manual backup failed');
      }
      
      return result;
    } catch (error) {
      logger.error({ error }, 'Manual backup failed with exception');
      throw error;
    }
  }

  // Manual cleanup trigger
  async triggerCleanup() {
    logger.info('Manual cleanup triggered');
    
    try {
      const result = await backupService.cleanOldBackups();
      
      logger.info({ 
        deleted: result.deleted,
        errors: result.errors.length 
      }, 'Manual cleanup completed');
      
      return result;
    } catch (error) {
      logger.error({ error }, 'Manual cleanup failed');
      throw error;
    }
  }
}

// Export singleton instance
export const scheduledTasks = new ScheduledTasks();

// Graceful shutdown on process termination
process.on('SIGINT', () => {
  logger.info('Received SIGINT, stopping scheduled tasks');
  scheduledTasks.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, stopping scheduled tasks');
  scheduledTasks.stop();
  process.exit(0);
});