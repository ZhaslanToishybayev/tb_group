import React from 'react';
import { MoreHorizontal, Pencil, Plus, Star, Trash2 } from 'lucide-react';

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

import type { Case, Review, ReviewCreateInput, ReviewUpdateInput } from '../api/types';
import { ApiError } from '../api/http';
import { useCasesQuery } from '../features/cases/api';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useReviewsQuery,
  useUpdateReviewMutation,
} from '../features/reviews/api';
import { ReviewForm, type ReviewFormValues } from '../features/reviews/components/review-form';

const toCreatePayload = (values: ReviewFormValues): ReviewCreateInput => ({
  authorName: values.authorName,
  authorTitle: values.authorTitle,
  company: values.company,
  quote: values.quote,
  reviewType: values.reviewType,
  videoUrl: values.videoUrl,
  videoProvider: values.videoProvider,
  rating: values.rating,
  isFeatured: values.isFeatured,
  isPublished: values.isPublished,
  caseId: values.caseId,
});

const toUpdatePayload = (values: ReviewFormValues): ReviewUpdateInput => ({
  authorName: values.authorName,
  authorTitle: values.authorTitle,
  company: values.company,
  quote: values.quote,
  reviewType: values.reviewType,
  videoUrl: values.videoUrl,
  videoProvider: values.videoProvider,
  rating: values.rating,
  isFeatured: values.isFeatured,
  isPublished: values.isPublished,
  caseId: values.caseId,
});

const findCaseTitle = (cases: Case[], caseId?: string | null) => {
  if (!caseId) return '—';
  return cases.find((item) => item.id === caseId)?.projectTitle ?? '—';
};

export const ReviewsPage: React.FC = () => {
  const { data: cases = [] } = useCasesQuery();
  const { data, isLoading, isError, error } = useReviewsQuery();
  const createReview = useCreateReviewMutation();
  const updateReview = useUpdateReviewMutation();
  const deleteReview = useDeleteReviewMutation();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState<Review | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleCreate = React.useCallback(
    async (values: ReviewFormValues) => {
      setFormError(null);
      try {
        await createReview.mutateAsync(toCreatePayload(values));
        setCreateOpen(false);
        setFeedback('Отзыв создан.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось создать отзыв.');
        }
        throw err;
      }
    },
    [createReview],
  );

  const handleUpdate = React.useCallback(
    async (values: ReviewFormValues) => {
      if (!editingReview) return;
      setFormError(null);
      try {
        await updateReview.mutateAsync({ id: editingReview.id, input: toUpdatePayload(values) });
        setEditingReview(null);
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
    [editingReview, updateReview],
  );

  const handleDelete = React.useCallback(
    async (id: string) => {
      if (!window.confirm('Удалить отзыв?')) return;
      try {
        await deleteReview.mutateAsync(id);
        setFeedback('Отзыв удален.');
      } catch (err) {
        if (err instanceof ApiError) {
          setFeedback(err.message);
        } else {
          setFeedback('Не удалось удалить отзыв.');
        }
      }
    },
    [deleteReview],
  );

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Отзывы</h2>
          <p className="text-sm text-slate-400">Модерируйте отзывы и управляйте приоритетами публикации.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Добавить отзыв
        </Button>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {feedback}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Очередь отзывов</CardTitle>
          <CardDescription>Управляйте статусом публикации и выделенными отзывами.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-400">Загружаем отзывы…</p>
          ) : isError ? (
            <p className="text-sm text-rose-400">Ошибка загрузки: {error instanceof Error ? error.message : 'неизвестно'}.</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-400">Отзывы пока не добавлены.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Автор</TableHead>
                  <TableHead>Компания</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Кейс</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-white">{item.authorName}</TableCell>
                    <TableCell className="text-slate-300">{item.company ?? '—'}</TableCell>
                    <TableCell>{item.reviewType}</TableCell>
                    <TableCell className="text-slate-300">{findCaseTitle(cases, item.caseId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.isPublished ? (
                          <Badge variant="success">опубликован</Badge>
                        ) : (
                          <Badge variant="outline">черновик</Badge>
                        )}
                        {item.isFeatured ? (
                          <Badge variant="warning" className="flex items-center gap-1">
                            <Star className="h-3 w-3" /> выделен
                          </Badge>
                        ) : null}
                      </div>
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
                            onSelect={() => setEditingReview(item)}
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
            <DialogTitle>Новый отзыв</DialogTitle>
          </DialogHeader>
          <ReviewForm
            cases={cases}
            submitLabel={createReview.isPending ? 'Создаем…' : 'Создать'}
            isSubmitting={createReview.isPending}
            error={formError}
            onSubmit={async (values) => {
              await handleCreate(values);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingReview)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingReview(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование отзыва</DialogTitle>
          </DialogHeader>
          {editingReview ? (
            <ReviewForm
              cases={cases}
              defaultValues={{
                authorName: editingReview.authorName,
                authorTitle: editingReview.authorTitle ?? undefined,
                company: editingReview.company ?? undefined,
                quote: editingReview.quote ?? undefined,
                reviewType: editingReview.reviewType,
                videoUrl: editingReview.videoUrl ?? undefined,
                videoProvider: editingReview.videoProvider ?? undefined,
                rating: editingReview.rating ?? undefined,
                isFeatured: editingReview.isFeatured,
                isPublished: editingReview.isPublished,
                caseId: editingReview.caseId ?? undefined,
              }}
              submitLabel={updateReview.isPending ? 'Сохраняем…' : 'Сохранить'}
              isSubmitting={updateReview.isPending}
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

export default ReviewsPage;
