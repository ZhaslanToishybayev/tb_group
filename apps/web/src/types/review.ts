export interface Review {
  id: string;
  authorName: string;
  authorTitle?: string;
  company?: string;
  quote?: string;
  reviewType: 'TEXT' | 'VIDEO';
  videoUrl?: string;
  videoProvider?: 'YOUTUBE' | 'VIMEO';
  rating?: number;
  isFeatured: boolean;
  isPublished: boolean;
  caseId?: string;
  createdAt: string;
  updatedAt: string;
}

export type VideoProvider = 'YOUTUBE' | 'VIMEO';