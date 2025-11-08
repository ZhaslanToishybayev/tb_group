import { BannerPlacement } from '@prisma/client';
import { z } from 'zod';

export const bannerEntitySchema = z.object({
  id: z.string(),
  placement: z.nativeEnum(BannerPlacement),
  title: z.string(),
  subtitle: z.string().nullable(),
  ctaLabel: z.string().nullable(),
  ctaLink: z.string().nullable(),
  serviceId: z.string().nullable(),
  order: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const bannerBaseSchema = z.object({
  placement: z.nativeEnum(BannerPlacement),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaLink: z.string().url().optional(),
  serviceId: z.string().optional(),
  mediaId: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const bannerCreateSchema = bannerBaseSchema;

export const bannerUpdateSchema = bannerBaseSchema.extend({
  mediaId: z.string().nullable().optional(),
}).partial();

export type BannerEntity = z.infer<typeof bannerEntitySchema>;
