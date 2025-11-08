import { Router } from 'express';
import type { Prisma } from '@prisma/client';

import prisma from '../../lib/prisma';
import asyncHandler from '../../utils/async-handler';
import { validateBody } from '../../utils/validate';
import requireAuth from '../../middleware/require-auth';
import {
  mediaCreateSchema,
  mediaUpdateSchema,
  type MediaCreateInput,
  type MediaUpdateInput,
} from './media.schemas';

const router = Router();

const toCreateData = (input: MediaCreateInput): Prisma.MediaAssetUncheckedCreateInput => ({
  url: input.url,
  type: input.type,
  altText: input.altText ?? undefined,
  mimeType: input.mimeType ?? undefined,
  size: input.size ?? undefined,
  metadata: input.metadata ?? undefined,
  caseId: input.caseId ?? undefined,
  reviewId: input.reviewId ?? undefined,
});

const toUpdateData = (
  input: MediaUpdateInput,
): Prisma.MediaAssetUncheckedUpdateInput => {
  const data: Prisma.MediaAssetUncheckedUpdateInput = {};
  if (input.url !== undefined) data.url = input.url;
  if (input.type !== undefined) data.type = input.type;
  if (input.altText !== undefined) data.altText = input.altText;
  if (input.mimeType !== undefined) data.mimeType = input.mimeType;
  if (input.size !== undefined) data.size = input.size;
  if (input.metadata !== undefined) data.metadata = input.metadata;
  if (input.caseId !== undefined) data.caseId = input.caseId ?? undefined;
  if (input.reviewId !== undefined) data.reviewId = input.reviewId ?? undefined;
  return data;
};

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const data = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ data });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const record = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
    if (!record) {
      res.status(404).json({ message: 'Media asset not found' });
      return;
    }
    res.json({ data: record });
  }),
);

router.post(
  '/',
  requireAuth,
  validateBody(mediaCreateSchema),
  asyncHandler(async (req, res) => {
    const payload = mediaCreateSchema.parse(req.body);
    const created = await prisma.mediaAsset.create({
      data: toCreateData(payload),
    });
    res.status(201).json({ data: created });
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(mediaUpdateSchema),
  asyncHandler(async (req, res) => {
    const existing = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Media asset not found' });
      return;
    }
    const payload = mediaUpdateSchema.parse(req.body);
    const updated = await prisma.mediaAsset.update({
      where: { id: existing.id },
      data: toUpdateData(payload),
    });
    res.json({ data: updated });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Media asset not found' });
      return;
    }
    await prisma.mediaAsset.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

export default router;
