import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button, Input, Label, Switch, Textarea } from '@tb/ui';

import type { MediaAsset, Service } from '../../../api/types';
import { bannerFormSchema, bannerPlacements, type BannerFormValues } from '../schema';

export type BannerFormProps = {
  services: Service[];
  media: MediaAsset[];
  defaultValues?: Partial<BannerFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: BannerFormValues) => Promise<void>;
};

export const BannerForm: React.FC<BannerFormProps> = ({
  services,
  media,
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
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      placement: defaultValues?.placement ?? 'HOME_HERO',
      title: defaultValues?.title ?? '',
      subtitle: defaultValues?.subtitle ?? undefined,
      ctaLabel: defaultValues?.ctaLabel ?? undefined,
      ctaLink: defaultValues?.ctaLink ?? undefined,
      serviceId: defaultValues?.serviceId ?? undefined,
      mediaId: defaultValues?.mediaId ?? undefined,
      order: defaultValues?.order ?? undefined,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const onSubmitHandler = React.useCallback(
    async (values: BannerFormValues) => {
      await onSubmit(values);
    },
    [onSubmit],
  );

  const disabled = isSubmitting || isFormSubmitting;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmitHandler)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="placement">Плейсмент</Label>
          <select
            id="placement"
            {...register('placement')}
            className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100"
          >
            {bannerPlacements.map((placement) => (
              <option key={placement} value={placement}>
                {placement}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Порядок</Label>
          <Input id="order" type="number" {...register('order')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Заголовок</Label>
        <Input id="title" placeholder="Заголовок баннера" {...register('title')} />
        {errors.title ? <p className="text-xs text-rose-400">{errors.title.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Описание</Label>
        <Textarea id="subtitle" rows={3} {...register('subtitle')} placeholder="Поддерживающий текст" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ctaLabel">Текст кнопки</Label>
          <Input id="ctaLabel" placeholder="Связаться" {...register('ctaLabel')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaLink">Ссылка</Label>
          <Input id="ctaLink" placeholder="https://" {...register('ctaLink')} />
          {errors.ctaLink ? <p className="text-xs text-rose-400">{errors.ctaLink.message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
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
        <div className="space-y-2">
          <Label htmlFor="mediaId">Медиа</Label>
          <select
            id="mediaId"
            {...register('mediaId')}
            className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100"
          >
            <option value="">Не выбрано</option>
            {media.map((item) => (
              <option key={item.id} value={item.id}>
                {item.type} · {item.url}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
          )}
        />
        <div>
          <p className="text-sm font-medium text-white">Активен</p>
          <p className="text-xs text-slate-400">Неактивные баннеры скрываются из выдачи.</p>
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

export default BannerForm;
