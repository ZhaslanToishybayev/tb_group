import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { ServiceForm } from './service-form';

describe('ServiceForm', () => {
  it('submits sanitized data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ServiceForm
        submitLabel="Сохранить"
        onSubmit={onSubmit}
      />,
    );

    await userEvent.type(screen.getByLabelText('Название'), 'Битрикс24');
    await userEvent.type(screen.getByLabelText('Slug'), ' bitrix24 ');
    await userEvent.type(screen.getByLabelText('Краткое описание'), 'CRM для бизнеса');
    await userEvent.type(screen.getByLabelText('Полное описание'), 'Подробности услуги');
    await userEvent.type(screen.getByLabelText('Hero image URL'), ' https://cdn.example.com/hero.png ');
    await userEvent.type(screen.getByLabelText('Иконка'), 'https://cdn.example.com/icon.svg');
    await userEvent.type(screen.getByLabelText('Порядок'), '5');

    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      title: 'Битрикс24',
      slug: 'bitrix24',
      summary: 'CRM для бизнеса',
      description: 'Подробности услуги',
      heroImageUrl: 'https://cdn.example.com/hero.png',
      iconUrl: 'https://cdn.example.com/icon.svg',
      order: 5,
    });
  });
});
