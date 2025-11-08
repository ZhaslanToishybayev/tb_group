import React from 'react';

import { useAuth } from '../providers/auth-provider';
import type { ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type RequestOptions<TBody = unknown> = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: TBody;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
};

const buildUrl = (path: string, query?: RequestOptions['query']): string => {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      params.set(key, String(value));
    });
    const qs = params.toString();
    if (qs) {
      url.search = qs;
    }
  }
  return url.toString();
};

const parseErrorPayload = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string; code?: string; details?: unknown };
    return payload;
  } catch {
    return {};
  }
};

export const useApiClient = () => {
  const { authorizedFetch } = useAuth();

  const request = React.useCallback(
    async <TResponse, TBody = unknown>(path: string, options?: RequestOptions<TBody>): Promise<TResponse> => {
      const { method = 'GET', body, headers = {}, signal, query } = options ?? {};
      const url = buildUrl(path, query);

      const requestHeaders = new Headers(headers);
      const init: RequestInit = {
        method,
        headers: requestHeaders,
        signal,
      };

      if (body !== undefined) {
        const isFormData =
          typeof FormData !== 'undefined' && body instanceof FormData;

        if (isFormData) {
          init.body = body as FormData;
        } else {
          requestHeaders.set('Content-Type', 'application/json');
          init.body = JSON.stringify(body);
        }
      }

      const response = await authorizedFetch(url, init);
      if (!response.ok) {
        const payload = await parseErrorPayload(response);
        throw new ApiError(
          payload.message ?? `Request failed with status ${response.status}`,
          response.status,
          payload.code,
          payload.details,
        );
      }

      if (response.status === 204) {
        return undefined as TResponse;
      }

      const result = (await response.json().catch(() => ({}))) as ApiResponse<TResponse> | TResponse;
      if (result && typeof result === 'object' && 'data' in result) {
        return (result as ApiResponse<TResponse>).data;
      }

      return result as TResponse;
    },
    [authorizedFetch],
  );

  return React.useMemo(
    () => ({
      request,
      get: <TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
        request<TResponse>(path, { ...options, method: 'GET' }),
      post: <TResponse, TBody = unknown>(path: string, body: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) =>
        request<TResponse, TBody>(path, { ...options, method: 'POST', body }),
      put: <TResponse, TBody = unknown>(path: string, body: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) =>
        request<TResponse, TBody>(path, { ...options, method: 'PUT', body }),
      delete: <TResponse = void>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
        request<TResponse>(path, { ...options, method: 'DELETE' }),
      upload: <TResponse>(path: string, formData: FormData, options?: Omit<RequestOptions<FormData>, 'method' | 'body'>) =>
        request<TResponse, FormData>(path, { ...options, method: 'POST', body: formData }),
    }),
    [request],
  );
};
