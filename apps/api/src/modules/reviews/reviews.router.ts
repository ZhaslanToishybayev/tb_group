import { Router } from 'express';
import type { Prisma } from '@prisma/client';

import prisma from '../../lib/prisma';
import asyncHandler from '../../utils/async-handler';
import { validateBody } from '../../utils/validate';
import requireAuth from '../../middleware/require-auth';
import {
  reviewCreateSchema,
  reviewUpdateSchema,
  reviewQuerySchema,
} from './reviews.schemas';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filters = reviewQuerySchema.parse(req.query);
    const where: Prisma.ReviewWhereInput = {};
    if (typeof filters.isPublished === 'boolean') {
      where.isPublished = filters.isPublished;
    }
    if (typeof filters.isFeatured === 'boolean') {
      where.isFeatured = filters.isFeatured;
    }
    if (filters.caseId) {
      where.caseId = filters.caseId;
    }
    const data = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data });
  }),
);

const findReview = async (id: string) => prisma.review.findUnique({ where: { id } });

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const record = await findReview(req.params.id);
    if (!record) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    res.json({ data: record });
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(reviewCreateSchema),
  asyncHandler(async (req, res) => {
    const payload = reviewCreateSchema.parse(req.body);
    const created = await prisma.review.create({ data: payload });
    res.status(201).json({ data: created });
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(reviewUpdateSchema),
  asyncHandler(async (req, res) => {
    const existing = await findReview(req.params.id);
    if (!existing) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    const payload = reviewUpdateSchema.parse(req.body);
    const updated = await prisma.review.update({ where: { id: existing.id }, data: payload });
    res.json({ data: updated });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await findReview(req.params.id);
    if (!existing) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    await prisma.review.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

export default router;
