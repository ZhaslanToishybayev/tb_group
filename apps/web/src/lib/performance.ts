// Performance optimization utilities

/**
 * Image optimization
 */
export const imageOptimization = {
  // Lazy loading observer
  createIntersectionObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
    });
  },

  // Preload critical images
  preloadImage(src: string) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  },

  // Optimize image based on device pixel ratio
  getOptimizedSrc(src: string, width: number, height: number, dpr: number = window.devicePixelRatio) {
    // This would integrate with your image CDN/service
    // For example, Next.js Image component handles this automatically
    return src;
  },
};

/**
 * Bundle size optimization
 */
export const bundleOptimization = {
  // Dynamic import utility
  async import(path: string) {
    return import(path);
  },

  // Split code by route/page
  splitCode(pages: string[]) {
    return Promise.all(pages.map((page) => import(/* @vite-ignore */ page)));
  },

  // Preload critical code
  preloadCritical(path: string) {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = path;
    document.head.appendChild(link);
  },
};

/**
 * Caching strategies
 */
export const caching = {
  // Cache API responses
  cacheResponse(key: string, data: any, ttl: number = 300000) {
    // 5 minutes default TTL
    const item = {
      data,
      expires: Date.now() + ttl,
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  },

  // Get cached response
  getCachedResponse(key: string) {
    const itemStr = localStorage.getItem(`cache_${key}`);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expires) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      return item.data;
    } catch {
      return null;
    }
  },

  // Clear expired cache
  clearExpiredCache() {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith('cache_'));
    const now = Date.now();

    keys.forEach((key) => {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        if (item.expires && now > item.expires) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    });
  },
};

/**
 * Performance monitoring
 */
export const performanceMonitoring = {
  // Measure page load time
  measurePageLoad() {
    if (typeof window === 'undefined' || !window.performance) return null;

    const timing = window.performance.timing;
    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    const metrics = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      domProcessing: timing.domComplete - timing.domLoading,
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstByte: timing.responseStart - timing.navigationStart,
      timeToInteractive: navigation.domInteractive - navigation.startTime,
      loadComplete: navigation.loadEventEnd - navigation.startTime,
    };

    return metrics;
  },

  // Measure component render time
  measureRender(name: string) {
    const start = performance.now();

    return () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`[Performance] ${name} render time: ${duration.toFixed(2)}ms`);
      return duration;
    };
  },

  // Observe performance metrics
  observeMetrics() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('[Performance] LCP:', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        console.log('[Performance] FID:', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('[Performance] CLS:', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  },
};

/**
 * Resource hints
 */
export const resourceHints = {
  // Add preconnect to external resources
  preconnect(href: string) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  },

  // Add DNS prefetch
  dnsPrefetch(href: string) {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = href;
    document.head.appendChild(link);
  },

  // Add prefetch for next page resources
  prefetch(href: string) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },
};

/**
 * Web Vitals utilities
 */
export const webVitals = {
  // Measure and report Core Web Vitals
  measureWebVitals() {
    if (typeof window === 'undefined') return {};

    return {
      // Largest Contentful Paint
      LCP: () => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        });
      },

      // First Input Delay
      FID: () => {
        return new Promise<number>((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry: any) => {
              resolve(entry.processingStart - entry.startTime);
            });
          }).observe({ entryTypes: ['first-input'] });
        });
      },

      // Cumulative Layout Shift
      CLS: () => {
        return new Promise<number>((resolve) => {
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            resolve(clsValue);
          }).observe({ entryTypes: ['layout-shift'] });
        });
      },
    };
  },
};
