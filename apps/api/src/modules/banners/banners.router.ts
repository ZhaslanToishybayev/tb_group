import { Router } from 'express';

import prisma from '../../lib/prisma';
import asyncHandler from '../../utils/async-handler';
import { validateBody } from '../../utils/validate';
import requireAuth from '../../middleware/require-auth';
import { bannerCreateSchema, bannerUpdateSchema } from './banners.schemas';

const router = Router();

const includeMedia = {
  mediaItems: {
    include: {
      media: true,
    },
  },
} as const;

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const data = await prisma.banner.findMany({
      include: includeMedia,
      orderBy: { order: 'asc' },
    });
    res.json({ data });
  }),
);

const findBanner = async (id: string) =>
  prisma.banner.findUnique({ where: { id }, include: includeMedia });

const upsertBannerMedia = async (bannerId: string, mediaId?: string | null) => {
  if (!mediaId) {
    await prisma.bannerMedia.deleteMany({ where: { bannerId } });
    return;
  }
  await prisma.bannerMedia.upsert({
    where: { bannerId },
    create: { bannerId, mediaId },
    update: { mediaId },
  });
};

router.post(
  '/',
  requireAuth,
  validateBody(bannerCreateSchema),
  asyncHandler(async (req, res) => {
    const payload = bannerCreateSchema.parse(req.body);
    const { mediaId, ...data } = payload;
    const created = await prisma.banner.create({ data });
    await upsertBannerMedia(created.id, mediaId);
    const result = await findBanner(created.id);
    res.status(201).json({ data: result });
  }),
);

router.put(
  '/:id',
  requireAuth,
  validateBody(bannerUpdateSchema),
  asyncHandler(async (req, res) => {
    const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Banner not found' });
      return;
    }
    const payload = bannerUpdateSchema.parse(req.body);
    const { mediaId, ...data } = payload;
    const updated = await prisma.banner.update({
      where: { id: existing.id },
      data,
    });
    if (payload.mediaId !== undefined) {
      await upsertBannerMedia(updated.id, mediaId ?? undefined);
    }
    const result = await findBanner(updated.id);
    res.json({ data: result });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await prisma.banner.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Banner not found' });
      return;
    }
    await prisma.banner.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

export default router;
