const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: 120 },
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}

export async function getServices() {
  return apiFetch<Service[]>('/api/services');
}

export async function getService(idOrSlug: string) {
  return apiFetch<Service>(`/api/services/${idOrSlug}`);
}

export async function getServiceDetail(idOrSlug: string) {
  const service = await apiFetch<ServiceDetail>(`/api/services/${idOrSlug}?include=full`);
  return normalizeServiceDetail(service);
}

export type GetCasesParams = {
  category?: string;
  serviceId?: string;
  search?: string;
  cursor?: string;
  take?: number;
  published?: boolean;
};

export type CaseListResult = {
  items: Case[];
  nextCursor: string | null;
};

export async function getCases(params?: GetCasesParams): Promise<CaseListResult> {
  const searchParams = new URLSearchParams();
  if (params?.category) {
    searchParams.set('category', params.category);
  }
  if (params?.serviceId) {
    searchParams.set('serviceId', params.serviceId);
  }
  if (params?.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }
  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (typeof params?.take === 'number') {
    searchParams.set('take', String(params.take));
  }
  if (typeof params?.published === 'boolean') {
    searchParams.set('published', params.published ? 'true' : 'false');
  }

  const qs = searchParams.toString();
  const path = qs ? `/api/cases?${qs}` : '/api/cases';
  const response = await apiFetch<CaseListResponsePayload>(path);
  return normalizeCaseListResponse(response);
}

export async function getReviews(params?: { isFeatured?: boolean; isPublished?: boolean }) {
  const search = new URLSearchParams();
  if (params?.isFeatured) {
    search.set('isFeatured', 'true');
  }
  if (params?.isPublished !== undefined) {
    search.set('isPublished', params.isPublished.toString());
  }
  const qs = search.toString();
  const path = qs ? `/api/reviews?${qs}` : '/api/reviews';
  return apiFetch<Review[]>(path);
}

export async function getBanners() {
  return apiFetch<Banner[]>('/api/banners');
}

export async function getSettings() {
  return apiFetch<Setting[]>('/api/settings');
}

export type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description?: unknown;
  heroImageUrl?: string | null;
  iconUrl?: string | null;
};

export type ServiceContent = {
  hero?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    bullets?: string[];
    image?: {
      url?: string;
      alt?: string;
    };
    stats?: Array<{ label: string; value: string }>;
    cta?: { label?: string; href?: string };
  };
  overview?: {
    title?: string;
    description?: string;
  };
  highlights?: Array<{ label: string; value: string }>;
  advantages?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  process?: {
    title?: string;
    steps?: Array<{
      title: string;
      description?: string;
      duration?: string;
    }>;
  };
  gallery?: {
    items?: Array<{
      type?: 'image' | 'video';
      url: string;
      thumbnailUrl?: string;
      title?: string;
      description?: string;
    }>;
  };
  faqs?: Array<{ question: string; answer: string }>;
  testimonials?: {
    eyebrow?: string;
    title?: string;
    ids?: string[];
  };
  cta?: {
    title?: string;
    subtitle?: string;
    ctaLabel?: string;
    ctaLink?: string;
  };
};

export type ServiceBannerMedia = {
  id: string;
  url: string;
  type?: string;
  altText?: string | null;
  mimeType?: string | null;
  size?: number | null;
  metadata?: unknown;
  createdAt?: string;
};

export type ServiceBanner = {
  id: string;
  placement: string;
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  media: ServiceBannerMedia[];
};

export type ServiceDetail = Service & {
  content?: ServiceContent | null;
  banners?: ServiceBanner[];
  relatedCases?: CaseSummary[];
};

type CaseMetricPayload = {
  label: string;
  value: string | number;
  unit?: string | null;
  description?: string | null;
};

type CaseMediaPayload = {
  id: string;
  url: string;
  type?: string | null;
  altText?: string | null;
  metadata?: Record<string, unknown> | null;
};

type CasePayload = {
  id: string;
  slug: string;
  projectTitle: string;
  clientName: string;
  industry?: string | null;
  summary: string;
  challenge?: string | null;
  solution?: string | null;
  results?: string | null;
  metrics?: CaseMetricPayload[] | null;
  category: string;
  serviceId?: string | null;
  heroImageUrl?: string | null;
  videoUrl?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  media: CaseMediaPayload[];
};

export type CaseListResponsePayload = {
  items: CasePayload[];
  nextCursor: string | null;
};

