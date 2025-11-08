import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '../../api/http';
import { queryKeys } from '../../api/query-keys';

export type AnalyticsSummary = {
  services: {
    total: number;
  };
  cases: {
    total: number;
    published: number;
    recent: Array<{
      id: string;
      projectTitle: string;
      clientName: string;
      published: boolean;
      updatedAt: string;
    }>;
  };
  reviews: {
    total: number;
    pending: number;
    featured: number;
    recent: Array<{
      id: string;
      authorName: string;
      company: string | null;
      reviewType: string;
      isPublished: boolean;
      isFeatured: boolean;
      updatedAt: string;
    }>;
  };
  banners: {
    total: number;
    active: number;
  };
  media: {
    total: number;
  };
  contactRequests: {
    total: number;
    new: number;
    inProgress: number;
  };
  generatedAt: string;
};

export const useAnalyticsSummaryQuery = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.analytics(),
    queryFn: () => api.get<AnalyticsSummary>('/api/analytics/summary'),
    staleTime: 30_000,
  });
};
