import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterConfig {
  [key: string]: any;
}

export interface UseFiltersReturn {
  filters: FilterConfig;
  setFilter: (key: string, value: any) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  hasFilters: boolean;
  activeFilterCount: number;
}

export function useFilters(initialFilters: FilterConfig = {}): UseFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL params or initial filters
  const [filters, setFilters] = useState<FilterConfig>(() => {
    const urlFilters: FilterConfig = {};
    
    searchParams.forEach((value, key) => {
      try {
        // Try to parse as JSON for complex values
        urlFilters[key] = JSON.parse(value);
      } catch {
        // Use as string if not valid JSON
        urlFilters[key] = value;
      }
    });
    
    return { ...initialFilters, ...urlFilters };
  });

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => {
      if (value === null || value === undefined || value === '') {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    router.push(window.location.pathname);
  }, [router]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object') {
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, String(value));
        }
      }
    });

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : window.location.pathname;
    router.push(url);
  }, [filters, router]);

  const hasFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(v => 
      v !== null && v !== undefined && v !== ''
    ).length;
  }, [filters]);

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    applyFilters,
    hasFilters,
    activeFilterCount,
  };
}

export default useFilters;