type RelatedCasePayload = {
  id: string;
  slug: string;
  projectTitle: string;
  clientName: string;
  summary: string;
  category: string;
  serviceId?: string | null;
  heroImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CaseMetric = {
  label: string;
  value: string;
  unit?: string | null;
  description?: string | null;
};

export type CaseMedia = {
  id: string;
  url: string;
  type?: string | null;
  altText?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type Case = {
  id: string;
  slug: string;
  projectTitle: string;
  clientName: string;
  industry?: string | null;
  summary: string;
  challenge?: string | null;
  solution?: string | null;
  results?: string | null;
  metrics?: CaseMetric[] | null;
  heroImageUrl?: string | null;
  videoUrl?: string | null;
  category: string;
  serviceId?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  media: CaseMedia[];
};

export type CaseSummary = {
  id: string;
  slug: string;
  projectTitle: string;
  clientName: string;
  summary: string;
  category: string;
  heroImageUrl?: string | null;
  serviceId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Review = {
  id: string;
  authorName: string;
  quote?: string | null;
  company?: string | null;
  reviewType: 'TEXT' | 'VIDEO';
  videoUrl?: string | null;
  rating?: number | null;
};

export type Banner = {
  id: string;
  placement: string;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
};

export type Setting = {
  key: string;
  value?: unknown;
};

export type ContactRequestPayload = {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  serviceInterest?: string;
  recaptchaToken?: string;
};

export async function submitContact(payload: ContactRequestPayload) {
  const res = await fetch(`${API_BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Contact submission failed');
  }
  return res.json();
}

function normalizeCaseMetric(metric: CaseMetricPayload): CaseMetric {
  return {
    label: metric.label,
    value: String(metric.value),
    unit: metric.unit ?? null,
    description: metric.description ?? null,
  };
}

function normalizeCaseMedia(media: CaseMediaPayload): CaseMedia {
  return {
    id: media.id,
    url: media.url,
    type: media.type ?? null,
    altText: media.altText ?? null,
    metadata: media.metadata ?? null,
  };
}

function normalizeCase(payload: CasePayload): Case {
  return {
    id: payload.id,
    slug: payload.slug,
    projectTitle: payload.projectTitle,
    clientName: payload.clientName,
    industry: payload.industry ?? null,
    summary: payload.summary,
    challenge: payload.challenge ?? null,
    solution: payload.solution ?? null,
    results: payload.results ?? null,
    metrics: payload.metrics ? payload.metrics.map(normalizeCaseMetric) : null,
    heroImageUrl: payload.heroImageUrl ?? null,
    videoUrl: payload.videoUrl ?? null,
    category: payload.category,
    serviceId: payload.serviceId ?? null,
    published: payload.published,
    publishedAt: payload.publishedAt ?? null,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    media: payload.media.map(normalizeCaseMedia),
  };
}

function normalizeCaseSummary(related: RelatedCasePayload): CaseSummary {
  return {
    id: related.id,
    slug: related.slug,
    projectTitle: related.projectTitle,
    clientName: related.clientName,
    summary: related.summary,
    category: related.category,
    heroImageUrl: related.heroImageUrl ?? null,
    serviceId: related.serviceId ?? null,
    createdAt: related.createdAt,
    updatedAt: related.updatedAt,
  };
}

export function normalizeCaseListResponse(payload: CaseListResponsePayload): CaseListResult {
  return {
    items: payload.items.map(normalizeCase),
    nextCursor: payload.nextCursor,
  };
}

const normalizeServiceDetail = (service: ServiceDetail): ServiceDetail => {
  const content = parseServiceContent(service.content ?? service.description);
  return {
    ...service,
    content,
    banners: (service.banners ?? []).map((banner) => ({
      ...banner,
      media: banner.media?.map((item) => ({ ...item })) ?? [],
    })),
    relatedCases: (service.relatedCases ?? []).map((related) =>
      normalizeCaseSummary({
        id: related.id,
        slug: related.slug,
        projectTitle: related.projectTitle,
        clientName: related.clientName,
        summary: related.summary,
        category: related.category,
        serviceId: related.serviceId,
        heroImageUrl: related.heroImageUrl,
        createdAt: related.createdAt,
        updatedAt: related.updatedAt,
      }),
    ),
  };
};

export const parseServiceContent = (raw: unknown): ServiceContent | null => {
  if (!raw) {
    return null;
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseServiceContent(parsed);
    } catch {
      return null;
    }
  }

  if (typeof raw === 'object') {
    return raw as ServiceContent;
  }

  return null;
};
