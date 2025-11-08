import type { Case, Banner, MediaAsset, Review, Service, Setting } from './types';

export const queryKeys = {
  services: () => ['services'] as const,
  service: (id: string) => ['services', id] as const,
  cases: (filters?: Record<string, unknown>) => ['cases', filters ?? {}] as const,
  case: (id: string) => ['cases', id] as const,
  reviews: (filters?: Record<string, unknown>) => ['reviews', filters ?? {}] as const,
  review: (id: string) => ['reviews', id] as const,
  banners: () => ['banners'] as const,
  banner: (id: string) => ['banners', id] as const,
  settings: () => ['settings'] as const,
  setting: (key: string) => ['settings', key] as const,
  media: () => ['media'] as const,
  mediaItem: (id: string) => ['media', id] as const,
  analytics: () => ['analytics', 'summary'] as const,
};

export type ServicesQueryData = Service[];
export type CasesQueryData = Case[];
export type ReviewsQueryData = Review[];
export type BannersQueryData = Banner[];
export type SettingsQueryData = Setting[];
export type MediaQueryData = MediaAsset[];
