import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import { Router } from 'express';

import env from '../../config/env';
import requireAuth from '../../middleware/require-auth';
import asyncHandler from '../../utils/async-handler';

const upload = multer({ storage: multer.memoryStorage() });
const uploadsDir = env.UPLOADS_DIR ?? path.resolve(process.cwd(), 'uploads');
const publicBaseUrl = env.ASSET_BASE_URL?.replace(/\/$/, '') ?? '';

const ensureUploadsDir = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
};

const sanitizeFilename = (name: string): string => {
  return name.replace(/[^A-Za-z0-9._-]/g, '_');
};

const router = Router();

router.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    await ensureUploadsDir();

    const uploadId = randomUUID();
    const sanitizedName = sanitizeFilename(req.file.originalname || 'file');
    const destinationDir = path.join(uploadsDir, uploadId);
    await fs.mkdir(destinationDir, { recursive: true });
    const filePath = path.join(destinationDir, sanitizedName);

    await fs.writeFile(filePath, req.file.buffer);

    const relativePath = `/uploads/${uploadId}/${encodeURIComponent(sanitizedName)}`;
    const url = publicBaseUrl ? `${publicBaseUrl}${relativePath}` : relativePath;

    res.status(201).json({
      data: {
        uploadId,
        filename: sanitizedName,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url,
        path: relativePath,
      },
    });
  }),
);

export default router;
