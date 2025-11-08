import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || /^https?:\/\//.test(value), 'Введите корректный URL');

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (typeof value === 'number') return value;
    if (!value) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  });

export const serviceFormSchema = z.object({
  slug: z.string().trim().min(1, 'Укажите slug'),
  title: z.string().min(1, 'Укажите название'),
  summary: z.string().min(1, 'Краткое описание обязательно'),
  description: z.string().optional(),
  heroImageUrl: optionalUrl,
  iconUrl: optionalUrl,
  order: optionalNumber,
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
