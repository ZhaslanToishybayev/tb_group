import nodemailer from 'nodemailer';

import env from '../config/env';
import prisma from '../lib/prisma';
import { logger } from '../middleware/logger';

interface SMTPProvider {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from?: string;
}

const getSMTPProviders = (): SMTPProvider[] => {
  const providers: SMTPProvider[] = [];
  
  // Primary SMTP provider
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    providers.push({
      name: 'primary',
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ? parseInt(env.SMTP_PORT) : 587,
      secure: env.SMTP_SECURE === 'true',
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      from: env.SMTP_FROM,
    });
  }
  
  // Backup SMTP provider
  if (env.SMTP_BACKUP_HOST && env.SMTP_BACKUP_USER && env.SMTP_BACKUP_PASS) {
    providers.push({
      name: 'backup',
      host: env.SMTP_BACKUP_HOST,
      port: env.SMTP_BACKUP_PORT ? parseInt(env.SMTP_BACKUP_PORT) : 587,
      secure: env.SMTP_BACKUP_SECURE === 'true',
      user: env.SMTP_BACKUP_USER,
      pass: env.SMTP_BACKUP_PASS,
      from: env.SMTP_BACKUP_FROM,
    });
  }
  
  return providers;
};

const EMAIL_ENABLED = getSMTPProviders().length > 0 && !env.EMAIL_USE_STUB;

const createTransporter = (provider: SMTPProvider) => {
  return nodemailer.createTransport({
    host: provider.host,
    port: provider.port,
    secure: provider.secure,
    auth: {
      user: provider.user,
      pass: provider.pass,
    },
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
  });
};

export type EmailPayload = {
  subject: string;
  html: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
};

export type EmailOptions = {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  priority?: 'high' | 'normal' | 'low';
  headers?: Record<string, string>;
};

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  enabled: boolean;
}

