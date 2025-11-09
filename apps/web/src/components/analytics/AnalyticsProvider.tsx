'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (page: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  // Track page views
  useEffect(() => {
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    if (currentPath !== lastTrackedPath.current) {
      lastTrackedPath.current = currentPath;
      trackPageView(currentPath);
    }
  }, [pathname, searchParams]);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }

    // Custom analytics
    console.log('Analytics Event:', eventName, properties);
  };

  const trackPageView = (page: string) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: page,
      });
    }

    // Custom analytics
    console.log('Page View:', page);
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}

// Hook for tracking custom events
export function useTrackEvent() {
  const { trackEvent } = useAnalytics();

  return React.useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      trackEvent(eventName, properties);
    },
    [trackEvent]
  );
}
