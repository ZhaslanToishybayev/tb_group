import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '../../api/http';
import { queryKeys } from '../../api/query-keys';
import type {
  Service,
  ServiceCreateInput,
  ServiceUpdateInput,
} from '../../api/types';

export const useServicesQuery = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.services(),
    queryFn: () => api.get<Service[]>('/api/services'),
  });
};

export const useServiceQuery = (id: string) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.service(id),
    queryFn: () => api.get<Service>(`/api/services/${id}`),
    enabled: Boolean(id),
  });
};

export const useCreateServiceMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ServiceCreateInput) =>
      api.post<Service, ServiceCreateInput>('/api/services', input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.services() });
    },
  });
};

export const useUpdateServiceMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ServiceUpdateInput }) =>
      api.put<Service, ServiceUpdateInput>(`/api/services/${id}`, input),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: queryKeys.services() });
      void client.invalidateQueries({ queryKey: queryKeys.service(variables.id) });
    },
  });
};

export const useDeleteServiceMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/services/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.services() });
    },
  });
};
