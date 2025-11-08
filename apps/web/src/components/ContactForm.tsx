'use client';

import { useState, type FormEvent } from 'react';

import { submitContact, type ContactRequestPayload } from '../lib/api';
import { CaptchaGate } from './CaptchaGate';

type ContactFormProps = {
  defaultServiceInterest?: string;
  hideServiceSelect?: boolean;
};

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

type FormErrors = {
  fullName?: string;
  email?: string;
  phone?: string;
  general?: string;
};

function ContactFormInner({ defaultServiceInterest, hideServiceSelect = false }: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showAdditional, setShowAdditional] = useState(false);

  const validateForm = (formData: FormData): FormErrors => {
    const errors: FormErrors = {};
    
    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();

    if (!fullName) {
      errors.fullName = 'Пожалуйста, введите ваше имя и фамилию';
    } else if (fullName.length < 2) {
      errors.fullName = 'Имя должно содержать минимум 2 символа';
    }

    if (!email) {
      errors.email = 'Пожалуйста, введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Пожалуйста, введите корректный email';
    }

    if (!phone) {
      errors.phone = 'Пожалуйста, введите номер телефона';
    } else if (!/^[+]?[0-9\s\-()]{10,}$/.test(phone.replace(/\s/g, ''))) {
      errors.phone = 'Пожалуйста, введите корректный номер телефона';
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setStatus('error');
      return;
    }

    // Get reCAPTCHA token
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      // Trigger reCAPTCHA
      const recaptchaTrigger = document.querySelector('[data-testid="recaptcha-trigger"]') as HTMLButtonElement;
      recaptchaTrigger?.click();
      return;
    }

    const payload: ContactRequestPayload = {
      fullName: String(formData.get('fullName') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      company: formData.get('company')?.toString().trim() || undefined,
      message: formData.get('message')?.toString().trim() || undefined,
      serviceInterest: (formData.get('serviceInterest')?.toString() || defaultServiceInterest || undefined) ?? undefined,
      recaptchaToken: recaptchaToken || undefined,
    };

    try {
      await submitContact(payload);
      setStatus('success');
      form.reset();
      setRecaptchaToken(null);
      setFormErrors({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить заявку');
      setStatus('error');
    }
  };

  // Show reCAPTCHA warning if site key is missing
  if (!RECAPTCHA_SITE_KEY && typeof window !== 'undefined') {
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 mb-4">
        <p className="text-sm text-yellow-300">
          ⚠️ reCAPTCHA не настроен. Пожалуйста, добавьте NEXT_PUBLIC_RECAPTCHA_SITE_KEY в .env файл.
        </p>
      </div>
    );
  }

  return (
    <CaptchaGate onToken={setRecaptchaToken}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="fullName">
            Имя и фамилия <span className="text-red-400">*</span>
          </label>
          <input
            required
            id="fullName"
            name="fullName"
            className={`rounded border bg-slate-900/60 px-3 py-2 ${
              formErrors.fullName
                ? 'border-red-500/50 text-red-300'
                : 'border-white/10 text-white'
            }`}
            onChange={() => setFormErrors(prev => ({ ...prev, fullName: undefined }))}
          />
          {formErrors.fullName && (
            <p className="text-xs text-red-400">{formErrors.fullName}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="email">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            required
            id="email"
            name="email"
            type="email"
            className={`rounded border bg-slate-900/60 px-3 py-2 ${
              formErrors.email
                ? 'border-red-500/50 text-red-300'
                : 'border-white/10 text-white'
            }`}
            onChange={() => setFormErrors(prev => ({ ...prev, email: undefined }))}
          />
          {formErrors.email && (
            <p className="text-xs text-red-400">{formErrors.email}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="phone">
            Телефон <span className="text-red-400">*</span>
          </label>
          <input
            required
            id="phone"
            name="phone"
            className={`rounded border bg-slate-900/60 px-3 py-2 ${
              formErrors.phone
                ? 'border-red-500/50 text-red-300'
                : 'border-white/10 text-white'
            }`}
            onChange={() => setFormErrors(prev => ({ ...prev, phone: undefined }))}
          />
          {formErrors.phone && (
            <p className="text-xs text-red-400">{formErrors.phone}</p>
          )}
        </div>
        
        {hideServiceSelect ? (
          <input type="hidden" name="serviceInterest" defaultValue={defaultServiceInterest ?? ''} />
        ) : (
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="serviceInterest">
              Интересующий сервис
            </label>
            <select
              id="serviceInterest"
              name="serviceInterest"
              className="rounded border border-white/10 bg-slate-900/60 px-3 py-2 text-white"
              defaultValue={defaultServiceInterest ?? ''}
            >
              <option value="">Не выбрано</option>
              <option value="MY_SKLAD">Мой Склад</option>
              <option value="BITRIX24">Битрикс24</option>
              <option value="TELEPHONY">Телефония</option>
            </select>
          </div>
        )}
        
        {/* Additional fields in accordion */}
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdditional(!showAdditional)}
            className="w-full px-3 py-2 text-left text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors flex items-center justify-between"
          >
            <span>Дополнительно</span>
            <span className={`transform transition-transform ${showAdditional ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {showAdditional && (
            <div className="p-3 pt-0 space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="company">
                  Компания
                </label>
                <input
                  id="company"
                  name="company"
                  className="rounded border border-white/10 bg-slate-900/60 px-3 py-2 text-white"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="message">
                  Задача / комментарий
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="rounded border border-white/10 bg-slate-900/60 px-3 py-2 text-white resize-none"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Honeypot field for spam protection */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
        >
          {status === 'loading' ? 'Отправка...' : 'Отправить заявку'}
        </button>
        
        {status === 'success' && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-sm text-green-400">✅ Спасибо! Мы свяжемся с вами в ближайшее время.</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">
              ❌ {error || 'Произошла ошибка. Пожалуйста, попробуйте еще раз.'}
            </p>
          </div>
        )}
      </form>
    </CaptchaGate>
  );
}

export function ContactForm(props: ContactFormProps) {
  // Always return the form without provider
  // GoogleReCaptcha component handles the provider internally
  return <ContactFormInner {...props} />;
}
