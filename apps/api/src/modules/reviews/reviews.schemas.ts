import { ReviewType, VideoProvider } from '@prisma/client';
import { z } from 'zod';

export const reviewEntitySchema = z.object({
  id: z.string(),
  authorName: z.string(),
  authorTitle: z.string().nullable(),
  company: z.string().nullable(),
  quote: z.string().nullable(),
  reviewType: z.nativeEnum(ReviewType),
  videoUrl: z.string().nullable(),
  videoProvider: z.nativeEnum(VideoProvider).nullable(),
  rating: z.number().nullable(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  caseId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const reviewCreateSchema = z.object({
  authorName: z.string().min(1),
  authorTitle: z.string().optional(),
  company: z.string().optional(),
  quote: z.string().optional(),
  reviewType: z.nativeEnum(ReviewType).default(ReviewType.TEXT),
  videoUrl: z.string().url().optional(),
  videoProvider: z.nativeEnum(VideoProvider).optional(),
  rating: z.number().int().min(0).max(5).optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  caseId: z.string().optional(),
});

export const reviewUpdateSchema = reviewCreateSchema.partial();

export const reviewQuerySchema = z.object({
  caseId: z.string().optional(),
  isPublished: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().optional()),
  isFeatured: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return val;
  }, z.boolean().optional()),
});

export type ReviewEntity = z.infer<typeof reviewEntitySchema>;
