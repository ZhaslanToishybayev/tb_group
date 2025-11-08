import { z } from 'zod';

import type { ServiceCategory } from '../../api/types';

export const serviceCategories = ['MY_SKLAD', 'BITRIX24', 'TELEPHONY', 'OTHER'] as const satisfies ReadonlyArray<ServiceCategory>;

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined));

const optionalUrl = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  .refine((value) => !value || /^https?:\/\//.test(value), {
    message: 'Введите корректный URL',
  });

export const caseFormSchema = z.object({
  slug: z.string().min(1, 'Укажите slug'),
  projectTitle: z.string().min(1, 'Название кейса обязательно'),
  clientName: z.string().min(1, 'Укажите заказчика'),
  summary: z.string().min(1, 'Краткое описание обязательно'),
  industry: optionalString,
  challenge: optionalString,
  solution: optionalString,
  results: optionalString,
  metrics: optionalString,
  category: z.enum(serviceCategories, {
    errorMap: () => ({ message: 'Выберите категорию' }),
  }),
  serviceId: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
  heroImageUrl: optionalUrl,
  videoUrl: optionalUrl,
  published: z.boolean().default(true),
  publishedAt: optionalString,
});

export type CaseFormValues = z.infer<typeof caseFormSchema>;
