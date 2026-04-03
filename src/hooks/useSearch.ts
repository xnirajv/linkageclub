import { useCallback, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';
import { useDebounce } from './useDebounce';

interface SearchOptions {
  type?: 'all' | 'projects' | 'jobs' | 'mentors' | 'users' | 'posts';
  page?: number;
  limit?: number;
}

interface SearchResponse {
  results?: any;
  type?: string;
}

export function useSearch(options: SearchOptions = {}) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(options);
  const debouncedQuery = useDebounce(query, 300);

  const queryParams = new URLSearchParams();
  if (debouncedQuery) {
    queryParams.append('q', debouncedQuery);
  }
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const { data, error, mutate } = useSWR<SearchResponse>(
    debouncedQuery ? `/api/search?${queryParams.toString()}` : null,
    fetcher
  );

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const setType = useCallback((type: SearchOptions['type']) => {
    setFilters(prev => ({ ...prev, type, page: 1 }));
  }, []);

  const loadMore = useCallback(() => {
    setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  }, []);

  const getSuggestions = useCallback(async (partialQuery: string) => {
    if (!partialQuery || partialQuery.length < 2) return [];

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(partialQuery)}`);
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      return [];
    }
  }, []);

  return {
    query,
    results: data?.results,
    type: data?.type,
    isLoading: !error && !data && !!debouncedQuery,
    isError: error,
    search,
    setType,
    loadMore,
    getSuggestions,
    mutate,
  };
}
