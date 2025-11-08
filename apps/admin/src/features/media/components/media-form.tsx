import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button, Input, Label, Textarea } from '@tb/ui';

import { mediaFormSchema, mediaTypes, type MediaFormValues } from '../schema';

export type MediaFormProps = {
  defaultValues?: Partial<MediaFormValues> & { metadataRaw?: string };
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: MediaFormValues) => Promise<void>;
  extraContent?: React.ReactNode;
};

export const MediaForm: React.FC<MediaFormProps> = ({
  defaultValues,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  extraContent,
}) => {
  const defaults = React.useMemo<MediaFormValues>(() => {
    return {
      url: defaultValues?.url ?? '',
      type: defaultValues?.type ?? 'IMAGE',
      altText: defaultValues?.altText ?? undefined,
      mimeType: defaultValues?.mimeType ?? undefined,
      size: defaultValues?.size ?? undefined,
      metadata: defaultValues?.metadata ?? defaultValues?.metadataRaw ?? undefined,
      caseId: defaultValues?.caseId ?? undefined,
      reviewId: defaultValues?.reviewId ?? undefined,
    };
  }, [defaultValues]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
    reset,
  } = useForm<MediaFormValues>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: defaults,
  });

  React.useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const onSubmitHandler = React.useCallback(
    async (values: MediaFormValues) => {
      await onSubmit(values);
    },
    [onSubmit],
  );

  const disabled = isSubmitting || isFormSubmitting;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmitHandler)}>
      {extraContent}
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input id="url" placeholder="https://..." {...register('url')} />
        {errors.url ? <p className="text-xs text-rose-400">{errors.url.message}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Тип</Label>
          <select
            id="type"
            {...register('type')}
            className="h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100"
          >
            {mediaTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mimeType">MIME тип</Label>
          <Input id="mimeType" placeholder="image/png" {...register('mimeType')} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="altText">ALT текст</Label>
          <Input id="altText" placeholder="Описание" {...register('altText')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Размер (байты)</Label>
          <Input id="size" type="number" min={0} step={1} {...register('size')} />
          {errors.size ? <p className="text-xs text-rose-400">{errors.size.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="metadata">Метаданные (JSON)</Label>
        <Textarea id="metadata" rows={3} {...register('metadata')} placeholder='{"caption": "..."}' />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="caseId">Кейс</Label>
          <Input id="caseId" placeholder="ID кейса" {...register('caseId')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reviewId">Отзыв</Label>
          <Input id="reviewId" placeholder="ID отзыва" {...register('reviewId')} />
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

export default MediaForm;
