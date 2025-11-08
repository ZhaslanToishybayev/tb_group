import { z } from 'zod';

export const serviceEntitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.unknown().nullable().optional(),
  heroImageUrl: z.string().nullable(),
  iconUrl: z.string().nullable(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const serviceCreateSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  description: z.unknown().optional(),
  heroImageUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  order: z.number().int().optional(),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const serviceQuerySchema = z.object({
  slug: z.string().optional(),
});

const heroContentSchema = z
  .object({
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    bullets: z.array(z.string()).optional(),
    image: z
      .object({
        url: z.string().optional(),
        alt: z.string().optional(),
      })
      .optional(),
    stats: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      )
      .optional(),
    cta: z
      .object({
        label: z.string().optional(),
        href: z.string().optional(),
      })
      .optional(),
  })
  .passthrough()
  .optional();

const advantageSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
  })
  .passthrough();

const processStepSchema = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    duration: z.string().optional(),
  })
  .passthrough();

const galleryItemSchema = z
  .object({
    type: z.enum(['image', 'video']).optional(),
    url: z.string(),
    thumbnailUrl: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .passthrough();

const faqItemSchema = z
  .object({
    question: z.string(),
    answer: z.string(),
  })
  .passthrough();

const highlightSchema = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .passthrough();

export const serviceContentSchema = z
  .object({
    hero: heroContentSchema,
    overview: z.object({ title: z.string().optional(), description: z.string().optional() }).passthrough().optional(),
    highlights: z.array(highlightSchema).optional(),
    advantages: z.array(advantageSchema).optional(),
    process: z
      .object({
        title: z.string().optional(),
        steps: z.array(processStepSchema).optional(),
      })
      .passthrough()
      .optional(),
    gallery: z
      .object({
        items: z.array(galleryItemSchema).optional(),
      })
      .passthrough()
      .optional(),
    faqs: z.array(faqItemSchema).optional(),
    testimonials: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        ids: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
    cta: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        ctaLabel: z.string().optional(),
        ctaLink: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()
  .optional();

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type ServiceEntity = z.infer<typeof serviceEntitySchema>;
export type ServiceContent = z.infer<typeof serviceContentSchema>;
