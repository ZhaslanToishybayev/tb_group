import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { analyticsAIService } from '../modules/analytics-ai/analytics-ai.service';

// Типы событий аналитики
export type AnalyticsEventType =
  | 'page_view'
  | 'click'
  | 'form_submit'
  | 'scroll'
  | 'time_spent'
  | 'video_play'
  | 'video_pause'
  | 'video_complete'
  | 'download'
  | 'share';

// Конфигурация события
interface AnalyticsEventConfig {
  type: AnalyticsEventType;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

// Конфигурации событий
const EVENT_CONFIGS: Record<AnalyticsEventType, AnalyticsEventConfig> = {
  page_view: {
    type: 'page_view',
    category: 'Navigation',
    action: 'Page View',
    label: 'page_path'
  },
  click: {
    type: 'click',
    category: 'Interaction',
    action: 'Click',
    label: 'element_clicked'
  },
  form_submit: {
    type: 'form_submit',
    category: 'Conversion',
    action: 'Form Submit',
    label: 'form_type'
  },
  scroll: {
    type: 'scroll',
    category: 'Engagement',
    action: 'Scroll',
    label: 'scroll_depth'
  },
  time_spent: {
    type: 'time_spent',
    category: 'Engagement',
    action: 'Time Spent',
    label: 'time_on_page'
  },
  video_play: {
    type: 'video_play',
    category: 'Media',
    action: 'Video Play',
    label: 'video_id'
  },
  video_pause: {
    type: 'video_pause',
    category: 'Media',
    action: 'Video Pause',
    label: 'video_id'
  },
  video_complete: {
    type: 'video_complete',
    category: 'Media',
    action: 'Video Complete',
    label: 'video_id'
  },
  download: {
    type: 'download',
    category: 'Engagement',
    action: 'Download',
    label: 'file_name'
  },
  share: {
    type: 'share',
    category: 'Social',
    action: 'Share',
    label: 'platform'
  }
};

// Middleware для автоматического сбора page_view событий
export function trackPageViews() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Генерируем sessionId если нет
    if (!req.sessionId) {
      req.sessionId = uuidv4();
    }

    // Отправляем событие page_view
    const event = {
      sessionId: req.sessionId,
      pageUrl: req.originalUrl,
      eventType: 'page_view' as const,
      timestamp: new Date(),
      metadata: {
        method: req.method,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referrer'),
        ip: req.ip,
      }
    };

    // Асинхронно отправляем событие (не блокируем ответ)
    setImmediate(async () => {
      try {
        await analyticsAIService.analyzeUserBehavior([event]);
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    });

    next();
  };
}

// Middleware для отслеживания времени на странице
export function trackTimeSpent(thresholdMs: number = 10000) { // 10 секунд по умолчанию
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Отправляем событие при завершении запроса
    res.on('finish', () => {
      const timeSpent = Date.now() - startTime;

      if (timeSpent >= thresholdMs) {
        const event = {
          sessionId: req.sessionId || uuidv4(),
          pageUrl: req.originalUrl,
          eventType: 'time_spent' as const,
          timestamp: new Date(),
          duration: timeSpent,
          metadata: {
            method: req.method,
            statusCode: res.statusCode,
          }
        };

        setImmediate(async () => {
          try {
            await analyticsAIService.analyzeUserBehavior([event]);
          } catch (error) {
            console.error('Failed to track time spent:', error);
          }
        });
      }
    });

    next();
  };
}

// Middleware для автоматического сбора scroll событий
export function trackScrolls() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    // Добавляем JavaScript для отслеживания скроллов
    const scrollScript = `
      <script>
        (function() {
          let maxScroll = 0;
          let scrollTimer;

          function sendScrollEvent(depth) {
            fetch('/api/analytics-ai/behavior/analyze', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                events: [{
                  sessionId: window.sessionId || '${uuidv4()}',
                  pageUrl: window.location.pathname,
                  eventType: 'scroll',
                  timestamp: new Date(),
                  metadata: {
                    scrollDepth: depth,
                    pageHeight: document.body.scrollHeight,
                    viewportHeight: window.innerHeight,
                  }
                }]
              })
            }).catch(console.error);
          }

          window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            if (scrollPercent > maxScroll) {
              maxScroll = scrollPercent;

              // Отправляем событие только на ключевых глубинах
              const keyDepths = [25, 50, 75, 90, 100];

              if (keyDepths.includes(scrollPercent)) {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                  sendScrollEvent(scrollPercent);
                }, 1000); // Дебаунс 1 секунда
              }
            }
          });
        })();
      </script>
    `;

    // Вставляем скрипт перед закрывающим body тегом
    const originalSend = res.send;
    res.send = function(data: any) {
      if (typeof data === 'string' && data.includes('</body>')) {
        data = data.replace('</body>', `${scrollScript}</body>`);
      }
      return originalSend.call(this, data);
    };

    next();
  };
}

// Middleware для отслеживания кликов по важным элементам
export function trackImportantClicks() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    // Добавляем обработчик кликов
    const clickScript = `
      <script>
        (function() {
          const importantSelectors = [
            'button',
            '.cta-button',
            '.service-card',
            '.case-card',
            'a[href*="contact"]',
            'a[href*="services"]',
            'a[href*="cases"]',
            'a[href*="about"]'
          ];

          importantSelectors.forEach(selector => {
            document.addEventListener('click', function(e) {
              const element = e.target.closest(selector);
              if (element) {
                const event = {
                  sessionId: window.sessionId || '${uuidv4()}',
                  pageUrl: window.location.pathname,
                  eventType: 'click',
                  timestamp: new Date(),
                  metadata: {
                    element: selector,
                    elementText: element.textContent?.trim().substring(0, 100),
                    href: element.href,
                    position: {
                      x: e.clientX,
                      y: e.clientY
                    }
                  }
                };

                fetch('/api/analytics-ai/behavior/analyze', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ events: [event] })
                }).catch(console.error);
              }
            });
          });
        })();
      </script>
    `;

    const originalSend = res.send;
    res.send = function(data: any) {
      if (typeof data === 'string' && data.includes('</body>')) {
        data = data.replace('</body>', `${clickScript}</body>`);
      }
      return originalSend.call(this, data);
    };

    next();
  };
}

// Утилита для ручного трекинга событий
export function trackEvent(
  req: Request,
  eventType: AnalyticsEventType,
  metadata: Record<string, any> = {}
) {
  const event = {
    sessionId: req.sessionId || uuidv4(),
    pageUrl: req.originalUrl,
    eventType,
    timestamp: new Date(),
    metadata: {
      ...metadata,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    }
  };

  return analyticsAIService.analyzeUserBehavior([event]);
}

// Type augmentation для Express Request
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

export { EVENT_CONFIGS };