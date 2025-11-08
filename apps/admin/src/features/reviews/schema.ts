import { z } from 'zod';

import type { ReviewType, VideoProvider } from '../../api/types';

export const reviewTypes = ['TEXT', 'VIDEO'] as const satisfies ReadonlyArray<ReviewType>;
export const videoProviders = ['YOUTUBE', 'VIMEO', 'HOSTED'] as const satisfies ReadonlyArray<VideoProvider>;

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value && value.trim().length > 0 ? value.trim() : undefined));

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (typeof value === 'number') return value;
    if (!value) return undefined;
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return undefined;
    return parsed;
  })
  .refine((value) => value === undefined || (value >= 0 && value <= 5), {
    message: 'Оценка от 0 до 5',
  });

export const reviewFormSchema = z.object({
  authorName: z.string().min(1, 'Укажите имя'),
  authorTitle: optionalString,
  company: optionalString,
  quote: optionalString,
  reviewType: z.enum(reviewTypes),
  videoUrl: optionalString,
  videoProvider: z
    .enum(videoProviders)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  rating: optionalNumber,
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  caseId: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
