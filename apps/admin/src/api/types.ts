export type ServiceCategory = 'MY_SKLAD' | 'BITRIX24' | 'TELEPHONY' | 'OTHER';

export type ReviewType = 'TEXT' | 'VIDEO';
export type VideoProvider = 'YOUTUBE' | 'VIMEO' | 'HOSTED';
export type BannerPlacement = 'HOME_HERO' | 'CTA_PRIMARY' | 'CTA_SECONDARY';
export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description?: unknown | null;
  heroImageUrl?: string | null;
  iconUrl?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type ServiceCreateInput = {
  slug: string;
  title: string;
  summary: string;
  description?: unknown;
  heroImageUrl?: string;
  iconUrl?: string;
  order?: number;
};

export type ServiceUpdateInput = Partial<ServiceCreateInput>;

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
  metrics?: unknown | null;
  category: ServiceCategory;
  serviceId?: string | null;
  heroImageUrl?: string | null;
  videoUrl?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CaseCreateInput = {
  slug: string;
  projectTitle: string;
  clientName: string;
  industry?: string;
  summary: string;
  challenge?: string;
  solution?: string;
  results?: string;
  metrics?: unknown;
  category: ServiceCategory;
  serviceId?: string;
  heroImageUrl?: string;
  videoUrl?: string;
  published?: boolean;
  publishedAt?: string;
};

export type CaseUpdateInput = Partial<CaseCreateInput>;

export type Review = {
  id: string;
  authorName: string;
  authorTitle?: string | null;
  company?: string | null;
  quote?: string | null;
  reviewType: ReviewType;
  videoUrl?: string | null;
  videoProvider?: VideoProvider | null;
  rating?: number | null;
  isFeatured: boolean;
  isPublished: boolean;
  caseId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReviewCreateInput = {
  authorName: string;
  authorTitle?: string;
  company?: string;
  quote?: string;
  reviewType?: ReviewType;
  videoUrl?: string;
  videoProvider?: VideoProvider;
  rating?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  caseId?: string;
};

export type ReviewUpdateInput = Partial<ReviewCreateInput>;

export type BannerMedia = {
  id: string;
  bannerId: string;
  mediaId: string;
  order: number;
  media: MediaAsset;
};

export type Banner = {
  id: string;
  placement: BannerPlacement;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  serviceId?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  mediaItems?: BannerMedia[];
};

export type BannerCreateInput = {
  placement: BannerPlacement;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
  serviceId?: string;
  mediaId?: string;
  order?: number;
  isActive?: boolean;
};

export type BannerUpdateInput = Partial<BannerCreateInput>;

export type Setting = {
  key: string;
  value: unknown | null;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  url: string;
  type: MediaType;
  altText?: string | null;
  mimeType?: string | null;
  size?: number | null;
  metadata?: unknown | null;
  caseId?: string | null;
  reviewId?: string | null;
  createdAt: string;
};

export type MediaCreateInput = {
  url: string;
  type: MediaType;
  altText?: string;
  mimeType?: string;
  size?: number;
  metadata?: unknown;
  caseId?: string | null;
  reviewId?: string | null;
};

export type MediaUpdateInput = Partial<MediaCreateInput>;

export type ContactSettings = {
  phone?: string;
  email?: string;
  address?: string;
  schedule?: string;
};

export type ApiResponse<T> = {
  data: T;
};

export type ApiListResponse<T> = ApiResponse<T[]>;
