import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import prisma from '../../lib/prisma';
import asyncHandler from '../../utils/async-handler';
import { validateBody } from '../../utils/validate';
import requireAuth from '../../middleware/require-auth';
import {
  caseCreateSchema,
  caseUpdateSchema,
  caseQuerySchema,
  normalizeCaseMetrics,
} from './cases.schemas';
import type { CaseListResponse } from './cases.schemas';

const router = Router();

const mapCaseInput = (input: Partial<ReturnType<typeof caseCreateSchema.parse>>) => {
  const { publishedAt, ...rest } = input;
  return {
    ...rest,
    publishedAt: publishedAt ? new Date(publishedAt) : undefined,
  } satisfies Prisma.CaseUncheckedCreateInput;
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { cursor, take, search, published, ...filters } = caseQuerySchema.parse(req.query);

    const where: Prisma.CaseWhereInput = {
      published: published ?? true,
    };

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.serviceId) {
      where.serviceId = filters.serviceId;
    }
    if (search) {
      where.OR = [
        { projectTitle: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const takeValue = take ?? 12;
    const cursorFilter = cursor ? { id: cursor } : undefined;

    const cases = await prisma.case.findMany({
      where,
      take: takeValue + 1,
      ...(cursorFilter ? { cursor: cursorFilter, skip: 1 } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        slug: true,
        projectTitle: true,
        clientName: true,
        industry: true,
        summary: true,
        challenge: true,
        solution: true,
        results: true,
        metrics: true,
        category: true,
        serviceId: true,
        heroImageUrl: true,
        videoUrl: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        media: {
          select: {
            id: true,
            url: true,
            type: true,
            altText: true,
            metadata: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (cases.length > takeValue) {
      const next = cases.pop();
      nextCursor = next?.id ?? null;
    }

    const response: CaseListResponse = {
      items: cases.map((record) => ({
        id: record.id,
        slug: record.slug,
        projectTitle: record.projectTitle,
        clientName: record.clientName,
        industry: record.industry ?? null,
        summary: record.summary,
        challenge: record.challenge ?? null,
        solution: record.solution ?? null,
        results: record.results ?? null,
        metrics: normalizeCaseMetrics(record.metrics),
        category: record.category,
        serviceId: record.serviceId ?? null,
        heroImageUrl: record.heroImageUrl ?? null,
        videoUrl: record.videoUrl ?? null,
        published: record.published,
        publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        media: record.media.map((media) => ({
          id: media.id,
          url: media.url,
          type: media.type ?? null,
          altText: media.altText ?? null,
          metadata: media.metadata ?? null,
        })),
      })),
      nextCursor,
    };

    res.json({
      data: response,
    });
  }),
);

const findCase = async (idOrSlug: string) => {
  const byId = await prisma.case.findUnique({ where: { id: idOrSlug } });
  if (byId) return byId;
  return prisma.case.findUnique({ where: { slug: idOrSlug } });
};

router.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const record = await findCase(req.params.idOrSlug);
    if (!record) {
      res.status(404).json({ message: 'Case not found' });
      return;
    }
    res.json({ data: record });
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(caseCreateSchema),
  asyncHandler(async (req, res) => {
    const payload = caseCreateSchema.parse(req.body);
    const created = await prisma.case.create({
      data: mapCaseInput(payload),
    });
    res.status(201).json({ data: created });
  }),
);

router.put(
  '/:idOrSlug',
  requireAuth,
  validateBody(caseUpdateSchema),
  asyncHandler(async (req, res) => {
    const existing = await findCase(req.params.idOrSlug);
    if (!existing) {
      res.status(404).json({ message: 'Case not found' });
      return;
    }
    const payload = caseUpdateSchema.parse(req.body);
    const updated = await prisma.case.update({
      where: { id: existing.id },
      data: mapCaseInput(payload),
    });
    res.json({ data: updated });
  }),
);

router.delete(
  '/:idOrSlug',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await findCase(req.params.idOrSlug);
    if (!existing) {
      res.status(404).json({ message: 'Case not found' });
      return;
    }
    await prisma.case.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

export default router;
