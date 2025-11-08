import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button, Input, Label, Switch, Textarea } from '@tb/ui';

import type { Service } from '../../../api/types';
import { caseFormSchema, serviceCategories, type CaseFormValues } from '../schema';

export type CaseFormProps = {
  services: Service[];
  defaultValues?: Partial<CaseFormValues> & { metricsRaw?: string };
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: CaseFormValues) => Promise<void>;
};

const formatDateInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const iso = date.toISOString();
  return iso.slice(0, 16);
};

export const CaseForm: React.FC<CaseFormProps> = ({
  services,
  defaultValues,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
    setValue,
    watch,
  } = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      slug: defaultValues?.slug ?? '',
      projectTitle: defaultValues?.projectTitle ?? '',
      clientName: defaultValues?.clientName ?? '',
      summary: defaultValues?.summary ?? '',
      industry: defaultValues?.industry ?? undefined,
      challenge: defaultValues?.challenge ?? undefined,
      solution: defaultValues?.solution ?? undefined,
      results: defaultValues?.results ?? undefined,
      metrics: defaultValues?.metrics ?? defaultValues?.metricsRaw ?? undefined,
      category: defaultValues?.category ?? serviceCategories[0],
      serviceId: defaultValues?.serviceId ?? undefined,
      heroImageUrl: defaultValues?.heroImageUrl ?? undefined,
      videoUrl: defaultValues?.videoUrl ?? undefined,
      published: defaultValues?.published ?? true,
      publishedAt: defaultValues?.publishedAt ?? undefined,
    },
  });

  const publishedAtValue = watch('publishedAt');

  const onSubmitHandler = React.useCallback(
    async (values: CaseFormValues) => {
      await onSubmit(values);
    },
    [onSubmit],
  );

  const disabled = isSubmitting || isFormSubmitting;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmitHandler)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="projectTitle">Название кейса</Label>
          <Input id="projectTitle" placeholder="Проект" {...register('projectTitle')} />
          {errors.projectTitle ? (
            <p className="text-xs text-rose-400">{errors.projectTitle.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" placeholder="project-slug" {...register('slug')} />
          {errors.slug ? <p className="text-xs text-rose-400">{errors.slug.message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientName">Клиент</Label>
          <Input id="clientName" placeholder="Компания" {...register('clientName')} />
          {errors.clientName ? <p className="text-xs text-rose-400">{errors.clientName.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Отрасль</Label>
          <Input id="industry" placeholder="IT, Retail…" {...register('industry')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Краткое описание</Label>
        <Textarea id="summary" rows={3} {...register('summary')} placeholder="Основной результат" />
        {errors.summary ? <p className="text-xs text-rose-400">{errors.summary.message}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Категория</Label>
          <select
            id="category"
            {...register('category')}
            className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100"
          >
            {serviceCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category ? <p className="text-xs text-rose-400">{errors.category.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceId">Связанная услуга</Label>
          <select
            id="serviceId"
            {...register('serviceId')}
            className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100"
          >
            <option value="">Не выбрано</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="heroImageUrl">Hero image</Label>
          <Input id="heroImageUrl" placeholder="https://..." {...register('heroImageUrl')} />
          {errors.heroImageUrl ? (
            <p className="text-xs text-rose-400">{errors.heroImageUrl.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Видео</Label>
          <Input id="videoUrl" placeholder="https://..." {...register('videoUrl')} />
          {errors.videoUrl ? <p className="text-xs text-rose-400">{errors.videoUrl.message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="challenge">Задача</Label>
          <Textarea id="challenge" rows={2} {...register('challenge')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="solution">Решение</Label>
          <Textarea id="solution" rows={2} {...register('solution')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="results">Результаты</Label>
        <Textarea id="results" rows={2} {...register('results')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="metrics">Метрики (JSON или текст)</Label>
        <Textarea id="metrics" rows={2} {...register('metrics')} placeholder='{"growth": "+35%"}' />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-3">
          <Controller
            control={control}
            name="published"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
            )}
          />
          <div>
            <p className="text-sm font-medium text-white">Опубликовано</p>
            <p className="text-xs text-slate-400">Скрытые кейсы не отображаются на сайте.</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="publishedAt">Дата публикации</Label>
          <Input
            id="publishedAt"
            type="datetime-local"
            value={formatDateInput(publishedAtValue)}
            onChange={(event) => setValue('publishedAt', event.target.value || undefined)}
          />
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

export default CaseForm;
