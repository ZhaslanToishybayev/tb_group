export interface AIAnalyticsConfig {
  openaiApiKey?: string;
  enabled: boolean;
  cacheTtl: number; // в секундах
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface DashboardWidget {
  id: string;
  type: 'insights' | 'ab_test' | 'personalization' | 'funnel' | 'heatmap';
  title: string;
  description?: string;
  data: any;
  refreshInterval?: number; // в секундах
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: {
    demographics?: Record<string, any>;
    behavior?: {
      pagesVisited?: string[];
      minTimeSpent?: number;
      maxTimeSpent?: number;
      events?: string[];
    };
    conversion?: {
      madePurchase?: boolean;
      submittedForm?: boolean;
      downloadedFile?: boolean;
    };
  };
  size: number;
  conversionRate?: number;
  avgSessionDuration?: number;
}

export interface PredictiveInsight {
  id: string;
  type: 'churn_risk' | 'conversion_likelihood' | 'next_best_action' | 'content_recommendation';
  userId?: string;
  segment?: string;
  title: string;
  description: string;
  prediction: {
    probability: number; // 0-1
    confidence: number; // 0-1
    impact: 'low' | 'medium' | 'high' | 'critical';
  };
  recommendation: string;
  actionItems: string[];
  createdAt: Date;
  expiresAt: Date;
}

export interface ContentOptimization {
  id: string;
  pageUrl: string;
  section: string;
  currentContent: any;
  optimizedContent: any;
  expectedImprovement: {
    metric: 'conversion_rate' | 'engagement' | 'time_on_page' | 'bounce_rate';
    improvement: number; // в процентах
    confidence: number; // 0-1
  };
  testConfig?: {
    variants: number;
    duration: number; // в днях
    trafficPercentage: number;
  };
  status: 'draft' | 'testing' | 'completed' | 'implemented';
}