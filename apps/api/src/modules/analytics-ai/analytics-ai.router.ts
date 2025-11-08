import { Router } from 'express';

import asyncHandler from '../../utils/async-handler';
import { analyticsAIService } from './analytics-ai.service';
import { validateBody } from '../../utils/validate';
import { z } from 'zod';

const router = Router();

// Сбор событий поведения пользователей
const behaviorEventSchema = z.object({
  sessionId: z.string(),
  pageUrl: z.string(),
  eventType: z.enum(['page_view', 'click', 'form_submit', 'scroll', 'time_spent']),
  timestamp: z.date(),
  duration: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

// Анализ поведения пользователей
router.post(
  '/behavior/analyze',
  asyncHandler(async (req, res) => {
    const events = req.body.events;

    if (!Array.isArray(events)) {
      return res.status(400).json({
        error: { code: 'INVALID_EVENTS', message: 'Events must be an array' }
      });
    }

    // Валидируем события
    const validatedEvents = events.map(event => behaviorEventSchema.parse(event));

    const insights = await analyticsAIService.analyzeUserBehavior(validatedEvents);

    res.json({
      data: {
        insights,
        count: insights.length,
      }
    });
  })
);

// Генерация AI insights для конверсии
router.post(
  '/insights/generate',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      funnelData: z.array(z.any()),
      pagePerformance: z.array(z.any()),
      userJourneys: z.array(z.any()),
    });

    const data = schema.parse(req.body);

    const insights = await analyticsAIService.generateConversionInsights(data);

    res.json({
      data: {
        insights,
        count: insights.length,
      }
    });
  })
);

// Получение кэшированных insights
router.get(
  '/insights',
  asyncHandler(async (req, res) => {
    const { type } = req.query;

    const insights = await analyticsAIService.getCachedInsights(type as string);

    res.json({
      data: {
        insights,
        count: insights.length,
        type: type || 'all'
      }
    });
  })
);

// Создание Smart A/B теста
router.post(
  '/ab-test/create',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string(),
      description: z.string(),
      variants: z.array(z.object({
        id: z.string(),
        name: z.string(),
        content: z.record(z.any()),
        trafficSplit: z.number().min(0).max(100),
      })),
      targetMetric: z.enum(['conversion_rate', 'engagement', 'bounce_rate', 'time_on_page']),
      startDate: z.date(),
      endDate: z.date().optional(),
    });

    const config = schema.parse(req.body);

    const abTest = await analyticsAIService.createSmartABTest(config);

    res.status(201).json({
      data: abTest
    });
  })
);

// Анализ результатов A/B теста
router.post(
  '/ab-test/:testId/analyze',
  asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const results = req.body;

    const analysis = await analyticsAIService.analyzeABTestResults(testId, results);

    res.json({
      data: analysis
    });
  })
);

// Персонализация контента
router.post(
  '/personalize',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      userId: z.string(),
      behavior: z.array(behaviorEventSchema),
      demographics: z.record(z.any()).optional(),
      preferences: z.record(z.any()).optional(),
    });

    const userProfile = schema.parse(req.body);

    const personalization = await analyticsAIService.personalizeContent(userProfile);

    res.json({
      data: personalization
    });
  })
);

// AI Chatbot
router.post(
  '/chatbot',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })),
      context: z.object({
        userProfile: z.record(z.any()).optional(),
        currentPage: z.string().optional(),
        services: z.array(z.any()).optional(),
      }).optional(),
    });

    const { conversationHistory, context } = schema.parse(req.body);

    const response = await analyticsAIService.generateChatbotResponse(conversationHistory, context);

    res.json({
      data: {
        response,
        timestamp: new Date(),
      }
    });
  })
);

export default router;