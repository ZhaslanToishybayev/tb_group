import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '../../api/http';
import { queryKeys } from '../../api/query-keys';
import type {
  Review,
  ReviewCreateInput,
  ReviewUpdateInput,
} from '../../api/types';

type ReviewFilters = Partial<{
  isPublished: boolean;
  isFeatured: boolean;
  caseId: string;
}>;

export const useReviewsQuery = (filters?: ReviewFilters) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.reviews(filters),
    queryFn: () => api.get<Review[]>('/api/reviews', { query: filters }),
  });
};

export const useCreateReviewMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ReviewCreateInput) => api.post<Review, ReviewCreateInput>('/api/reviews', input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useUpdateReviewMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewUpdateInput }) =>
      api.put<Review, ReviewUpdateInput>(`/api/reviews/${id}`, input),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: ['reviews'] });
      void client.invalidateQueries({ queryKey: queryKeys.review(variables.id) });
    },
  });
};

export const useDeleteReviewMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/reviews/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
