import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button, Input, Label, Textarea } from '@tb/ui';

import { serviceFormSchema, type ServiceFormValues } from '../schema';

export type ServiceFormProps = {
  defaultValues?: Partial<ServiceFormValues>;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
};

export const ServiceForm: React.FC<ServiceFormProps> = ({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  error,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      slug: defaultValues?.slug ?? '',
      title: defaultValues?.title ?? '',
      summary: defaultValues?.summary ?? '',
      description: defaultValues?.description ?? '',
      heroImageUrl: defaultValues?.heroImageUrl ?? '',
      iconUrl: defaultValues?.iconUrl ?? '',
      order: defaultValues?.order ?? undefined,
    },
  });

  const submitHandler = React.useCallback(
    async (values: ServiceFormValues) => {
      await onSubmit(values);
    },
    [onSubmit],
  );

  const disabled = isSubmitting || isFormSubmitting;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submitHandler)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Название</Label>
          <Input id="title" {...register('title')} placeholder="Внедрение Битрикс24" />
          {errors.title ? <p className="text-xs text-rose-400">{errors.title.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register('slug')} placeholder="bitrix24" />
          {errors.slug ? <p className="text-xs text-rose-400">{errors.slug.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Краткое описание</Label>
        <Textarea id="summary" rows={3} {...register('summary')} placeholder="Кратко о предложении" />
        {errors.summary ? <p className="text-xs text-rose-400">{errors.summary.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Полное описание</Label>
        <Textarea id="description" rows={5} {...register('description')} placeholder="Расскажите подробнее об услуге" />
        {errors.description ? <p className="text-xs text-rose-400">{errors.description.message}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="heroImageUrl">Hero image URL</Label>
          <Input id="heroImageUrl" {...register('heroImageUrl')} placeholder="https://..." />
          {errors.heroImageUrl ? (
            <p className="text-xs text-rose-400">{errors.heroImageUrl.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="iconUrl">Иконка</Label>
          <Input id="iconUrl" {...register('iconUrl')} placeholder="https://..." />
          {errors.iconUrl ? <p className="text-xs text-rose-400">{errors.iconUrl.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="order">Порядок</Label>
        <Input id="order" type="number" {...register('order')} placeholder="0" />
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

export default ServiceForm;
