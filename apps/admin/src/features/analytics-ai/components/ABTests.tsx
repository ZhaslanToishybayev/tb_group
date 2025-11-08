import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Play, Pause, BarChart3, Settings, Brain } from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: {
    id: string;
    name: string;
    trafficSplit: number;
    conversions: number;
    visitors: number;
    conversionRate: number;
  }[];
  targetMetric: 'conversion_rate' | 'engagement' | 'bounce_rate' | 'time_on_page';
  startDate: string;
  endDate?: string;
  winner?: string;
}

const targetMetrics = {
  conversion_rate: 'Конверсия',
  engagement: 'Вовлеченность',
  bounce_rate: 'Отказы',
  time_on_page: 'Время на странице',
};

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Черновик' },
  running: { color: 'bg-green-100 text-green-800', label: 'Запущен' },
  paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Приостановлен' },
  completed: { color: 'bg-blue-100 text-blue-800', label: 'Завершен' },
};

export function ABTests() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetMetric: 'conversion_rate' as const,
    startDate: new Date().toISOString().split('T')[0],
  });

  const createTest = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/analytics-ai/ab-test/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          variants: [
            {
              id: 'control',
              name: 'Контрольная группа',
              content: { /* текущий контент */ },
              trafficSplit: 50,
            },
            {
              id: 'variant-a',
              name: 'Вариант A (AI оптимизированный)',
              content: { /* AI-генерированный контент */ },
              trafficSplit: 50,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create test');
      }

      setTests([...tests, data.data]);
      setDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        targetMetric: 'conversion_rate',
        startDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Failed to create test:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">A/B Тестирование</h1>
          <p className="text-muted-foreground">
            Smart A/B тесты с AI оптимизацией
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать тест
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать AI-powered A/B тест</DialogTitle>
              <DialogDescription>
                Создайте умный A/B тест с AI оптимизацией контента
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название теста</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Тест главной страницы"
                />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Описание цели теста..."
                />
              </div>
              <div>
                <Label htmlFor="metric">Целевая метрика</Label>
                <Select
                  value={formData.targetMetric}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, targetMetric: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(targetMetrics).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Дата начала</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={createTest} disabled={loading}>
                  <Brain className="w-4 h-4 mr-2" />
                  Создать AI тест
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="draft">Черновики</TabsTrigger>
          <TabsTrigger value="completed">Завершенные</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {tests.filter((test) => test.status === 'running').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет активных тестов</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Создайте первый AI-powered A/B тест для оптимизации конверсии
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Brain className="w-4 h-4 mr-2" />
                  Создать AI тест
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tests
                .filter((test) => test.status === 'running')
                .map((test) => (
                  <Card key={test.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{test.name}</CardTitle>
                          <CardDescription>{test.description}</CardDescription>
                        </div>
                        <Badge className={statusConfig[test.status].color}>
                          {statusConfig[test.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Варианты:</h4>
                        <div className="space-y-2">
                          {test.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="flex items-center justify-between p-2 bg-muted rounded"
                            >
                              <span className="font-medium">{variant.name}</span>
                              <div className="flex items-center gap-4 text-sm">
                                <span>
                                  {variant.conversionRate.toFixed(2)}%
                                </span>
                                <span className="text-muted-foreground">
                                  {variant.visitors} посетителей
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          <span className="text-sm text-muted-foreground">
                            {targetMetrics[test.targetMetric]}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {tests
            .filter((test) => test.status === 'draft')
            .map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                    <Badge className={statusConfig[test.status].color}>
                      {statusConfig[test.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Начать: {new Date(test.startDate).toLocaleDateString('ru-RU')}
                    </div>
                    <Button>
                      <Play className="w-4 h-4 mr-2" />
                      Запустить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {tests
            .filter((test) => test.status === 'completed')
            .map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                    <Badge className={statusConfig[test.status].color}>
                      {statusConfig[test.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Победитель:</h4>
                    <p className="text-sm">
                      {test.variants.find((v) => v.id === test.winner)?.name}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Завершен: {test.endDate ? new Date(test.endDate).toLocaleDateString('ru-RU') : 'Не указано'}</span>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Посмотреть результаты
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}