import OpenAI from 'openai';
import { cacheService } from '../cache/cache.service';
import { logger } from '../../middleware/logger';

export interface UserBehavior {
  userId?: string;
  sessionId: string;
  pageUrl: string;
  eventType: 'page_view' | 'click' | 'form_submit' | 'scroll' | 'time_spent';
  timestamp: Date;
  duration?: number; // для time_spent событий
  metadata?: Record<string, any>;
}

export interface ConversionInsight {
  id: string;
  type: 'funnel_analysis' | 'page_performance' | 'user_journey' | 'content_optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  data: Record<string, any>;
  confidence: number; // 0-1
  createdAt: Date;
}

export interface ABLTestConfig {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    name: string;
    content: Record<string, any>;
    trafficSplit: number; // 0-100
  }[];
  targetMetric: 'conversion_rate' | 'engagement' | 'bounce_rate' | 'time_on_page';
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export class AnalyticsAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Анализ поведения пользователей с AI
  async analyzeUserBehavior(events: UserBehavior[]): Promise<ConversionInsight[]> {
    try {
      // Группируем события по сессиям
      const sessions = this.groupEventsBySession(events);

      // Анализируем каждую сессию с AI
      const insights: ConversionInsight[] = [];

      for (const [sessionId, sessionEvents] of sessions) {
        const sessionInsight = await this.analyzeSessionWithAI(sessionEvents);
        if (sessionInsight) {
          insights.push(sessionInsight);
        }
      }

      // Кэшируем результаты
      const cacheKey = `ai-insights:${Date.now()}`;
      await cacheService.set(cacheKey, insights, 3600); // 1 час

      return insights;
    } catch (error) {
      logger.error({ error }, 'Failed to analyze user behavior');
      throw error;
    }
  }

  // Генерация AI insights для конверсии
  async generateConversionInsights(data: {
    funnelData: any[];
    pagePerformance: any[];
    userJourneys: any[];
  }): Promise<ConversionInsight[]> {
    const prompt = `
Проанализируй данные конверсии веб-сайта и предоставь инсайты:

Воронка продаж: ${JSON.stringify(data.funnelData, null, 2)}
Производительность страниц: ${JSON.stringify(data.pagePerformance, null, 2)}
Пользовательские пути: ${JSON.stringify(data.userJourneys, null, 2)}

Для каждого инсайта предоставь:
1. Тип (funnel_analysis, page_performance, user_journey, content_optimization)
2. Серьезность (low, medium, high, critical)
3. Название проблемы/возможности
4. Описание ситуации
5. Влияние на бизнес
6. Конкретные рекомендации
7. Уровень уверенности (0-1)

Ответь только в формате JSON массива объектов.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Ты эксперт по веб-аналитике и оптимизации конверсии. Анализируй данные и предоставляй практические инсайты на русском языке.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      const insights = JSON.parse(response);

      // Валидация и обработка инсайтов
      return insights.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`,
        type: insight.type || 'funnel_analysis',
        severity: insight.severity || 'medium',
        title: insight.title || 'AI Insight',
        description: insight.description || 'AI-generated insight',
        impact: insight.impact || 'Impact analysis needed',
        recommendation: insight.recommendation || 'Recommendation pending',
        data: insight.data || {},
        confidence: Math.min(Math.max(insight.confidence || 0.7, 0), 1),
        createdAt: new Date(),
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to generate conversion insights');
      throw error;
    }
  }

  // Smart A/B тестирование с AI
  async createSmartABTest(config: Omit<ABLTestConfig, 'id' | 'status'>): Promise<ABLTestConfig> {
    const abTest: ABLTestConfig = {
      id: `ab-test-${Date.now()}`,
      ...config,
      status: 'draft',
    };

    // Генерируем AI-оптимизированные варианты
    if (config.variants.length === 1) {
      const baseVariant = config.variants[0];
      const aiVariants = await this.generateAIVariants(baseVariant);

      abTest.variants = [
        baseVariant,
        ...aiVariants.slice(0, 2), // Максимум 3 варианта всего
      ];

      // Распределяем трафик равномерно
      const trafficPerVariant = Math.floor(100 / abTest.variants.length);
      abTest.variants = abTest.variants.map((variant, index) => ({
        ...variant,
        trafficSplit: index === abTest.variants.length - 1
          ? 100 - (trafficPerVariant * (abTest.variants.length - 1))
          : trafficPerVariant
      }));
    }

    // Кэшируем конфигурацию теста
    await cacheService.set(
      `ab-test:${abTest.id}`,
      abTest,
      30 * 24 * 3600 * 1000 // 30 дней
    );

    return abTest;
  }

  // Анализ результатов A/B тестов с AI
  async analyzeABTestResults(testId: string, results: any): Promise<{
    winner: string;
    confidence: number;
    insights: string[];
    recommendation: string;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Ты эксперт по A/B тестированию. Проанализируй результаты и дай рекомендации.'
          },
          {
            role: 'user',
            content: `
Проанализируй результаты A/B теста:

Тест ID: ${testId}
Результаты: ${JSON.stringify(results, null, 2)}

Предоставь:
1. Победивший вариант (variant ID)
2. Уровень уверенности (0-1)
3. Ключевые инсайты (массив строк)
4. Рекомендации для следующих шагов

Ответь в формате JSON.
`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      return JSON.parse(response);
    } catch (error) {
      logger.error({ error, testId }, 'Failed to analyze A/B test results');
      throw error;
    }
  }

  // Персонализация контента с AI
  async personalizeContent(userProfile: {
    userId: string;
    behavior: UserBehavior[];
    demographics?: Record<string, any>;
    preferences?: Record<string, any>;
  }): Promise<{
    recommendations: any[];
    content: Record<string, any>;
    nextActions: string[];
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Ты эксперт по персонализации контента. Создавай персонализированные рекомендации на основе поведения пользователя.'
          },
          {
            role: 'user',
            content: `
Персонализируй контент для пользователя:

Профиль: ${JSON.stringify(userProfile, null, 2)}

Предоставь:
1. Рекомендации услуг/продуктов (массив объектов)
2. Персонализированный контент (объект с разными секциями)
3. Следующие действия (массив строк)

Ответь в формате JSON.
`
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      const personalization = JSON.parse(response);

      // Кэшируем персонализацию
      await cacheService.set(
        `personalization:${userProfile.userId}`,
        personalization,
        3600 // 1 час
      );

      return personalization;
    } catch (error) {
      logger.error({ error, userId: userProfile.userId }, 'Failed to personalize content');
      throw error;
    }
  }

  // AI-powered chatbot для поддержки
  async generateChatbotResponse(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: {
      userProfile?: any;
      currentPage?: string;
      services?: any[];
    } = {}
  ): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Ты AI-помощник TB Group - компании по внедрению облачных решений (Мой Склад, Битрикс24, Телефония).

