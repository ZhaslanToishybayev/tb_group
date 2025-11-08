import { MediaType } from '@prisma/client';
import { z } from 'zod';

export const mediaEntitySchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.nativeEnum(MediaType),
  altText: z.string().nullable(),
  mimeType: z.string().nullable(),
  size: z.number().nullable(),
  metadata: z.unknown().nullable(),
  caseId: z.string().nullable(),
  reviewId: z.string().nullable(),
  createdAt: z.string(),
});

const base = z.object({
  url: z.string().url(),
  type: z.nativeEnum(MediaType),
  altText: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().optional(),
  metadata: z.unknown().optional(),
  caseId: z.string().optional().nullable(),
  reviewId: z.string().optional().nullable(),
});

export const mediaCreateSchema = base;

export const mediaUpdateSchema = base.partial();

export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;
export type MediaEntity = z.infer<typeof mediaEntitySchema>;
