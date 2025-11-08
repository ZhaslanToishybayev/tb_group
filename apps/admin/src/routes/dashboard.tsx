import React from 'react';

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tb/ui';

import { useAnalyticsSummaryQuery } from '../features/analytics/api';

type MetricProps = {
  label: string;
  value: React.ReactNode;
  helper?: string;
  tone?: 'default' | 'success' | 'warning' | 'outline';
  loading?: boolean;
};

const MetricCard: React.FC<MetricProps> = ({ label, value, helper, tone = 'default', loading }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between text-base">
        {label}
        {loading ? <Badge variant="outline">обновляем…</Badge> : null}
      </CardTitle>
      {helper ? <CardDescription>{helper}</CardDescription> : null}
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-semibold text-white">
        {loading ? <span className="animate-pulse text-slate-500">…</span> : value}
      </p>
      {tone !== 'default' && !loading ? (
        <Badge variant={tone} className="mt-3">
          {tone === 'success' ? 'в норме' : tone === 'warning' ? 'требует внимания' : 'акцент'}
        </Badge>
      ) : null}
    </CardContent>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const analyticsQuery = useAnalyticsSummaryQuery();
  const summary = analyticsQuery.data;
  const loading = analyticsQuery.isLoading;
  const error = analyticsQuery.error;

  const metrics: MetricProps[] = [
    {
      label: 'Активные услуги',
      value: summary?.services.total ?? 0,
      helper: 'Количество доступных предложений',
    },
    {
      label: 'Публикации кейсов',
      value: summary ? `${summary.cases.published}/${summary.cases.total}` : '—',
      helper: 'Показываются на сайте',
      tone:
        summary && summary.cases.total === summary.cases.published ? 'success' : 'warning',
    },
    {
      label: 'Отзывы в модерации',
      value: summary?.reviews.pending ?? 0,
      helper: 'Требуют подтверждения',
      tone: summary && summary.reviews.pending > 0 ? 'warning' : 'success',
    },
    {
      label: 'Выделенные отзывы',
      value: summary?.reviews.featured ?? 0,
      helper: 'Отображаются на главной странице',
    },
    {
      label: 'Активные баннеры',
      value: summary?.banners.active ?? 0,
      helper: 'Показываются пользователям',
    },
    {
      label: 'Медиа-активы',
      value: summary?.media.total ?? 0,
      helper: 'Доступно для контент-страниц',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">Обзор</h2>
        <p className="text-sm text-slate-400">
          Актуальные данные из контентных разделов и состояния публикаций.
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent>
            <p className="text-sm text-rose-400">
              Не удалось загрузить сводку: {error instanceof Error ? error.message : 'неизвестная ошибка'}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
            tone={metric.tone}
            loading={loading}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Последние кейсы</CardTitle>
            <CardDescription>Обновлены недавно в административной панели.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-400">Загружаем кейсы…</p>
            ) : (summary?.cases?.recent.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-400">Кейсы пока не добавлены.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.cases?.recent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-white">{item.projectTitle}</TableCell>
                      <TableCell className="text-slate-300">{item.clientName}</TableCell>
                      <TableCell>
                        {item.published ? (
                          <Badge variant="success">опубликован</Badge>
                        ) : (
                          <Badge variant="outline">черновик</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Отзывы</CardTitle>
            <CardDescription>Контроль статусов публикации и выделения.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-400">Загружаем отзывы…</p>
            ) : (summary?.reviews?.recent.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-400">Отзывов пока нет.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Автор</TableHead>
                    <TableHead>Компания</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.reviews?.recent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-white">{item.authorName}</TableCell>
                      <TableCell className="text-slate-300">{item.company ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {item.isPublished ? (
                            <Badge variant="success">опубликован</Badge>
                          ) : (
                            <Badge variant="outline">черновик</Badge>
                          )}
                          {item.isFeatured ? <Badge variant="warning">выделен</Badge> : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Что дальше?</CardTitle>
          <CardDescription>
            Подключите аналитические источники (Bitrix24, e-mail, Prometheus), чтобы заполнять карточки
            реальными данными и отслеживать SLA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <p>• Подключите Task Master автоматизации для ежедневного обзора незавершённых задач.</p>
          <p>• Включите интеграцию с аналитикой, чтобы получать конверсию CTA и тепловую карту баннеров.</p>
          <p>• Добавьте отчёт по авто-модерации отзывов, чтобы ускорить публикацию.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
