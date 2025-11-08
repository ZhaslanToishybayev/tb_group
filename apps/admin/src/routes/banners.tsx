import React from 'react';
import { ImageIcon, Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';

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
} from '@tb/ui';

import type { Banner, BannerCreateInput, BannerUpdateInput, MediaAsset, Service } from '../api/types';
import { ApiError } from '../api/http';
import { useServicesQuery } from '../features/services/api';
import { useMediaQuery } from '../features/media/api';
import {
  useBannersQuery,
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
} from '../features/banners/api';
import { BannerForm, type BannerFormValues } from '../features/banners/components/banner-form';

const toCreatePayload = (values: BannerFormValues): BannerCreateInput => ({
  placement: values.placement,
  title: values.title,
  subtitle: values.subtitle,
  ctaLabel: values.ctaLabel,
  ctaLink: values.ctaLink,
  serviceId: values.serviceId,
  mediaId: values.mediaId,
  order: values.order,
  isActive: values.isActive,
});

const toUpdatePayload = (values: BannerFormValues): BannerUpdateInput => ({
  placement: values.placement,
  title: values.title,
  subtitle: values.subtitle,
  ctaLabel: values.ctaLabel,
  ctaLink: values.ctaLink,
  serviceId: values.serviceId,
  mediaId: values.mediaId ?? null,
  order: values.order,
  isActive: values.isActive,
});

const describePlacement = (placement: Banner['placement']) => {
  switch (placement) {
    case 'HOME_HERO':
      return 'Главный экран';
    case 'CTA_PRIMARY':
      return 'Основной CTA';
    case 'CTA_SECONDARY':
      return 'Второй CTA';
    default:
      return placement;
  }
};

const findMediaThumbnail = (media: MediaAsset[], banner: Banner) => {
  const attachment = banner.mediaItems?.[0];
  if (!attachment) return null;
  return media.find((item) => item.id === attachment.mediaId) ?? attachment.media;
};

const findServiceTitle = (services: Service[], banner: Banner) => {
  if (!banner.serviceId) return '—';
  return services.find((service) => service.id === banner.serviceId)?.title ?? '—';
};

export const BannersPage: React.FC = () => {
  const { data: services = [] } = useServicesQuery();
  const { data: media = [] } = useMediaQuery();
  const { data, isLoading, isError, error } = useBannersQuery();
  const createBanner = useCreateBannerMutation();
  const updateBanner = useUpdateBannerMutation();
  const deleteBanner = useDeleteBannerMutation();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleCreate = React.useCallback(
    async (values: BannerFormValues) => {
      setFormError(null);
      try {
        await createBanner.mutateAsync(toCreatePayload(values));
        setCreateOpen(false);
        setFeedback('Баннер создан.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось создать баннер.');
        }
        throw err;
      }
    },
    [createBanner],
  );

  const handleUpdate = React.useCallback(
    async (values: BannerFormValues) => {
      if (!editingBanner) return;
      setFormError(null);
      try {
        await updateBanner.mutateAsync({ id: editingBanner.id, input: toUpdatePayload(values) });
        setEditingBanner(null);
        setFeedback('Баннер обновлен.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось сохранить изменения.');
        }
        throw err;
      }
    },
    [editingBanner, updateBanner],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      if (!window.confirm('Удалить баннер?')) return;
      try {
        await deleteBanner.mutateAsync(id);
        setFeedback('Баннер удален.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFeedback(err.message);
        } else {
          setFeedback('Не удалось удалить баннер.');
        }
      }
    },
    [deleteBanner],
  );

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Баннеры</h2>
          <p className="text-sm text-slate-400">Промо-блоки для главной и лендингов.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Новый баннер
        </Button>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {feedback}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Список баннеров</CardTitle>
          <CardDescription>Следите за активностью и связанными ресурсами.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Загружаем баннеры…
            </p>
          ) : isError ? (
            <p className="text-sm text-rose-400">Ошибка загрузки: {error instanceof Error ? error.message : 'неизвестно'}.</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-400">Баннеры пока не созданы.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rows.map((banner) => {
                const mediaAsset = findMediaThumbnail(media, banner);
                return (
                  <div key={banner.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
                          <ImageIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{banner.title}</p>
                          <p className="text-xs text-slate-400">{describePlacement(banner.placement)}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditingBanner(banner)} className="flex items-center gap-2">
                            <Pencil className="h-3.5 w-3.5" /> Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => {
                              void handleDelete(banner.id);
                            }}
                            className="flex items-center gap-2 text-rose-300 focus:bg-rose-500/20 focus:text-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-slate-400">
                      <p>{banner.subtitle ?? '—'}</p>
                      <div className="flex flex-wrap gap-2">
                        {banner.isActive ? (
                          <Badge variant="success">активен</Badge>
                        ) : (
                          <Badge variant="outline">скрыт</Badge>
                        )}
                        <Badge variant="outline">Порядок: {banner.order ?? 0}</Badge>
                        <Badge variant="outline">Услуга: {findServiceTitle(services, banner)}</Badge>
                      </div>
                      {mediaAsset ? (
                        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
                          <p>Медиа: {mediaAsset.type}</p>
                          <a href={mediaAsset.url} className="text-slate-200 hover:text-white" target="_blank" rel="noreferrer">
                            {mediaAsset.url}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
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
            <DialogTitle>Новый баннер</DialogTitle>
          </DialogHeader>
          <BannerForm
            services={services}
            media={media}
            submitLabel={createBanner.isPending ? 'Создаем…' : 'Создать'}
            isSubmitting={createBanner.isPending}
            error={formError}
            onSubmit={async (values) => {
              await handleCreate(values);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingBanner)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBanner(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование баннера</DialogTitle>
          </DialogHeader>
          {editingBanner ? (
            <BannerForm
              services={services}
              media={media}
              defaultValues={{
                placement: editingBanner.placement,
                title: editingBanner.title,
                subtitle: editingBanner.subtitle ?? undefined,
                ctaLabel: editingBanner.ctaLabel ?? undefined,
                ctaLink: editingBanner.ctaLink ?? undefined,
                serviceId: editingBanner.serviceId ?? undefined,
                mediaId: editingBanner.mediaItems?.[0]?.mediaId ?? undefined,
                order: editingBanner.order,
                isActive: editingBanner.isActive,
              }}
              submitLabel={updateBanner.isPending ? 'Сохраняем…' : 'Сохранить'}
              isSubmitting={updateBanner.isPending}
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

export default BannersPage;
