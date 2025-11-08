import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '../../api/http';
import { queryKeys } from '../../api/query-keys';
import type {
  Banner,
  BannerCreateInput,
  BannerUpdateInput,
} from '../../api/types';

export const useBannersQuery = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.banners(),
    queryFn: () => api.get<Banner[]>('/api/banners'),
  });
};

export const useCreateBannerMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: BannerCreateInput) => api.post<Banner, BannerCreateInput>('/api/banners', input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.banners() });
    },
  });
};

export const useUpdateBannerMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BannerUpdateInput }) =>
      api.put<Banner, BannerUpdateInput>(`/api/banners/${id}`, input),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: queryKeys.banners() });
      void client.invalidateQueries({ queryKey: queryKeys.banner(variables.id) });
    },
  });
};

export const useDeleteBannerMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/banners/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.banners() });
    },
  });
};
