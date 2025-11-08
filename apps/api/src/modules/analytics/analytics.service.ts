import prisma from '../../lib/prisma';
import { logger } from '../../middleware/logger';

export interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  referrer?: string;
  url?: string;
  customDimensions?: Record<string, string>;
}

export interface EcommerceEvent extends AnalyticsEvent {
  transactionId: string;
  value: number;
  currency: string;
  items?: EcommerceItem[];
}

export interface EcommerceItem {
  itemId: string;
  itemName: string;
  category?: string;
  quantity?: number;
  price?: number;
}

export class AnalyticsService {
  // Track custom events
  static async trackEvent(event: AnalyticsEvent) {
    try {
      // Store in database for internal analytics
      await prisma.analyticsEvent.create({
        data: {
          eventName: event.event,
          category: event.category,
          action: event.action,
          label: event.label,
          value: event.value,
          userId: event.userId,
          sessionId: event.sessionId,
          userAgent: event.userAgent,
          ip: event.ip,
          referrer: event.referrer,
          url: event.url,
          customDimensions: event.customDimensions || {},
        },
      });

      logger.debug({ event }, 'Analytics event tracked');

      // In a real implementation, this would also send to GA4/Yandex
      return { success: true };
    } catch (error) {
      logger.error({ error, event }, 'Failed to track analytics event');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Track page views
  static async trackPageView(data: {
    url: string;
    title?: string;
    referrer?: string;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    ip?: string;
  }) {
    try {
      await prisma.pageView.create({
        data: {
          url: data.url,
          title: data.title,
          referrer: data.referrer,
          userId: data.userId,
          sessionId: data.sessionId,
          userAgent: data.userAgent,
          ip: data.ip,
        },
      });

      return { success: true };
    } catch (error) {
      logger.error({ error, data }, 'Failed to track page view');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Track contact form submissions
  static async trackContactForm(data: {
    formType: string;
    serviceInterest?: string;
    source?: string;
    userId?: string;
    sessionId?: string;
  }) {
    return this.trackEvent({
      event: 'contact_form_submit',
      category: 'lead_generation',
      action: data.formType,
      label: data.serviceInterest || 'general',
      customDimensions: {
        source: data.source || 'website',
      },
      userId: data.userId,
      sessionId: data.sessionId,
    });
  }

  // Track service page views
  static async trackServiceView(serviceId: string, serviceName: string) {
    return this.trackEvent({
      event: 'service_view',
      category: 'engagement',
      action: 'view_service',
      label: serviceName,
      value: 1,
      customDimensions: {
        serviceId,
      },
    });
  }

  // Track case study interactions
  static async trackCaseInteraction(caseId: string, action: 'view' | 'share' | 'download') {
    return this.trackEvent({
      event: 'case_interaction',
      category: 'engagement',
      action,
      label: caseId,
      value: 1,
      customDimensions: {
        caseId,
      },
    });
  }

  // Get internal analytics data
  static async getAnalyticsData(options: {
    startDate?: Date;
    endDate?: Date;
    eventCategory?: string;
  } = {}) {
    const { startDate, endDate, eventCategory } = options;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    if (eventCategory) {
      where.category = eventCategory;
    }

    const [events, pageViews, contactForms] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
      prisma.pageView.findMany({
        where: startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        } : {},
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
      prisma.analyticsEvent.findMany({
        where: { eventName: 'contact_form_submit' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    // Process data for analytics dashboard
    const eventStats = this.processEventData(events);
    const pageViewStats = this.processPageViewData(pageViews);
    const conversionStats = this.processConversionData(contactForms);

    return {
      events: eventStats,
      pageViews: pageViewStats,
      conversions: conversionStats,
      generatedAt: new Date().toISOString(),
    };
  }

  private static processEventData(events: any[]) {
    const totalEvents = events.length;
    const eventsByCategory = events.reduce((acc, event) => {
      const category = event.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByAction = events.reduce((acc, event) => {
      const action = event.action || 'unknown';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalEvents,
      byCategory: eventsByCategory,
      byAction: eventsByAction,
      recent: events.slice(0, 10),
    };
  }

  private static processPageViewData(pageViews: any[]) {
    const totalPageViews = pageViews.length;
    const uniquePages = new Set(pageViews.map(pv => pv.url)).size;
    
    const pageViewsByUrl = pageViews.reduce((acc, pv) => {
      const url = pv.url;
      acc[url] = (acc[url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPages = Object.entries(pageViewsByUrl)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, views]) => ({ url, views }));

    return {
      total: totalPageViews,
      uniquePages,
      topPages,
      recent: pageViews.slice(0, 10),
    };
  }

  private static processConversionData(contactForms: any[]) {
    const totalConversions = contactForms.length;
    
    const conversionsBySource = contactForms.reduce((acc, event) => {
      const source = event.customDimensions?.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const conversionsByService = contactForms.reduce((acc, event) => {
      const service = event.label || 'general';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalConversions,
      bySource: conversionsBySource,
      byService: conversionsByService,
      recent: contactForms.slice(0, 10),
    };
  }

  // Generate Google Analytics 4 measurement ID script
  static generateGA4Script(measurementId: string) {
    return `
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}', {
    cookie_flags: 'SameSite=None;Secure',
    page_location: window.location.href,
    send_page_view: false
  });
  
  // Custom configuration
  gtag('config', '${measurementId}', {
    custom_map: {'custom_parameter_1': 'service_interest'}
  });
</script>`;
  }

  // Generate Yandex Metrica counter script
  static generateYandexMetricaScript(counterId: string) {
    return `
<!-- Yandex Metrica -->
<script type="text/javascript" >
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(${counterId}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true,
        ecommerce:"dataLayer"
   });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/${counterId}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>`;
  }

  // Generate tracking scripts for frontend
  static generateTrackingScripts() {
    const ga4Id = process.env.GA4_MEASUREMENT_ID;
    const yandexId = process.env.YANDEX_METRICA_COUNTER_ID;

    let scripts = '';
    
    if (ga4Id) {
      scripts += this.generateGA4Script(ga4Id) + '\n';
    }
    
    if (yandexId) {
      scripts += this.generateYandexMetricaScript(yandexId) + '\n';
    }

    return scripts;
  }
}