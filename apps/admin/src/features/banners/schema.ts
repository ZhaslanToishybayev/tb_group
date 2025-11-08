import { z } from 'zod';

import type { BannerPlacement } from '../../api/types';

export const bannerPlacements = ['HOME_HERO', 'CTA_PRIMARY', 'CTA_SECONDARY'] as const satisfies ReadonlyArray<BannerPlacement>;

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

const optionalNumber = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (typeof value === 'number') return value;
    if (!value) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  });

export const bannerFormSchema = z.object({
  placement: z.enum(bannerPlacements),
  title: z.string().min(1, 'Укажите заголовок'),
  subtitle: optionalString,
  ctaLabel: optionalString,
  ctaLink: optionalUrl,
  serviceId: optionalString,
  mediaId: optionalString,
  order: optionalNumber,
  isActive: z.boolean().default(true),
});

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
