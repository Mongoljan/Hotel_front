/**
 * Custom hook for fetching data with caching support
 */

import { useState, useEffect, useCallback } from 'react';
import apiCache from '@/lib/apiCache';

interface UseApiDataOptions<T> {
  endpoint: string;
  token?: string;
  params?: Record<string, any>;
  ttl?: number; // Cache TTL in milliseconds
  enabled?: boolean; // Whether to fetch on mount
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

/**
 * Hook for fetching API data with automatic caching
 */
export function useApiData<T = any>(
  options: UseApiDataOptions<T>
): UseApiDataResult<T> {
  const {
    endpoint,
    token,
    params = {},
    ttl = 5 * 60 * 1000, // Default 5 minutes
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<Error | null>(null);

  // Generate cache key
  const cacheKey = useCallback(() => {
    const queryString = new URLSearchParams(params as any).toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }, [endpoint, params]);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const key = cacheKey();

      // Check cache first
      const cached = apiCache.get<T>(key);
      if (cached !== null) {
        setData(cached);
        setLoading(false);
        if (onSuccess) onSuccess(cached);
        return;
      }

      // Build URL
      const url = new URL(endpoint, process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn');
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          url.searchParams.append(k, String(v));
        }
      });

      if (token) {
        url.searchParams.append('token', token);
      }

      // Fetch fresh data
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Cache the result
      apiCache.set(key, result, ttl);

      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      if (onError) onError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, token, ttl, enabled, cacheKey, onSuccess, onError]);

  // Invalidate cache for this endpoint
  const invalidate = useCallback(() => {
    apiCache.invalidate(cacheKey());
  }, [cacheKey]);

  // Fetch on mount or when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate,
  };
}

/**
 * Hook for mutations (POST, PUT, PATCH, DELETE) with cache invalidation
 */
interface UseMutationOptions<TData = any, TVariables = any> {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  invalidateKeys?: string[]; // Cache keys to invalidate on success
}

interface UseMutationResult<TData = any, TVariables = any> {
  mutate: (variables: TVariables, token?: string) => Promise<TData>;
  loading: boolean;
  error: Error | null;
  data: TData | null;
}

export function useMutation<TData = any, TVariables = any>(
  options: UseMutationOptions<TData, TVariables>
): UseMutationResult<TData, TVariables> {
  const {
    endpoint,
    method = 'POST',
    onSuccess,
    onError,
    invalidateKeys = [],
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (variables: TVariables, token?: string): Promise<TData> => {
      try {
        setLoading(true);
        setError(null);

        // Build URL
        const url = new URL(endpoint, process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dev.kacc.mn');
        if (token) {
          url.searchParams.append('token', token);
        }

        // Make request
        const response = await fetch(url.toString(), {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: method !== 'DELETE' ? JSON.stringify(variables) : undefined,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const result = method !== 'DELETE' ? await response.json() : null;

        // Invalidate specified cache keys
        invalidateKeys.forEach((key) => apiCache.invalidate(key));

        setData(result);
        if (onSuccess) onSuccess(result);

        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        if (onError) onError(errorObj);
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, onSuccess, onError, invalidateKeys]
  );

  return {
    mutate,
    loading,
    error,
    data,
  };
}
