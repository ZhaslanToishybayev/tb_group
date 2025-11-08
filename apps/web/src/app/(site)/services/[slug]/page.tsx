import { notFound } from 'next/navigation';

import {
  getServiceDetail,
  type ServiceContent,
  type ServiceDetail,
  type ServiceBanner,
} from '../../../../lib/api';
import {
  ServiceHero,
  ServiceHighlights,
  ServiceAdvantages,
  ServiceProcessTimeline,
  ServiceGallery,
  ServiceFaq,
  ServiceRelatedCases,
  ServiceInquirySection,
} from '../../../../components/services';

const fallbackContentBySlug: Record<string, ServiceContent> = {
  'my-sklad': {
    hero: {
      eyebrow: 'Внедрение «Мой Склад»',
      title: 'Мой Склад под ваши процессы',
      subtitle: 'Синхронизируем продажи, склад и бухгалтерию, избавляем от ручных операций и ошибок учёта.',
      bullets: [
        'Объединяем онлайн-магазины, маркетплейсы и офлайн-точки',
        'Настраиваем автоматические документы и интеграции с 1С',
        'Обучаем сотрудников работе с аналитикой и отчётами',
      ],
      stats: [
        { label: 'Пилот', value: '14 дней' },
        { label: 'Роста выручки', value: '+18%' },
        { label: 'Инцидентов после запуска', value: '< 2%' },
      ],
    },
    highlights: [
      { label: 'Товарных позиций', value: 'до 1 000 000' },
      { label: 'Интеграций', value: '8+' },
      { label: 'Автоматизация', value: 'склад, продажи, логистика' },
      { label: 'Поддержка', value: 'SLA 24/7' },
    ],
    advantages: [
      {
        title: 'Быстрое внедрение',
        description: 'Поднимем проект и мигрируем данные без простоев. Старт за 2 недели.',
      },
      {
        title: 'Единый учёт',
        description: 'Интегрируем онлайн и офлайн каналы, убираем дубли и ошибки.',
      },
      {
        title: 'Отчёты руководителю',
        description: 'Настраиваем понятные дашборды по остаткам, продажам и марже.',
      },
    ],
    process: {
      title: 'Этапы внедрения',
      steps: [
        { title: 'Диагностика и проектирование', description: 'Собираем требования, описываем процессы и итоговую архитектуру.', duration: '3-5 дней' },
        { title: 'Настройка и интеграции', description: 'Мигрируем данные, настраиваем обмен с CRM и каналами продаж.', duration: '1-2 недели' },
        { title: 'Обучение и запуск', description: 'Проводим тренинги, запускаем пилот, переводим всех пользователей.', duration: '5-7 дней' },
      ],
    },
    faqs: [
      { question: 'Сколько занимает внедрение?', answer: 'Пилот запускаем за 14 дней, полноценный проект в среднем за 4-6 недель.' },
      { question: 'Нужно ли останавливать работу склада?', answer: 'Нет, внедрение идёт параллельно текущим процессам.' },
    ],
    cta: {
      title: 'Переходите на Мой Склад без боли',
      subtitle: 'Подберём тариф, согласуем миграцию данных и поможем команде привыкнуть.',
      ctaLabel: 'Запросить план внедрения',
      ctaLink: '/contact',
    },
  },
  bitrix24: {
    hero: {
      eyebrow: 'Внедрение Bitrix24',
      title: 'Bitrix24 под ваши регламенты и KPI',
      subtitle: 'Автоматизируем продажи и сервис, строим сквозную аналитику и подключаем телефонию.',
      bullets: [
        'Настраиваем воронки, роботов и триггеры под ваш процесс',
        'Интегрируем почту, телефонию, каналы мессенджеров',
        'Обучаем сотрудников и выдаём регламенты работы',
      ],
      stats: [
        { label: 'Новых сделок', value: '+24%' },
        { label: 'Срок пилота', value: '21 день' },
        { label: 'Уровень SLA', value: '99.5%' },
      ],
    },
    highlights: [
      { label: 'Воронок', value: 'до 10' },
      { label: 'Автоматизаций', value: '50+' },
      { label: 'Интеграций', value: 'CRM + ERP + телефония' },
      { label: 'Обучение', value: 'видео и живые сессии' },
    ],
    advantages: [
      { title: 'Работаем по регламентам', description: 'Фиксируем процессы в BPMN, чтобы автоматизация была прозрачной.' },
      { title: 'Сквозная аналитика', description: 'Настраиваем BI-дашборды, связываем рекламу, CRM и финансы.' },
      { title: 'Поддержка после запуска', description: 'Дежурим по SLA, расширяем функциональность по roadmap.' },
    ],
    process: {
      title: 'Как мы внедряем Bitrix24',
      steps: [
        { title: 'Анализ и проект', description: 'Проводим рабочие сессии, формируем mindmap и список автоматизаций.', duration: '1 неделя' },
        { title: 'Разработка и интеграции', description: 'Настраиваем CRM, подключаем телефонию, чат-боты и обмен с 1C.', duration: '2-3 недели' },
        { title: 'Пилот и масштабирование', description: 'Запускаем пилот, собираем обратную связь, масштабируем на всю компанию.', duration: 'до 2 недель' },
      ],
    },
    faqs: [
      { question: 'С какими тарифами работаете?', answer: 'Поддерживаем коробку и облако, подбираем тариф под задачи.' },
      { question: 'Можно ли интегрировать с «Мой Склад»?', answer: 'Да, строим обмен данными и автоматические задачи.' },
    ],
    cta: {
      title: 'Запускаем Bitrix24, который любят менеджеры',
      subtitle: 'Выстроим процессы, создадим регламенты и метрики эффективности.',
      ctaLabel: 'Получить аудит CRM',
      ctaLink: '/contact',
    },
  },
  telephony: {
    hero: {
      eyebrow: 'IP-телефония и контакт-центр',
      title: 'Контакт-центр, который видит каждый звонок',
      subtitle: 'Разворачиваем IP-АТС, подключаем оператора, даём сквозную аналитику и контроль качества.',
      bullets: [
        'Подключаем SIP, облачные АТС, записи разговоров',
        'Интегрируемся с Bitrix24, Мой Склад и другими CRM',
        'Настраиваем отчёты по SLA, нагрузке и эффективности операторов',
      ],
      stats: [
        { label: 'Готовность линий', value: '99.9%' },
        { label: 'Настройка очередей', value: '1 неделя' },
        { label: 'Экономия на связи', value: 'до 30%' },
      ],
    },
    advantages: [
      { title: 'Стабильность', description: 'Резервируем каналы связи, настраиваем мониторинг и уведомления.' },
      { title: 'Контроль качества', description: 'Предоставляем дашборды по SLA, среднему времени ответа и NPS.' },
      { title: 'Интерком и телефония', description: 'Настраиваем IVR, голосовые меню, распределение по отделам.' },
    ],
    process: {
      title: 'Как проходит проект',
      steps: [
        { title: 'Аудит инфраструктуры', description: 'Уточняем нагрузку, готовим схему и подбираем оператора.', duration: '3 дня' },
        { title: 'Развёртывание и интеграции', description: 'Подключаем номера, настраиваем IVR, интегрируем с CRM.', duration: '1-2 недели' },
        { title: 'Тестирование и запуск', description: 'Проводим нагрузочные тесты, обучаем операторов, запускаем в боевой режим.', duration: 'до 1 недели' },
      ],
    },
    faqs: [
      { question: 'Можно ли использовать существующего оператора?', answer: 'Да, подключим SIP-транк и настроим маршрутизацию.' },
      { question: 'Как контролировать эффективность операторов?', answer: 'Настроим отчёты и интегрируем показатели в CRM.' },
    ],
    cta: {
      title: 'Подключим телефонию без простоев',
      subtitle: 'Выстроим поддержку клиентов и продажи, настроим контроль качества.',
      ctaLabel: 'Обсудить проект',
      ctaLink: '/contact',
    },
  },
};

