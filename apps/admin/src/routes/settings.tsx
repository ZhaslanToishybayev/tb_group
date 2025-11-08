import React from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tb/ui';

import type { ContactSettings, Setting } from '../api/types';
import { ApiError } from '../api/http';
import { useSettingsQuery, useUpdateSettingMutation } from '../features/settings/api';

const CONTACT_SETTING_KEY = 'contact.info';

const parseContactSettings = (settings: Setting[] | undefined): ContactSettings => {
  if (!settings) return {};
  const contact = settings.find((item) => item.key === CONTACT_SETTING_KEY);
  if (!contact?.value || typeof contact.value !== 'object') {
    return {};
  }
  const value = contact.value as Record<string, unknown>;
  return {
    phone: typeof value.phone === 'string' ? value.phone : undefined,
    email: typeof value.email === 'string' ? value.email : undefined,
    address: typeof value.address === 'string' ? value.address : undefined,
    schedule: typeof value.schedule === 'string' ? value.schedule : undefined,
  };
};

export const SettingsPage: React.FC = () => {
  const { data, isLoading, isError, error } = useSettingsQuery();
  const updateSetting = useUpdateSettingMutation();

  const contactDefaults = React.useMemo(() => parseContactSettings(data), [data]);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<ContactSettings>({
    defaultValues: contactDefaults,
    values: contactDefaults,
  });

  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const onSubmit = React.useCallback(
    async (values: ContactSettings) => {
      setFeedback(null);
      setFormError(null);
      try {
        await updateSetting.mutateAsync({ key: CONTACT_SETTING_KEY, value: values });
        setFeedback('Контактные данные сохранены.');
        reset(values, { keepDirty: false });
      } catch (err) {
        if (err instanceof ApiError) {
          setFormError(err.message);
        } else {
          setFormError('Не удалось сохранить изменения.');
        }
      }
    },
    [reset, updateSetting],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Настройки</h2>
        <p className="text-sm text-slate-400">Контакты и системные параметры.</p>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          {feedback}
        </div>
      ) : null}
      {formError ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {formError}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Контактные данные</CardTitle>
          <CardDescription>Используются на сайте и в письмах. Изменения вступают в силу сразу.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" placeholder="+7 (495) 000-00-00" {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="hello@tb.group" type="email" {...register('email')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Адрес</Label>
              <Input id="address" placeholder="г. Москва, ул. Примерная, 1" {...register('address')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="schedule">График работы</Label>
              <Input id="schedule" placeholder="Пн-Пт 09:00-18:00" {...register('schedule')} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting || !isDirty || updateSetting.isPending}>
                {isSubmitting || updateSetting.isPending ? 'Сохраняем…' : 'Сохранить изменения'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Системные параметры</CardTitle>
          <CardDescription>Служебные настройки, полученные из Task Master / API.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-400">Загружаем настройки…</p>
          ) : isError ? (
            <p className="text-sm text-rose-400">Ошибка загрузки: {error instanceof Error ? error.message : 'неизвестно'}.</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-slate-400">Настройки пока не заданы.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ключ</TableHead>
                  <TableHead>Значение</TableHead>
                  <TableHead>Обновлено</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell className="font-medium text-white">{item.key}</TableCell>
                    <TableCell className="text-slate-300">
                      <code className="rounded bg-slate-900/80 px-2 py-1 text-xs">
                        {JSON.stringify(item.value)}
                      </code>
                    </TableCell>
                    <TableCell className="text-slate-400">{new Date(item.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
