import React from 'react';
import { BarChart3, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tb/ui';

import type { Case, CaseCreateInput, CaseUpdateInput, Service } from '../api/types';
import { ApiError } from '../api/http';
import { useServicesQuery } from '../features/services/api';
import {
  useCasesQuery,
  useCreateCaseMutation,
  useDeleteCaseMutation,
  useUpdateCaseMutation,
} from '../features/cases/api';
import { CaseForm, type CaseFormValues } from '../features/cases/components/case-form';

const parseMetrics = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
};

const toCreatePayload = (values: CaseFormValues): CaseCreateInput => ({
  slug: values.slug,
  projectTitle: values.projectTitle,
  clientName: values.clientName,
  industry: values.industry,
  summary: values.summary,
  challenge: values.challenge,
  solution: values.solution,
  results: values.results,
  metrics: parseMetrics(values.metrics),
  category: values.category,
  serviceId: values.serviceId,
  heroImageUrl: values.heroImageUrl,
  videoUrl: values.videoUrl,
  published: values.published,
  publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
});

const toUpdatePayload = (values: CaseFormValues): CaseUpdateInput => ({
  projectTitle: values.projectTitle,
  slug: values.slug,
  clientName: values.clientName,
  industry: values.industry,
  summary: values.summary,
  challenge: values.challenge,
  solution: values.solution,
  results: values.results,
  metrics: parseMetrics(values.metrics),
  category: values.category,
  serviceId: values.serviceId,
  heroImageUrl: values.heroImageUrl,
  videoUrl: values.videoUrl,
  published: values.published,
  publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
});

const formatMetrics = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return undefined;
  }
};

const findServiceTitle = (services: Service[], serviceId?: string | null) => {
  if (!serviceId) return '—';
  return services.find((service) => service.id === serviceId)?.title ?? '—';
};

export const CasesPage: React.FC = () => {
  const { data: services = [] } = useServicesQuery();
  const { data, isLoading, isError, error } = useCasesQuery();
  const createCase = useCreateCaseMutation();
  const updateCase = useUpdateCaseMutation();
  const deleteCase = useDeleteCaseMutation();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingCase, setEditingCase] = React.useState<Case | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleCreate = React.useCallback(
    async (values: CaseFormValues) => {
      setFormError(null);
      try {
        await createCase.mutateAsync(toCreatePayload(values));
        setCreateOpen(false);
        setFeedback('Кейс создан.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось создать кейс.');
        }
        throw err;
      }
    },
    [createCase],
  );

  const handleUpdate = React.useCallback(
    async (values: CaseFormValues) => {
      if (!editingCase) return;
      setFormError(null);
      try {
        await updateCase.mutateAsync({ id: editingCase.id, input: toUpdatePayload(values) });
        setEditingCase(null);
        setFeedback('Изменения сохранены.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось сохранить изменения.');
        }
        throw err;
      }
    },
    [editingCase, updateCase],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      if (!window.confirm('Удалить кейс? Действие нельзя отменить.')) return;
      try {
        await deleteCase.mutateAsync(id);
        setFeedback('Кейс удален.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFeedback(err.message);
        } else {
          setFeedback('Не удалось удалить кейс.');
        }
      }
    },
    [deleteCase],
  );

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Кейсы</h2>
          <p className="text-sm text-slate-400">Истории успеха клиентов TB Group.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Добавить кейс
        </Button>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {feedback}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Публикации
          </CardTitle>
          <CardDescription>Следите за статусом публикации и связанными услугами.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-400">Загружаем кейсы…</p>
          ) : isError ? (
            <p className="text-sm text-rose-400">Ошибка загрузки: {error instanceof Error ? error.message : 'неизвестно'}.</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-400">Кейсы пока не добавлены.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Услуга</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-white">{item.projectTitle}</TableCell>
                    <TableCell className="text-slate-300">{item.clientName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-slate-300">{findServiceTitle(services, item.serviceId)}</TableCell>
                    <TableCell>
                      {item.published ? (
                        <Badge variant="success">опубликован</Badge>
                      ) : (
                        <Badge variant="outline">скрыт</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => setEditingCase(item)}
                            className="flex items-center gap-2"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => {
                              void handleDelete(item.id);
                            }}
                            className="flex items-center gap-2 text-rose-300 focus:bg-rose-500/20 focus:text-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          setFormError(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новый кейс</DialogTitle>
          </DialogHeader>
          <CaseForm
            services={services}
            submitLabel={createCase.isPending ? 'Создаем…' : 'Создать'}
            isSubmitting={createCase.isPending}
            error={formError}
            onSubmit={async (values) => {
              await handleCreate(values);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingCase)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCase(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование кейса</DialogTitle>
          </DialogHeader>
          {editingCase ? (
            <CaseForm
              services={services}
              defaultValues={{
                slug: editingCase.slug,
                projectTitle: editingCase.projectTitle,
                clientName: editingCase.clientName,
                industry: editingCase.industry ?? undefined,
                summary: editingCase.summary,
                challenge: editingCase.challenge ?? undefined,
                solution: editingCase.solution ?? undefined,
                results: editingCase.results ?? undefined,
                metricsRaw: formatMetrics(editingCase.metrics),
                category: editingCase.category,
                serviceId: editingCase.serviceId ?? undefined,
                heroImageUrl: editingCase.heroImageUrl ?? undefined,
                videoUrl: editingCase.videoUrl ?? undefined,
                published: editingCase.published,
                publishedAt: editingCase.publishedAt ?? undefined,
              }}
              submitLabel={updateCase.isPending ? 'Сохраняем…' : 'Сохранить'}
              isSubmitting={updateCase.isPending}
              error={formError}
              onSubmit={async (values) => {
                await handleUpdate(values);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CasesPage;
