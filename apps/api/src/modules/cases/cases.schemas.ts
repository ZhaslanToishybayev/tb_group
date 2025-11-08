import { ServiceCategory } from '@prisma/client';
import { z } from 'zod';

const optionalTrimmedString = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().min(1))
  .optional();

export const caseMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const caseMetricsSchema = z.array(caseMetricSchema);

export const caseMediaSchema = z.object({
  id: z.string(),
  url: z.string(),
  type: z.string().nullable(),
  altText: z.string().nullable(),
  metadata: z.unknown().nullable(),
});

export const caseEntitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  projectTitle: z.string(),
  clientName: z.string(),
  industry: z.string().nullable(),
  summary: z.string(),
  challenge: z.string().nullable(),
  solution: z.string().nullable(),
  results: z.string().nullable(),
  metrics: caseMetricsSchema.nullable(),
  category: z.nativeEnum(ServiceCategory),
  serviceId: z.string().nullable(),
  heroImageUrl: z.string().nullable(),
  videoUrl: z.string().nullable(),
  published: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const caseCreateSchema = z.object({
  slug: z.string().min(1),
  projectTitle: z.string().min(1),
  clientName: z.string().min(1),
  industry: z.string().optional(),
  summary: z.string().min(1),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  results: z.string().optional(),
  metrics: z.unknown().optional(),
  category: z.nativeEnum(ServiceCategory),
  serviceId: z.string().optional(),
  heroImageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
});

export const caseUpdateSchema = caseCreateSchema.partial();

export const caseQuerySchema = z.object({
  category: z.nativeEnum(ServiceCategory).optional(),
  serviceId: z.string().optional(),
  published: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true';
    }
    return val;
  }, z.boolean().optional()),
  search: optionalTrimmedString,
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(24).default(12),
});

export const caseListItemSchema = caseEntitySchema.extend({
  media: z.array(caseMediaSchema),
});

export const caseListResponseSchema = z.object({
  items: z.array(caseListItemSchema),
  nextCursor: z.string().nullable(),
});

export type CaseCreateInput = z.infer<typeof caseCreateSchema>;
export type CaseEntity = z.infer<typeof caseEntitySchema>;
export type CaseMetric = z.infer<typeof caseMetricSchema>;
export type CaseMedia = z.infer<typeof caseMediaSchema>;
export type CaseListItem = z.infer<typeof caseListItemSchema>;
export type CaseListResponse = z.infer<typeof caseListResponseSchema>;

export type CaseQuery = z.infer<typeof caseQuerySchema>;

export function normalizeCaseMetrics(metrics: unknown): CaseMetric[] | null {
  if (!metrics) {
    return null;
  }

  const asArray = caseMetricsSchema.safeParse(metrics);
  if (asArray.success) {
    return asArray.data.map((entry) => ({
      ...entry,
      unit: entry.unit ?? null,
      description: entry.description ?? null,
    }));
  }

  if (typeof metrics === 'object' && metrics !== null) {
    const recordEntries = Object.entries(metrics as Record<string, unknown>)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([label, value]) => ({
        label,
        value: typeof value === 'number' || typeof value === 'string' ? value : String(value),
        unit: null,
        description: null,
      }));

    if (recordEntries.length > 0) {
      return recordEntries;
    }
  }

  return null;
}
