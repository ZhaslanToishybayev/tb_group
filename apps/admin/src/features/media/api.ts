import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '../../api/http';
import { queryKeys } from '../../api/query-keys';
import type {
  MediaAsset,
  MediaCreateInput,
  MediaUpdateInput,
} from '../../api/types';

type UploadResponse = {
  uploadId: string;
  filename: string;
  mimeType?: string;
  size?: number;
  url?: string;
  path: string;
};

export const useMediaQuery = () => {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.media(),
    queryFn: () => api.get<MediaAsset[]>('/api/media'),
  });
};

export const useCreateMediaMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: MediaCreateInput) => api.post<MediaAsset, MediaCreateInput>('/api/media', input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.media() });
    },
  });
};

export const useUpdateMediaMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MediaUpdateInput }) =>
      api.put<MediaAsset, MediaUpdateInput>(`/api/media/${id}`, input),
    onSuccess: (_data, variables) => {
      void client.invalidateQueries({ queryKey: queryKeys.media() });
      void client.invalidateQueries({ queryKey: queryKeys.mediaItem(variables.id) });
    },
  });
};

export const useDeleteMediaMutation = () => {
  const api = useApiClient();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/media/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.media() });
    },
  });
};

export const useUploadMediaFileMutation = () => {
  const api = useApiClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.upload<UploadResponse>('/api/uploads', formData);
      return response;
    },
  });
};
