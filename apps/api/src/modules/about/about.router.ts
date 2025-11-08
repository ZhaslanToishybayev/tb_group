import { Router } from 'express';
import { bodyValidator } from '../../utils/validate';
import { asyncHandler } from '../../utils/async-handler';
import { requireAuth } from '../../middleware/require-auth';
import prisma from '../../../lib/prisma';
import { z } from 'zod';

const router = Router();

// GET /api/about - получить данные о компании
router.get('/', async (req, res) => {
  try {
    const about = await prisma.about.findFirst();
    
    if (!about) {
      return res.status(404).json({
        error: 'About page data not found'
      });
    }

    res.json(about);
  } catch (error) {
    console.error('Failed to get about data:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /api/about - обновить данные о компании (требует авторизации)
router.put('/', requireAuth, async (req, res) => {
  try {
    const aboutData = bodyValidator(
      z.object({
        content: z.string().optional(),
        story: z.string().optional(),
        team: z.string().optional(),
        certifications: z.string().optional(),
        partnerships: z.string().optional(),
        timeline: z.string().optional(),
        offices: z.string().optional()
      })
    );

    const validatedData = aboutData.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({
        error: 'Invalid data',
        details: validatedData.error
      });
    }

    const { content, story, team, certifications, partnerships, timeline, offices } = validatedData.data;

    const about = await prisma.about.upsert({
      where: { id: 'default' },
      update: {
        content: content || undefined,
        story: story || undefined,
        team: team || undefined,
        certifications: certifications || undefined,
        partnerships: partnerships || undefined,
        timeline: timeline || undefined,
        offices: offices || undefined,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        createdAt: new Date()
      }
    });

    res.json(about);
  } catch (error) {
    console.error('Failed to update about data:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;