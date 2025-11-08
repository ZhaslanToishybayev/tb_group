import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target } from 'lucide-react';

interface ConversionInsight {
  id: string;
  type: 'funnel_analysis' | 'page_performance' | 'user_journey' | 'content_optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  confidence: number;
  createdAt: string;
}

const severityConfig = {
  low: {
    color: 'bg-blue-100 text-blue-800',
    icon: <Lightbulb className="w-4 h-4" />,
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  high: {
    color: 'bg-orange-100 text-orange-800',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  critical: {
    color: 'bg-red-100 text-red-800',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
};

const typeConfig = {
  funnel_analysis: { label: 'Анализ воронки', icon: <Target className="w-4 h-4" /> },
  page_performance: { label: 'Производительность', icon: <TrendingUp className="w-4 h-4" /> },
  user_journey: { label: 'Путь пользователя', icon: <Brain className="w-4 h-4" /> },
  content_optimization: { label: 'Оптимизация контента', icon: <Lightbulb className="w-4 h-4" /> },
};

export function AIInsights() {
  const [insights, setInsights] = useState<ConversionInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchInsights();
  }, [selectedType]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = selectedType === 'all'
        ? '/api/analytics-ai/insights'
        : `/api/analytics-ai/insights?type=${selectedType}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch insights');
      }

      setInsights(data.data.insights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Генерируем новые insights с тестовыми данными
      const testData = {
        funnelData: [
          { step: 'landing', visitors: 1000, dropOff: 0 },
          { step: 'services', visitors: 700, dropOff: 30 },
          { step: 'contact', visitors: 350, dropOff: 50 },
          { step: 'submitted', visitors: 100, dropOff: 71 },
        ],
        pagePerformance: [
          { page: '/', avgTime: 120, bounceRate: 45 },
          { page: '/services', avgTime: 180, bounceRate: 35 },
          { page: '/contact', avgTime: 240, bounceRate: 25 },
        ],
        userJourneys: [
          { path: '/ → /services → /contact', conversions: 15 },
          { path: '/ → /cases → /services → /contact', conversions: 25 },
          { path: '/ → /contact', conversions: 5 },
        ],
      };

      const response = await fetch('/api/analytics-ai/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate insights');
      }

      setInsights(data.data.insights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">AI Аналитика</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Аналитика</h1>
          <p className="text-muted-foreground">
            Интеллектуальные инсайты для оптимизации конверсии
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchInsights}
            disabled={loading}
          >
            Обновить
          </Button>
          <Button onClick={generateNewInsights} disabled={loading}>
            <Brain className="w-4 h-4 mr-2" />
            Сгенерировать AI Insights
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">Все инсайты</TabsTrigger>
          <TabsTrigger value="funnel_analysis">Воронка</TabsTrigger>
          <TabsTrigger value="page_performance">Страницы</TabsTrigger>
          <TabsTrigger value="user_journey">Путити</TabsTrigger>
          <TabsTrigger value="content_optimization">Контент</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет доступных инсайтов</h3>
                <p className="text-muted-foreground text-center mb-4">
                  AI аналитика пока не накопила достаточно данных для генерации инсайтов.
                </p>
                <Button onClick={generateNewInsights}>
                  <Brain className="w-4 h-4 mr-2" />
                  Сгенерировать тестовые инсайты
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight) => {
                const severity = severityConfig[insight.severity];
                const type = typeConfig[insight.type];

                return (
                  <Card key={insight.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <CardDescription>{insight.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={severity.color}>
                            {severity.icon}
                            <span className="ml-1 capitalize">{insight.severity}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Влияние на бизнес:</h4>
                        <p className="text-sm text-muted-foreground">{insight.impact}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Рекомендация:</h4>
                        <p className="text-sm">{insight.recommendation}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Уверенность: {Math.round(insight.confidence * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {insight.confidence > 0.8 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : insight.confidence > 0.5 ? (
                            <TrendingUp className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(insight.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}