Контекст: ${JSON.stringify(context, null, 2)}

Всегда отвечай на русском языке, будь дружелюбным и профессиональным.
Помогай с вопросами о наших услугах, ценах, внедрении.
Если не знаешь ответ - честно скажи и предложи связаться с экспертом.`
          },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0].message.content || 'Извините, произошла ошибка. Попробуйте позже.';
    } catch (error) {
      logger.error({ error }, 'Failed to generate chatbot response');
      return 'Извините, произошла ошибка. Попробуйте позже.';
    }
  }

  // Получение AI insights из кэша
  async getCachedInsights(type?: string): Promise<ConversionInsight[]> {
    const pattern = type ? `ai-insights:*:${type}` : 'ai-insights:*';
    const keys = await this.getCachedKeys(pattern);

    const insights: ConversionInsight[] = [];
    for (const key of keys) {
      const cached = await cacheService.get(key);
      if (cached) {
        insights.push(...cached);
      }
    }

    return insights;
  }

  // Вспомогательные методы
  private groupEventsBySession(events: UserBehavior[]): Map<string, UserBehavior[]> {
    const sessions = new Map<string, UserBehavior[]>();

    events.forEach(event => {
      const sessionId = event.sessionId;
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, []);
      }
      sessions.get(sessionId)!.push(event);
    });

    return sessions;
  }

  private async analyzeSessionWithAI(events: UserBehavior[]): Promise<ConversionInsight | null> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Анализируй поведение пользователя на сайте и определи потенциальные проблемы или возможности.'
          },
          {
            role: 'user',
            content: `События сессии: ${JSON.stringify(events, null, 2)}

Определи:
1. Тип инсайта (funnel_analysis, page_performance, user_journey, content_optimization)
2. Серьезность (low, medium, high, critical)
3. Название
4. Описание
5. Влияние
6. Рекомендация
7. Уверенность (0-1)

Ответь только JSON объектом или null если инсайтов нет.`
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const response = completion.choices[0].message.content;
      if (!response || response === 'null') {
        return null;
      }

      const insight = JSON.parse(response);
      return {
        id: `session-insight-${Date.now()}`,
        ...insight,
        data: { sessionEvents: events.length },
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error({ error }, 'Failed to analyze session with AI');
      return null;
    }
  }

  private async generateAIVariants(baseVariant: any): Promise<any[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Генерируй варианты A/B теста для оптимизации конверсии. Создавай конкретные изменения в контенте.'
          },
          {
            role: 'user',
            content: `
Базовый вариант: ${JSON.stringify(baseVariant, null, 2)}

Создай 2 альтернативных варианта с конкретными изменениями в контенте для улучшения конверсии.
Ответь массивом JSON объектов с полями: id, name, content.
`
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        return [];
      }

      return JSON.parse(response);
    } catch (error) {
      logger.error({ error }, 'Failed to generate AI variants');
      return [];
    }
  }

  private async getCachedKeys(pattern: string): Promise<string[]> {
    // Простая реализация - в реальном проекте нужно использовать Redis SCAN
    return [];
  }
}

export const analyticsAIService = new AnalyticsAIService();