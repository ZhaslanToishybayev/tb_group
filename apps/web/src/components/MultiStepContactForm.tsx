'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

import { submitContact, type ContactRequestPayload } from '../lib/api';
import { CaptchaGate } from './CaptchaGate';

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  serviceInterest?: string;
};

type MultiStepContactFormProps = {
  defaultServiceInterest?: string;
  hideServiceSelect?: boolean;
};

const steps = [
  {
    id: 1,
    title: 'Контактная информация',
    description: 'Расскажите, как с вами связаться',
    fields: ['fullName', 'email', 'phone'] as const,
  },
  {
    id: 2,
    title: 'О компании',
    description: 'Кратко о вашей компании и задаче',
    fields: ['company', 'serviceInterest', 'message'] as const,
  },
];

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export function MultiStepContactForm({
  defaultServiceInterest,
  hideServiceSelect = false,
}: MultiStepContactFormProps) {
  const methods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      serviceInterest: defaultServiceInterest || '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
    reset,
  } = methods;

  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const watchedFields = watch();

  const validateStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    const fieldsToValidate = step.fields.filter((field) => {
      if (field === 'serviceInterest' && hideServiceSelect) return false;
      return true;
    });
    return await trigger(fieldsToValidate as any);
  };

  const nextStep = async () => {
    const isStepValid = await validateStep(currentStep);
    if (isStepValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    setError(null);

    // Get reCAPTCHA token if required
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      const recaptchaTrigger = document.querySelector('[data-testid="recaptcha-trigger"]') as HTMLButtonElement;
      recaptchaTrigger?.click();
      return;
    }

    const payload: ContactRequestPayload = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      company: data.company?.trim() || undefined,
      message: data.message?.trim() || undefined,
      serviceInterest: data.serviceInterest || defaultServiceInterest,
      recaptchaToken: recaptchaToken || undefined,
    };

    try {
      await submitContact(payload);
      setStatus('success');
      reset();
      setCurrentStep(0);
      setRecaptchaToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить заявку');
      setStatus('error');
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

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
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">
                Шаг {currentStep + 1} из {steps.length}
              </span>
              <span className="text-blue-400 font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-4"
            >
              {/* Step Info */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {steps[currentStep].title}
                </h3>
                <p className="text-sm text-slate-300">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Step 1: Contact Info */}
              {currentStep === 0 && (
                <>
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Имя и фамилия <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('fullName', {
                        required: 'Пожалуйста, введите ваше имя и фамилию',
                        minLength: {
                          value: 2,
                          message: 'Имя должно содержать минимум 2 символа',
                        },
                      })}
                      className={`w-full rounded border bg-slate-900/60 px-4 py-3 text-white transition-colors ${
                        errors.fullName
                          ? 'border-red-500/50 focus:border-red-500'
                          : watchedFields.fullName && !errors.fullName
                          ? 'border-green-500/50 focus:border-green-500'
                          : 'border-white/10 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="Иван Иванов"
                    />
                    <AnimatePresence>
                      {errors.fullName && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs text-red-400"
                        >
                          {errors.fullName.message}
                        </motion.p>
                      )}
                      {watchedFields.fullName && !errors.fullName && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 text-xs text-green-400"
                        >
                          <Check size={14} />
                          <span>Имя введено корректно</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Пожалуйста, введите email',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Пожалуйста, введите корректный email',
                        },
                      })}
                      className={`w-full rounded border bg-slate-900/60 px-4 py-3 text-white transition-colors ${
                        errors.email
                          ? 'border-red-500/50 focus:border-red-500'
                          : watchedFields.email && !errors.email
                          ? 'border-green-500/50 focus:border-green-500'
                          : 'border-white/10 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="ivan@example.com"
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs text-red-400"
                        >
                          {errors.email.message}
                        </motion.p>
                      )}
                      {watchedFields.email && !errors.email && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 text-xs text-green-400"
                        >
                          <Check size={14} />
                          <span>Email корректный</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Телефон <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('phone', {
                        required: 'Пожалуйста, введите номер телефона',
                        pattern: {
                          value: /^[+]?[0-9\s\-()]{10,}$/,
                          message: 'Пожалуйста, введите корректный номер телефона',
                        },
                      })}
                      className={`w-full rounded border bg-slate-900/60 px-4 py-3 text-white transition-colors ${
                        errors.phone
                          ? 'border-red-500/50 focus:border-red-500'
                          : watchedFields.phone && !errors.phone
                          ? 'border-green-500/50 focus:border-green-500'
                          : 'border-white/10 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="+7 (700) 123-45-67"
                    />
                    <AnimatePresence>
                      {errors.phone && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs text-red-400"
                        >
                          {errors.phone.message}
                        </motion.p>
                      )}
                      {watchedFields.phone && !errors.phone && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 text-xs text-green-400"
                        >
                          <Check size={14} />
                          <span>Телефон введен корректно</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {/* Step 2: Company */}
              {currentStep === 1 && (
                <>
                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Компания
                    </label>
                    <input
                      {...register('company')}
                      className="w-full rounded border border-white/10 bg-slate-900/60 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      placeholder="ТОО «Ваша компания»"
                    />
                  </div>

                  {/* Service Interest */}
                  {!hideServiceSelect && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        Интересующий сервис
                      </label>
                      <select
                        {...register('serviceInterest')}
                        className="w-full rounded border border-white/10 bg-slate-900/60 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        defaultValue={defaultServiceInterest ?? ''}
                      >
                        <option value="">Не выбрано</option>
                        <option value="MY_SKLAD">Мой Склад</option>
                        <option value="BITRIX24">Битрикс24</option>
                        <option value="TELEPHONY">Телефония</option>
                      </select>
                    </div>
                  )}

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Задача / комментарий
                    </label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      className="w-full rounded border border-white/10 bg-slate-900/60 px-4 py-3 text-white resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      placeholder="Кратко опишите вашу задачу..."
                    />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/5 transition-colors"
            >
              Назад
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isValid}
                className="rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              >
                Далее
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === 'loading' || !isValid}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              >
                {status === 'loading' ? 'Отправка...' : 'Отправить заявку'}
              </button>
            )}
          </div>

          {/* Honeypot field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              {...register('website')}
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-green-500/30 bg-green-500/10 p-4"
            >
              <p className="text-sm text-green-400 flex items-center gap-2">
                <Check size={18} />
                Спасибо! Мы свяжемся с вами в ближайшее время.
              </p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-4"
            >
              <p className="text-sm text-red-400">
                ❌ {error || 'Произошла ошибка. Пожалуйста, попробуйте еще раз.'}
              </p>
            </motion.div>
          )}
        </form>
      </FormProvider>
    </CaptchaGate>
  );
}
