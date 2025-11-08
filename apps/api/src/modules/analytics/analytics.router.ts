import { Router } from 'express';

import prisma from '../../lib/prisma';
import asyncHandler from '../../utils/async-handler';
import { validateBody } from '../../utils/validate';
import { AnalyticsService } from './analytics.service';
import { ApiError } from '../../middleware/error-handler';
import { logger } from '../../middleware/logger';

const router = Router();

router.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const [
      servicesTotal,
      casesTotal,
      casesPublished,
      reviewsTotal,
      reviewsPending,
      reviewsFeatured,
      bannersTotal,
      bannersActive,
      mediaTotal,
      contactTotal,
      contactNew,
      contactInProgress,
      recentCases,
      recentReviews,
    ] = await Promise.all([
      prisma.service.count(),
      prisma.case.count(),
      prisma.case.count({ where: { published: true } }),
      prisma.review.count(),
      prisma.review.count({ where: { isPublished: false } }),
      prisma.review.count({ where: { isFeatured: true } }),
      prisma.banner.count(),
      prisma.banner.count({ where: { isActive: true } }),
      prisma.mediaAsset.count(),
      prisma.contactRequest.count(),
      prisma.contactRequest.count({ where: { status: 'NEW' } }),
      prisma.contactRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.case.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          projectTitle: true,
          clientName: true,
          published: true,
          updatedAt: true,
        },
      }),
      prisma.review.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          authorName: true,
          company: true,
          reviewType: true,
          isPublished: true,
          isFeatured: true,
          updatedAt: true,
        },
      }),
    ]);

    res.json({
      data: {
        services: {
          total: servicesTotal,
        },
        cases: {
          total: casesTotal,
          published: casesPublished,
          recent: recentCases,
        },
        reviews: {
          total: reviewsTotal,
          pending: reviewsPending,
          featured: reviewsFeatured,
          recent: recentReviews,
        },
        banners: {
          total: bannersTotal,
          active: bannersActive,
        },
        media: {
          total: mediaTotal,
        },
        contactRequests: {
          total: contactTotal,
          new: contactNew,
          inProgress: contactInProgress,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  }),
);

// Track custom events
router.post(
  '/events',
  asyncHandler(async (req, res) => {
    const result = await AnalyticsService.trackEvent(req.body);
    res.json({ data: result });
  }),
);

// Track page views
router.post(
  '/page-view',
  asyncHandler(async (req, res) => {
    const result = await AnalyticsService.trackPageView(req.body);
    res.json({ data: result });
  }),
);

// Track contact form submissions
router.post(
  '/contact-form',
  asyncHandler(async (req, res) => {
    const result = await AnalyticsService.trackContactForm(req.body);
    res.json({ data: result });
  }),
);

// Track service page views
router.post(
  '/service-view',
  asyncHandler(async (req, res) => {
    const { serviceId, serviceName } = req.body;
    if (!serviceId || !serviceName) {
      throw new ApiError('MISSING_REQUIRED_FIELDS', 400, 'serviceId and serviceName are required');
    }
    
    const result = await AnalyticsService.trackServiceView(serviceId, serviceName);
    res.json({ data: result });
  }),
);

// Track case study interactions
router.post(
  '/case-interaction',
  asyncHandler(async (req, res) => {
    const { caseId, action } = req.body;
    if (!caseId || !action || !['view', 'share', 'download'].includes(action)) {
      throw new ApiError('INVALID_PARAMETERS', 400, 'caseId and valid action are required');
    }
    
    const result = await AnalyticsService.trackCaseInteraction(caseId, action);
    res.json({ data: result });
  }),
);

// Get comprehensive analytics data
router.get(
  '/data',
  asyncHandler(async (req, res) => {
    const { startDate, endDate, eventCategory } = req.query;
    
    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventCategory: eventCategory as string,
    };

    const data = await AnalyticsService.getAnalyticsData(options);
    res.json({ data });
  }),
);

// Get analytics dashboard data
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const [events, pageViews, contactForms] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { createdAt: { gte: daysAgo } },
      }),
      prisma.pageView.count({
        where: { createdAt: { gte: daysAgo } },
      }),
      prisma.analyticsEvent.count({
        where: { 
          eventName: 'contact_form_submit',
          createdAt: { gte: daysAgo }
        },
      }),
    ]);

    // Get top pages
    const topPages = await prisma.pageView.groupBy({
      by: ['url'],
      where: { createdAt: { gte: daysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Get conversion funnel
    const funnel = await prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      where: { 
        createdAt: { gte: daysAgo },
        eventName: { in: ['service_view', 'contact_form_submit'] }
      },
      _count: { id: true },
    });

    res.json({
      data: {
        period: `Last ${days} days`,
        metrics: {
          totalEvents: events,
          totalPageViews: pageViews,
          totalConversions: contactForms,
          conversionRate: pageViews > 0 ? Math.round((contactForms / pageViews) * 100 * 100) / 100 : 0,
        },
        topPages: topPages.map(item => ({
          url: item.url,
          views: item._count.id,
        })),
        funnel: funnel.map(item => ({
          event: item.eventName,
          count: item._count.id,
        })),
      },
    });
  }),
);

// Get tracking scripts for frontend
router.get(
  '/scripts',
  asyncHandler(async (req, res) => {
    const scripts = AnalyticsService.generateTrackingScripts();
    res.json({
      data: {
        scripts,
        ga4MeasurementId: process.env.GA4_MEASUREMENT_ID,
        yandexCounterId: process.env.YANDEX_METRICA_COUNTER_ID,
      },
    });
  }),
);

// Export analytics data
router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const { format = 'json', startDate, endDate } = req.query;
    
    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const data = await AnalyticsService.getAnalyticsData(options);

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['Date', 'Event', 'Category', 'Action', 'Label', 'Value'];
      const csvRows = data.events.recent.map((event: any) => [
        event.createdAt,
        event.eventName,
        event.category,
        event.action,
        event.label,
        event.value,
      ]);

      const csv = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csv);
    } else {
      res.json({ data });
    }
  }),
);

export default router;
