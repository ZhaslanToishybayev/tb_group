import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '../../api/http';
import { queryKeys } from '../../api/query-keys';
import type { Setting } from '../../api/types';

export const useSettingsQuery = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.settings(),
    queryFn: () => api.get<Setting[]>('/api/settings'),
  });
};

export const useSettingQuery = (key: string) => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.setting(key),
    queryFn: () => api.get<Setting>(`/api/settings/${key}`),
    enabled: Boolean(key),
  });
};

export const useUpdateSettingMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      api.put<Setting, { value: unknown }>(`/api/settings/${key}`, { value }),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: queryKeys.settings() });
      void client.invalidateQueries({ queryKey: queryKeys.setting(variables.key) });
    },
  });
};
