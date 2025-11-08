import React from 'react';
import { ImageIcon, LinkIcon, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';

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
  Label,
} from '@tb/ui';

import type { MediaAsset, MediaCreateInput, MediaUpdateInput } from '../api/types';
import { ApiError } from '../api/http';
import {
  useCreateMediaMutation,
  useDeleteMediaMutation,
  useMediaQuery,
  useUpdateMediaMutation,
  useUploadMediaFileMutation,
} from '../features/media/api';
import { MediaForm, type MediaFormValues } from '../features/media/components/media-form';

const parseMetadata = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
};

const toCreatePayload = (values: MediaFormValues): MediaCreateInput => ({
  url: values.url,
  type: values.type,
  altText: values.altText,
  mimeType: values.mimeType,
  size: values.size,
  metadata: parseMetadata(values.metadata),
  caseId: values.caseId,
  reviewId: values.reviewId,
});

const toUpdatePayload = (values: MediaFormValues): MediaUpdateInput => ({
  url: values.url,
  type: values.type,
  altText: values.altText,
  mimeType: values.mimeType,
  size: values.size,
  metadata: parseMetadata(values.metadata),
  caseId: values.caseId,
  reviewId: values.reviewId,
});

const describeMedia = (item: MediaAsset) => {
  switch (item.type) {
    case 'IMAGE':
      return 'Изображение';
    case 'VIDEO':
      return 'Видео';
    case 'DOCUMENT':
      return 'Документ';
    default:
      return item.type;
  }
};

export const MediaLibraryPage: React.FC = () => {
  const { data, isLoading, isError, error } = useMediaQuery();
  const createMedia = useCreateMediaMutation();
  const updateMedia = useUpdateMediaMutation();
  const deleteMedia = useDeleteMediaMutation();
  const uploadMedia = useUploadMediaFileMutation();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingMedia, setEditingMedia] = React.useState<MediaAsset | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [createDefaults, setCreateDefaults] = React.useState<Partial<MediaFormValues>>({
    type: 'IMAGE',
  });
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCreate = React.useCallback(
    async (values: MediaFormValues) => {
      setFormError(null);
      try {
        await createMedia.mutateAsync(toCreatePayload(values));
        setCreateOpen(false);
        setCreateDefaults({ type: 'IMAGE' });
        setUploadedFileName(null);
        setFeedback('Медиа-ресурс добавлен.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось добавить медиа.');
        }
        throw err;
      }
    },
    [createMedia],
  );

  const handleUpdate = React.useCallback(
    async (values: MediaFormValues) => {
      if (!editingMedia) return;
      setFormError(null);
      try {
        await updateMedia.mutateAsync({ id: editingMedia.id, input: toUpdatePayload(values) });
        setEditingMedia(null);
        setFeedback('Медиа обновлено.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось сохранить изменения.');
        }
        throw err;
      }
    },
    [editingMedia, updateMedia],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      if (!window.confirm('Удалить медиа-файл?')) return;
      try {
        await deleteMedia.mutateAsync(id);
        setFeedback('Медиа удалено.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFeedback(err.message);
        } else {
          setFeedback('Не удалось удалить медиа.');
        }
      }
    },
    [deleteMedia],
  );

  const handleFileSelected = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setFormError(null);
      setUploadedFileName(file.name);

      try {
        const response = await uploadMedia.mutateAsync(file);
        const assetUrl = response.url ?? response.path;
        const derivedType: MediaFormValues['type'] = file.type.startsWith('image')
          ? 'IMAGE'
          : file.type.startsWith('video')
          ? 'VIDEO'
          : 'DOCUMENT';

        setCreateDefaults((prev) => ({
          ...prev,
          type: derivedType,
          url: assetUrl,
          mimeType: response.mimeType ?? file.type ?? prev?.mimeType,
          size: response.size ?? file.size ?? prev?.size,
        }));
        setFeedback('Файл загружен. Заполните метаданные и сохраните.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось загрузить файл.');
        }
        setUploadedFileName(null);
      } finally {
        if (event.target) {
          event.target.value = '';
        }
      }
    },
    [uploadMedia],
  );

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Медиа-библиотека</h2>
          <p className="text-sm text-slate-400">Управляйте изображениями, видео и файлами для сайта.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Добавить медиа
        </Button>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {feedback}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Хранилище</CardTitle>
          <CardDescription>Отображаются последние загруженные файлы.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-400">Загружаем медиа…</p>
          ) : isError ? (
            <p className="text-sm text-rose-400">Ошибка загрузки: {error instanceof Error ? error.message : 'неизвестно'}.</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-400">Пока нет загруженных файлов.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rows.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{describeMedia(item)}</p>
                        <p className="text-xs text-slate-400">{item.mimeType ?? '—'}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => setEditingMedia(item)}
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
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-3 w-3" />
                      <a href={item.url} target="_blank" rel="noreferrer" className="truncate text-slate-200 hover:text-white">
                        {item.url}
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">ID: {item.id}</Badge>
                      {item.size ? <Badge variant="outline">{Math.round(item.size / 1024)} KB</Badge> : null}
                      {item.caseId ? <Badge variant="outline">Case</Badge> : null}
                      {item.reviewId ? <Badge variant="outline">Review</Badge> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          setFormError(null);
          setUploadedFileName(null);
          if (open) {
            setCreateDefaults({ type: 'IMAGE' });
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новое медиа</DialogTitle>
          </DialogHeader>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <MediaForm
            defaultValues={createDefaults}
            submitLabel={createMedia.isPending ? 'Создаем…' : 'Создать'}
            isSubmitting={createMedia.isPending}
            error={formError}
            extraContent={
              <div className="space-y-2">
                <Label>Загрузка файла</Label>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadMedia.isPending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadMedia.isPending ? 'Загружаем…' : 'Выбрать файл'}
                  </Button>
                  {uploadedFileName ? (
                    <span className="truncate text-slate-200" title={uploadedFileName}>
                      {uploadedFileName}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Можно указать внешний URL без загрузки</span>
                  )}
                </div>
              </div>
            }
            onSubmit={async (values) => {
              await handleCreate(values);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingMedia)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMedia(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование медиа</DialogTitle>
          </DialogHeader>
          {editingMedia ? (
            <MediaForm
              defaultValues={{
                url: editingMedia.url,
                type: editingMedia.type,
                altText: editingMedia.altText ?? undefined,
                mimeType: editingMedia.mimeType ?? undefined,
                size: editingMedia.size ?? undefined,
                metadataRaw:
                  typeof editingMedia.metadata === 'object'
                    ? JSON.stringify(editingMedia.metadata, null, 2)
                    : (editingMedia.metadata as string | undefined),
                caseId: editingMedia.caseId ?? undefined,
                reviewId: editingMedia.reviewId ?? undefined,
              }}
              submitLabel={updateMedia.isPending ? 'Сохраняем…' : 'Сохранить'}
              isSubmitting={updateMedia.isPending}
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

export default MediaLibraryPage;
