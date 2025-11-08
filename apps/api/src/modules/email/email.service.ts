import prisma from '../../lib/prisma';
import { logger } from '../../middleware/logger';
import { sendTemplatedEmail, sendEmailWithFallback } from '../../integrations/mailer';
import type { 
  EmailTemplateCreate, 
  EmailTemplateUpdate, 
  EmailTest, 
  EmailResend 
} from './email.schemas';

export class EmailService {
  // Get email notification logs
  static async getEmailLogs(options: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  } = {}) {
    const { page = 1, limit = 20, status, type } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (type) where.type = type;

    const [logs, total] = await Promise.all([
      prisma.emailNotificationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contactRequest: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.emailNotificationLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get email statistics
  static async getEmailStats() {
    const [total, sent, failed, byType, byProvider] = await Promise.all([
      prisma.emailNotificationLog.count(),
      prisma.emailNotificationLog.count({ where: { status: 'SENT' } }),
      prisma.emailNotificationLog.count({ where: { status: 'FAILED' } }),
      prisma.emailNotificationLog.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      prisma.emailNotificationLog.groupBy({
        by: ['provider'],
        _count: { id: true },
        where: { provider: { not: null } },
      }),
    ]);

    const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

    return {
      total,
      sent,
      failed,
      successRate,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.id,
      })),
      byProvider: byProvider.map(item => ({
        provider: item.provider,
        count: item._count.id,
      })),
    };
  }

  // Resend failed email
  static async resendEmail(data: EmailResend) {
    const log = await prisma.emailNotificationLog.findUnique({
      where: { id: data.logId },
      include: { contactRequest: true },
    });

    if (!log) {
      throw new Error('Email log not found');
    }

    if (log.status === 'SENT') {
      throw new Error('Email already sent successfully');
    }

    // Update log to pending
    await prisma.emailNotificationLog.update({
      where: { id: log.id },
      data: { status: 'PENDING' },
    });

    try {
      const payload = log.payload as any;
      const recipients = log.recipients.split(',').map(r => r.trim());

      const result = await sendEmailWithFallback(
        payload,
        { to: recipients },
        {
          contactRequestId: log.contactRequestId || undefined,
          type: log.type,
        }
      );

      return result;
    } catch (error) {
      await prisma.emailNotificationLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  // Test email template
  static async testEmailTemplate(data: EmailTest) {
    const result = await sendTemplatedEmail(
      data.templateId,
      data.data || {},
      { to: data.to },
      { type: 'test' }
    );

    return result;
  }

  // Get email templates (for future use - currently hardcoded)
  static async getEmailTemplates() {
    // In a real implementation, these would be stored in the database
    // For now, return the hardcoded templates from mailer.ts
    const templates = [
      {
        id: 'contact_request',
        name: 'Contact Request Notification',
        subject: 'TB Group: новая заявка от {{fullName}}',
        variables: ['fullName', 'email', 'phone', 'company', 'serviceInterest', 'message'],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'admin_alert',
        name: 'Admin Alert',
        subject: 'TB Group: {{alertType}} - {{subject}}',
        variables: ['alertType', 'subject', 'message', 'timestamp', 'component', 'actionUrl', 'actionText'],
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return templates;
  }

  // Delete email log
  static async deleteEmailLog(logId: string) {
    const log = await prisma.emailNotificationLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new Error('Email log not found');
    }

    await prisma.emailNotificationLog.delete({
      where: { id: logId },
    });

    return { success: true };
  }

  // Get email queue status (for future implementation)
  static async getQueueStatus() {
    const pending = await prisma.emailNotificationLog.count({
      where: { status: 'PENDING' },
    });

    const failed = await prisma.emailNotificationLog.count({
      where: { status: 'FAILED' },
    });

    const last24h = await prisma.emailNotificationLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      pending,
      failed,
      last24h,
      queueEnabled: process.env.EMAIL_QUEUE_ENABLED === 'true',
    };
  }
}