// Email Templates
const templates: Record<string, EmailTemplate> = {
  contact_request: {
    id: 'contact_request',
    name: 'Contact Request Notification',
    subject: 'TB Group: новая заявка от {{fullName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Новая заявка с сайта</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Имя:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{fullName}}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{email}}</td></tr>
          {{#phone}}<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Телефон:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{phone}}</td></tr>{{/phone}}
          {{#company}}<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Компания:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{company}}</td></tr>{{/company}}
          {{#serviceInterest}}<tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Интерес:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{serviceInterest}}</td></tr>{{/serviceInterest}}
        </table>
        {{#message}}<div style="margin-top: 20px;">
          <h3>Сообщение:</h3>
          <p style="background: #f9fafb; padding: 15px; border-left: 4px solid #2563eb;">{{message}}</p>
        </div>{{/message}}
        <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Это сообщение было отправлено через контактную форму на сайте TB Group<br>
            <a href="https://tb-group.kz" style="color: #2563eb;">tb-group.kz</a>
          </p>
        </div>
      </div>
    `,
    textContent: `
Новая заявка с сайта TB Group

Имя: {{fullName}}
Email: {{email}}
{{#phone}}Телефон: {{phone}}{{/phone}}
{{#company}}Компания: {{company}}{{/company}}
{{#serviceInterest}}Интерес: {{serviceInterest}}{{/serviceInterest}}

{{#message}}Сообщение:
{{message}}{{/message}}

---
Это сообщение было отправлено через контактную форму на сайте TB Group
https://tb-group.kz
    `,
    variables: ['fullName', 'email', 'phone', 'company', 'serviceInterest', 'message'],
    enabled: true,
  },
  admin_alert: {
    id: 'admin_alert',
    name: 'Admin Alert',
    subject: 'TB Group: {{alertType}} - {{subject}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-top: 0;">🚨 {{alertType}}</h2>
          <p style="margin: 10px 0;"><strong>Время:</strong> {{timestamp}}</p>
          <p style="margin: 10px 0;"><strong>Компонент:</strong> {{component}}</p>
        </div>
        <h3>{{subject}}</h3>
        <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
          {{message}}
        </div>
        {{#actionUrl}}<a href="{{actionUrl}}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">{{actionText}}</a>{{/actionUrl}}
      </div>
    `,
    variables: ['alertType', 'subject', 'message', 'timestamp', 'component', 'actionUrl', 'actionText'],
    enabled: true,
  },
};

const renderTemplate = (template: EmailTemplate, data: Record<string, any>): EmailPayload => {
  let subject = template.subject;
  let htmlContent = template.htmlContent;
  let textContent = template.textContent;

  // Simple template variable replacement
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, String(value || ''));
    htmlContent = htmlContent.replace(regex, String(value || ''));
    if (textContent) {
      textContent = textContent.replace(regex, String(value || ''));
    }

    // Handle conditional blocks {{#variable}}content{{/variable}}
    const conditionalRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
    htmlContent = htmlContent.replace(conditionalRegex, value ? '$1' : '');
    if (textContent) {
      textContent = textContent.replace(conditionalRegex, value ? '$1' : '');
    }
  });

  return {
    subject,
    html: htmlContent,
    text: textContent,
  };
};

export const sendEmailWithFallback = async (
  payload: EmailPayload,
  options: EmailOptions = {},
  metadata: { contactRequestId?: string; type?: string } = {},
): Promise<{ success: boolean; provider?: string; error?: string }> => {
  const recipients = options.to || env.EMAIL_NOTIFICATIONS_TO;
  if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
    logger.warn('No email recipients configured');
    return { success: false, error: 'No recipients configured' };
  }

  const providers = getSMTPProviders();
  if (!EMAIL_ENABLED || providers.length === 0) {
    logger.info({ payload, recipients, metadata }, 'Email stub enabled; notification not sent');
    return { success: true, provider: 'stub' };
  }

  // Create log entry
  const log = await prisma.emailNotificationLog.create({
    data: {
      contactRequestId: metadata.contactRequestId,
      recipients: Array.isArray(recipients) ? recipients.join(',') : recipients,
      subject: payload.subject,
      payload,
      type: metadata.type || 'notification',
    },
  });

  // Try providers in order (primary, then backup)
  for (const provider of providers) {
    try {
      const transporter = createTransporter(provider);
      
      const mailOptions = {
        from: provider.from || env.SMTP_FROM,
        to: recipients,
        cc: options.cc,
        bcc: options.bcc,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        priority: options.priority,
        headers: options.headers,
      };

      await transporter.sendMail(mailOptions);
      
      await prisma.emailNotificationLog.update({
        where: { id: log.id },
        data: {
          status: 'SENT',
          attempts: { increment: 1 },
          provider: provider.name,
        },
      });

      logger.info({ 
        provider: provider.name, 
        recipients, 
        subject: payload.subject,
        metadata 
      }, 'Email sent successfully');

      return { success: true, provider: provider.name };
      
    } catch (error) {
      logger.warn({ 
        provider: provider.name, 
        error: error instanceof Error ? error.message : 'Unknown error',
        recipients,
        metadata
      }, `Failed to send email via ${provider.name} provider`);
      
      // If this is the last provider, mark as failed
      if (provider === providers[providers.length - 1]) {
        await prisma.emailNotificationLog.update({
          where: { id: log.id },
          data: {
            status: 'FAILED',
            attempts: { increment: 1 },
            lastError: error instanceof Error ? error.message : 'Unknown error',
          },
        });
        
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          provider: provider.name 
        };
      }
    }
  }

  return { success: false, error: 'All providers failed' };
};

export const sendNotificationEmail = async (
  contactRequestId: string,
  payload: EmailPayload,
  options: EmailOptions = {},
) => {
  return sendEmailWithFallback(payload, options, { 
    contactRequestId, 
    type: 'contact_request' 
  });
};

// Template-based email sending
export const sendTemplatedEmail = async (
  templateId: string,
  data: Record<string, any>,
  options: EmailOptions = {},
  metadata: { contactRequestId?: string; type?: string } = {},
) => {
  const template = templates[templateId];
  if (!template || !template.enabled) {
    logger.warn({ templateId }, 'Template not found or disabled');
    return { success: false, error: 'Template not found or disabled' };
  }

  const payload = renderTemplate(template, data);
  return sendEmailWithFallback(payload, options, metadata);
};

// Admin alert function
export const sendAdminAlert = async (
  alertType: string,
  subject: string,
  message: string,
  options: {
    component?: string;
    actionUrl?: string;
    actionText?: string;
    metadata?: Record<string, any>;
  } = {},
) => {
  const data = {
    alertType,
    subject,
    message,
    timestamp: new Date().toISOString(),
    component: options.component || 'Unknown',
    actionUrl: options.actionUrl,
    actionText: options.actionText || 'Просмотреть',
  };

  return sendTemplatedEmail('admin_alert', data, {
    to: env.EMAIL_NOTIFICATIONS_TO,
    priority: 'high',
  }, {
    type: 'admin_alert',
    ...options.metadata,
  });
};

export default sendNotificationEmail;
