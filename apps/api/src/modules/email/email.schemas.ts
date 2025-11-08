import { z } from 'zod';

export const emailTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().optional(),
  variables: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
});

export const emailTemplateUpdateSchema = emailTemplateCreateSchema.partial();

export const emailTestSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  to: z.string().email('Valid email is required'),
  data: z.record(z.any()).optional(),
});

export const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.number().int().min(1).max(65535).default(587),
  smtpSecure: z.boolean().default(false),
  smtpUser: z.string().min(1, 'SMTP user is required'),
  smtpPass: z.string().min(1, 'SMTP password is required'),
  smtpFrom: z.string().email('Valid from email is required'),
  emailNotificationsTo: z.string().min(1, 'Notification recipients are required'),
  emailUseStub: z.boolean().default(true),
  // Backup SMTP settings
  smtpBackupHost: z.string().optional(),
  smtpBackupPort: z.number().int().min(1).max(65535).optional(),
  smtpBackupSecure: z.boolean().optional(),
  smtpBackupUser: z.string().optional(),
  smtpBackupPass: z.string().optional(),
  smtpBackupFrom: z.string().email().optional(),
});

export const emailResendSchema = z.object({
  logId: z.string().min(1, 'Log ID is required'),
});

export type EmailTemplateCreate = z.infer<typeof emailTemplateCreateSchema>;
export type EmailTemplateUpdate = z.infer<typeof emailTemplateUpdateSchema>;
export type EmailTest = z.infer<typeof emailTestSchema>;
export type EmailSettings = z.infer<typeof emailSettingsSchema>;
export type EmailResend = z.infer<typeof emailResendSchema>;