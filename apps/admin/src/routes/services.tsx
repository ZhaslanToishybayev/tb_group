import React from 'react';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';

import {
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

import type { Service, ServiceCreateInput, ServiceUpdateInput } from '../api/types';
import { ApiError } from '../api/http';
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useServicesQuery,
  useUpdateServiceMutation,
} from '../features/services/api';
import { ServiceForm, type ServiceFormValues } from '../features/services/components/service-form';

const toCreatePayload = (values: ServiceFormValues): ServiceCreateInput => ({
  slug: values.slug,
  title: values.title,
  summary: values.summary,
  description: values.description?.trim() ? values.description.trim() : undefined,
  heroImageUrl: values.heroImageUrl,
  iconUrl: values.iconUrl,
  order: values.order,
});

const toUpdatePayload = (values: ServiceFormValues): ServiceUpdateInput => ({
  title: values.title,
  slug: values.slug,
  summary: values.summary,
  description: values.description?.trim() ? values.description.trim() : undefined,
  heroImageUrl: values.heroImageUrl,
  iconUrl: values.iconUrl,
  order: values.order,
});

export const ServicesPage: React.FC = () => {
  const { data, isLoading, isError, error } = useServicesQuery();
  const createService = useCreateServiceMutation();
  const updateService = useUpdateServiceMutation();
  const deleteService = useDeleteServiceMutation();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleCreate = React.useCallback(
    async (values: ServiceFormValues) => {
      setFormError(null);
      try {
        await createService.mutateAsync(toCreatePayload(values));
        setCreateOpen(false);
        setFeedback('Услуга успешно создана.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось сохранить услугу. Попробуйте позже.');
        }
        throw err;
      }
    },
    [createService],
  );

  const handleUpdate = React.useCallback(
    async (values: ServiceFormValues) => {
      if (!editingService) return;
      setFormError(null);
      try {
        await updateService.mutateAsync({ id: editingService.id, input: toUpdatePayload(values) });
        setEditingService(null);
        setFeedback('Изменения сохранены.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось сохранить изменения. Попробуйте позже.');
        }
        throw err;
      }
    },
    [editingService, updateService],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      if (!window.confirm('Удалить услугу? Действие нельзя отменить.')) {
        return;
      }
      try {
        await deleteService.mutateAsync(id);
        setFeedback('Услуга удалена.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFeedback(err.message);
        } else {
          setFeedback('Не удалось удалить услугу.');
        }
      }
    },
    [deleteService],
  );

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Услуги</h2>
          <p className="text-sm text-slate-400">Управляйте предложениями TB Group и видимостью на сайте.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Новая услуга
        </Button>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {feedback}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Список услуг</CardTitle>
          <CardDescription>Создавайте и редактируйте карточки, которые используются на публичном сайте.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-400">Загружаем данные…</p>
          ) : isError ? (
            <p className="text-sm text-rose-400">Не удалось загрузить список: {error instanceof Error ? error.message : 'неизвестная ошибка'}.</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-400">Услуги пока не созданы. Добавьте первую карточку.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Порядок</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium text-white">{service.title}</TableCell>
                    <TableCell className="text-slate-300">{service.slug}</TableCell>
                    <TableCell className="text-slate-400">{service.summary}</TableCell>
                    <TableCell>{service.order ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => setEditingService(service)}
                            className="flex items-center gap-2"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => {
                              void handleDelete(service.id);
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

      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        setFormError(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая услуга</DialogTitle>
          </DialogHeader>
          <ServiceForm
            submitLabel={createService.isPending ? 'Создаем…' : 'Создать'}
            isSubmitting={createService.isPending}
            error={formError}
            onSubmit={async (values) => {
              await handleCreate(values);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingService)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingService(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование услуги</DialogTitle>
          </DialogHeader>
          {editingService ? (
            <ServiceForm
              defaultValues={{
                slug: editingService.slug,
                title: editingService.title,
                summary: editingService.summary,
                description: (editingService.description as string | undefined) ?? '',
                heroImageUrl: editingService.heroImageUrl ?? undefined,
                iconUrl: editingService.iconUrl ?? undefined,
                order: editingService.order,
              }}
              submitLabel={updateService.isPending ? 'Сохраняем…' : 'Сохранить'}
              isSubmitting={updateService.isPending}
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

export default ServicesPage;
