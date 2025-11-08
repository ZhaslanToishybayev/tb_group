import { ServiceCategory } from '@prisma/client';
import { z } from 'zod';

export const contactCreateSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  serviceInterest: z.nativeEnum(ServiceCategory).optional(),
  recaptchaToken: z.string().optional(),
});

export const contactResponseSchema = z.object({
  status: z.enum(['queued', 'completed', 'error']),
  contactRequestId: z.string(),
  leadId: z.string().nullable(),
});

export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