const genericFallbackContent = (service: ServiceDetail): ServiceContent => ({
  hero: {
    title: service.title,
    subtitle: service.summary,
  },
});

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const service = await getServiceDetail(params.slug).catch(() => null);
  if (!service) return {};

  const content = service.content ?? fallbackContentBySlug[service.slug] ?? genericFallbackContent(service);
  const heroTitle = content.hero?.title ?? service.title;
  const description = content.hero?.subtitle ?? service.summary;
  const image = content.hero?.image?.url ?? (service.banners?.find((banner) => banner.placement === 'SERVICE_HERO') as ServiceBanner | undefined)?.media?.[0]?.url;

  return {
    title: `${heroTitle} — TB Group`,
    description,
    openGraph: {
      title: heroTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const detail = await getServiceDetail(params.slug).catch(() => null);
  if (!detail) {
    notFound();
  }

  const fallback = fallbackContentBySlug[detail.slug] ?? genericFallbackContent(detail);
  const content = detail.content ?? fallback;
  const relatedCases = detail.relatedCases ?? [];

  return (
    <div className="bg-slate-950">
      <ServiceHero service={detail} content={content} />
      <ServiceHighlights highlights={content.highlights} />
      <ServiceAdvantages advantages={content.advantages} />
      <ServiceProcessTimeline process={content.process} />
      <ServiceGallery gallery={content.gallery} />
      <ServiceFaq faqs={content.faqs} />
      <ServiceRelatedCases cases={relatedCases} />
      <ServiceInquirySection service={detail} content={content} />
    </div>
  );
}
