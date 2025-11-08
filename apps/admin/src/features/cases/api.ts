import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '../../api/http';
import { queryKeys } from '../../api/query-keys';
import type { Case, CaseCreateInput, CaseUpdateInput } from '../../api/types';

type CaseListFilters = Partial<{
  category: string;
  serviceId: string;
  published: boolean;
}>;

export const useCasesQuery = (filters?: CaseListFilters) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.cases(filters),
    queryFn: () => api.get<Case[]>('/api/cases', { query: filters }),
  });
};

export const useCreateCaseMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CaseCreateInput) => api.post<Case, CaseCreateInput>('/api/cases', input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};

export const useUpdateCaseMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CaseUpdateInput }) =>
      api.put<Case, CaseUpdateInput>(`/api/cases/${id}`, input),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: ['cases'] });
      void client.invalidateQueries({ queryKey: queryKeys.case(variables.id) });
    },
  });
};

export const useDeleteCaseMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/cases/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
