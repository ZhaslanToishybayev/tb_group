import { z } from 'zod';

import type { MediaType } from '../../api/types';

export const mediaTypes = ['IMAGE', 'VIDEO', 'DOCUMENT'] as const satisfies ReadonlyArray<MediaType>;

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
    return Number.isNaN(parsed) ? undefined : parsed;
  });

export const mediaFormSchema = z.object({
  url: z.string().url('Введите корректный URL'),
  type: z.enum(mediaTypes),
  altText: optionalString,
  mimeType: optionalString,
  size: optionalNumber,
  metadata: optionalString,
  caseId: optionalString,
  reviewId: optionalString,
});

export type MediaFormValues = z.infer<typeof mediaFormSchema>;
