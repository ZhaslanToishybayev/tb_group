import type { Prisma, ServiceCategory } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';

import prisma from '../../lib/prisma';
import asyncHandler from '../../utils/async-handler';
import { validateBody } from '../../utils/validate';
import requireAuth from '../../middleware/require-auth';
import {
  serviceCreateSchema,
  serviceUpdateSchema,
  serviceContentSchema,
} from './services.schemas';

const router = Router();

const serviceDetailQuerySchema = z.object({
  include: z.enum(['full']).optional(),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const data = await prisma.service.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ data });
  }),
);

const findByIdOrSlug = async (
  idOrSlug: string,
  include?: Prisma.ServiceInclude,
) => {
  const byId = await prisma.service.findUnique({ where: { id: idOrSlug }, include });
  if (byId) return byId;
  return prisma.service.findUnique({ where: { slug: idOrSlug }, include });
};

router.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const { include } = serviceDetailQuerySchema.parse(req.query);
    const includeFull = include === 'full';

    const record = await findByIdOrSlug(req.params.idOrSlug, includeFull
      ? {
          banners: {
            include: {
              mediaItems: {
                include: { media: true },
              },
            },
          },
        }
      : undefined);
    if (!record) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    const serviceResponse = {
      id: record.id,
      slug: record.slug,
      title: record.title,
      summary: record.summary,
      description: record.description ?? null,
      heroImageUrl: record.heroImageUrl ?? null,
      iconUrl: record.iconUrl ?? null,
      order: record.order,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };

    if (!includeFull) {
      res.json({ data: serviceResponse });
      return;
    }

    const slugCategoryMap: Record<string, ServiceCategory> = {
      'my-sklad': 'MY_SKLAD',
      'bitrix24': 'BITRIX24',
      'telephony': 'TELEPHONY',
    };

    const matchingCategory = slugCategoryMap[record.slug];

    const relatedCases = await prisma.case.findMany({
      where: {
        OR: [
          { serviceId: record.id },
          ...(matchingCategory ? [{ category: matchingCategory }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        slug: true,
        projectTitle: true,
        clientName: true,
        summary: true,
        category: true,
        heroImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const contentResult = serviceContentSchema.safeParse(record.description);
    const content = contentResult.success ? contentResult.data : null;

    const banners = (record.banners ?? []).map((banner) => ({
      id: banner.id,
      placement: banner.placement,
      title: banner.title,
      subtitle: banner.subtitle,
      ctaLabel: banner.ctaLabel,
      ctaLink: banner.ctaLink,
      order: banner.order,
      createdAt: banner.createdAt.toISOString(),
      updatedAt: banner.updatedAt.toISOString(),
      media: banner.mediaItems?.map(({ media }) => ({
        id: media.id,
        url: media.url,
        type: media.type,
        altText: media.altText,
        mimeType: media.mimeType,
        size: media.size,
        metadata: media.metadata ?? null,
        createdAt: media.createdAt.toISOString(),
      })) ?? [],
    }));

    res.json({
      data: {
        ...serviceResponse,
        content,
        banners,
        relatedCases: relatedCases.map((caseItem) => ({
          id: caseItem.id,
          slug: caseItem.slug,
          projectTitle: caseItem.projectTitle,
          clientName: caseItem.clientName,
          summary: caseItem.summary,
          category: caseItem.category,
          heroImageUrl: caseItem.heroImageUrl ?? null,
          createdAt: caseItem.createdAt.toISOString(),
          updatedAt: caseItem.updatedAt.toISOString(),
        })),
      },
    });
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(serviceCreateSchema),
  asyncHandler(async (req, res) => {
    const payload = serviceCreateSchema.parse(req.body);
    const created = await prisma.service.create({ data: payload });
    res.status(201).json({ data: created });
  }),
);

router.put(
  '/:idOrSlug',
  requireAuth,
  validateBody(serviceUpdateSchema),
  asyncHandler(async (req, res) => {
    const existing = await findByIdOrSlug(req.params.idOrSlug);
    if (!existing) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    const payload = serviceUpdateSchema.parse(req.body);
    const updated = await prisma.service.update({
      where: { id: existing.id },
      data: payload,
    });
    res.json({ data: updated });
  }),
);

router.delete(
  '/:idOrSlug',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await findByIdOrSlug(req.params.idOrSlug);
    if (!existing) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    await prisma.service.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

export default router;
