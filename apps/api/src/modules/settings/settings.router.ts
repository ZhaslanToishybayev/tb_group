import { Router } from 'express';

import prisma from '../../lib/prisma';
import asyncHandler from '../../utils/async-handler';
import { validateBody } from '../../utils/validate';
import requireAuth from '../../middleware/require-auth';
import { settingUpsertSchema } from './settings.schemas';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const data = await prisma.setting.findMany({});
    res.json({ data });
  }),
);

router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const record = await prisma.setting.findUnique({ where: { key: req.params.key } });
    if (!record) {
      res.status(404).json({ message: 'Setting not found' });
      return;
    }
    res.json({ data: record });
  }),
);

router.put(
  '/:key',
  requireAuth,
  validateBody(settingUpsertSchema),
  asyncHandler(async (req, res) => {
    const payload = settingUpsertSchema.parse(req.body);
    const updated = await prisma.setting.upsert({
      where: { key: req.params.key },
      update: { value: payload.value },
      create: { key: req.params.key, value: payload.value },
    });
    res.json({ data: updated });
  }),
);

router.delete(
  '/:key',
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.setting.delete({ where: { key: req.params.key } }).catch(() => null);
    res.status(204).send();
  }),
);

export default router;
