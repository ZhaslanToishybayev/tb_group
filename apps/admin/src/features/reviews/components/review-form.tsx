import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button, Input, Label, Switch, Textarea } from '@tb/ui';

import type { Case } from '../../../api/types';
import { reviewFormSchema, reviewTypes, videoProviders, type ReviewFormValues } from '../schema';

export type ReviewFormProps = {
  cases: Case[];
  defaultValues?: Partial<ReviewFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: ReviewFormValues) => Promise<void>;
};

export const ReviewForm: React.FC<ReviewFormProps> = ({
  cases,
  defaultValues,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    watch,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      authorName: defaultValues?.authorName ?? '',
      authorTitle: defaultValues?.authorTitle ?? undefined,
      company: defaultValues?.company ?? undefined,
      quote: defaultValues?.quote ?? undefined,
      reviewType: defaultValues?.reviewType ?? 'TEXT',
      videoUrl: defaultValues?.videoUrl ?? undefined,
      videoProvider: defaultValues?.videoProvider ?? undefined,
      rating: defaultValues?.rating ?? undefined,
      isFeatured: defaultValues?.isFeatured ?? false,
      isPublished: defaultValues?.isPublished ?? true,
      caseId: defaultValues?.caseId ?? undefined,
    },
  });

  const reviewType = watch('reviewType');

  const onSubmitHandler = React.useCallback(
    async (values: ReviewFormValues) => {
      await onSubmit(values);
    },
    [onSubmit],
  );

  const disabled = isSubmitting || isFormSubmitting;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmitHandler)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="authorName">Автор</Label>
          <Input id="authorName" placeholder="Имя" {...register('authorName')} />
          {errors.authorName ? <p className="text-xs text-rose-400">{errors.authorName.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorTitle">Должность</Label>
          <Input id="authorTitle" placeholder="Роль" {...register('authorTitle')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Компания</Label>
        <Input id="company" placeholder="Компания" {...register('company')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quote">Цитата</Label>
        <Textarea id="quote" rows={3} {...register('quote')} placeholder="Текст отзыва" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reviewType">Тип отзыва</Label>
          <select
            id="reviewType"
            {...register('reviewType')}
            className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100"
          >
            {reviewTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'TEXT' ? 'Текстовый' : 'Видео'}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Оценка (0-5)</Label>
          <Input id="rating" type="number" min={0} max={5} {...register('rating')} placeholder="5" />
          {errors.rating ? <p className="text-xs text-rose-400">{errors.rating.message}</p> : null}
        </div>
      </div>
      {reviewType === 'VIDEO' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL видео</Label>
            <Input id="videoUrl" placeholder="https://" {...register('videoUrl')} />
            {errors.videoUrl ? <p className="text-xs text-rose-400">{errors.videoUrl.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoProvider">Платформа</Label>
            <select
              id="videoProvider"
              {...register('videoProvider')}
              className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100"
            >
              <option value="">Не выбрано</option>
              {videoProviders.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
            {errors.videoProvider ? (
              <p className="text-xs text-rose-400">{errors.videoProvider.message}</p>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="caseId">Привязать к кейсу</Label>
        <select
          id="caseId"
          {...register('caseId')}
          className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100"
        >
          <option value="">Не выбрано</option>
          {cases.map((item) => (
            <option key={item.id} value={item.id}>
              {item.projectTitle}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-3">
          <Controller
            control={control}
            name="isPublished"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
            )}
          />
          <div>
            <p className="text-sm font-medium text-white">Опубликовано</p>
            <p className="text-xs text-slate-400">Скрытые отзывы недоступны на сайте.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Controller
            control={control}
            name="isFeatured"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
            )}
          />
          <div>
            <p className="text-sm font-medium text-white">Выделить</p>
            <p className="text-xs text-slate-400">Показывать на главной странице.</p>
          </div>
        </div>
      </div>
      {error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      <Button type="submit" disabled={disabled} className="w-full justify-center">
        {disabled ? 'Сохраняем…' : submitLabel}
      </Button>
    </form>
  );
};

export default ReviewForm;
