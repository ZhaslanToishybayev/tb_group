import { Router } from 'express';

import { EmailService } from './email.service';
import asyncHandler from '../../utils/async-handler';
import { validateBody } from '../../utils/validate';
import { ApiError } from '../../middleware/error-handler';
import { 
  emailTestSchema, 
  emailResendSchema 
} from './email.schemas';

const router = Router();

// Get email logs
router.get(
  '/logs',
  asyncHandler(async (req, res) => {
    const { page, limit, status, type } = req.query;
    
    const result = await EmailService.getEmailLogs({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      status: status as string,
      type: type as string,
    });

    res.json({
      data: result.logs,
      pagination: result.pagination,
    });
  }),
);

// Get email statistics
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const stats = await EmailService.getEmailStats();
    res.json({ data: stats });
  }),
);

// Get email templates
router.get(
  '/templates',
  asyncHandler(async (req, res) => {
    const templates = await EmailService.getEmailTemplates();
    res.json({ data: templates });
  }),
);

// Test email template
router.post(
  '/test',
  validateBody(emailTestSchema),
  asyncHandler(async (req, res) => {
    const result = await EmailService.testEmailTemplate(req.body);
    
    res.json({
      data: {
        success: result.success,
        provider: result.provider,
        message: result.success 
          ? `Test email sent successfully via ${result.provider}` 
          : `Failed to send test email: ${result.error}`,
      },
    });
  }),
);

// Resend failed email
router.post(
  '/resend',
  validateBody(emailResendSchema),
  asyncHandler(async (req, res) => {
    const result = await EmailService.resendEmail(req.body);
    
    res.json({
      data: {
        success: result.success,
        provider: result.provider,
        message: result.success 
          ? `Email resent successfully via ${result.provider}` 
          : `Failed to resend email: ${result.error}`,
      },
    });
  }),
);

// Delete email log
router.delete(
  '/logs/:logId',
  asyncHandler(async (req, res) => {
    const { logId } = req.params;
    const result = await EmailService.deleteEmailLog(logId);
    
    res.json({ data: result });
  }),
);

// Get queue status
router.get(
  '/queue/status',
  asyncHandler(async (req, res) => {
    const status = await EmailService.getQueueStatus();
    res.json({ data: status });
  }),
);

export default router;