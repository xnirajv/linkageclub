'use client';

import useSWR from 'swr';
import { useState, useCallback } from 'react';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch');
  }
  return res.json();
};

interface UseAssessmentsOptions {
  page?: number;
  limit?: number;
  skill?: string;
  level?: string;
  price?: string;
  search?: string;
  excludeCompleted?: boolean; // ✅ NEW
}

export function useAssessments(options: UseAssessmentsOptions = {}) {
  const [filters, setFilters] = useState(options);

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const url = `/api/assessments${queryString ? `?${queryString}` : ''}`;

  const { data, error, mutate, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect:true,
    dedupingInterval: 2000,
    refreshInterval:0,
  });

  const applyFilters = useCallback(
    (newFilters: Partial<UseAssessmentsOptions>) => {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    },
    []
  );

  const loadMore = useCallback(() => {
    if (data?.pagination && data.pagination.page < data.pagination.pages) {
      setFilters((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  }, [data]);

  const startAssessment = useCallback(
    async (assessmentId: string, paymentId?: string) => {
      try {
        const url = paymentId
          ? `/api/assessments/${assessmentId}/start?paymentId=${paymentId}`
          : `/api/assessments/${assessmentId}/start`;

        const response = await fetch(url, { method: 'POST' });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to start assessment');
        }

        const data = await response.json();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    []
  );

  return {
    assessments: data?.assessments || [],
    pagination: data?.pagination,
    isLoading,
    isError: !!error,
    error,
    filters,
    applyFilters,
    loadMore,
    startAssessment,
    mutate,
  };
}

export function useAssessment(id: string) {
  const url = id ? `/api/assessments/${id}` : null;

  const { data, error, mutate, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  const submitAssessment = useCallback(
    async (answers: number[], timeSpent: number) => {
      try {
        const response = await fetch(`/api/assessments/${id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers, timeSpent }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit');
        }

        const data = await response.json();
        mutate();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
    [id, mutate]
  );

  const getResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${id}/results`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch results');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error fetching results:', error);
      return null;
    }
  }, [id]);

  return {
    assessment: data?.assessment,
    isLoading,
    isError: !!error,
    error,
    submitAssessment,
    getResults,
    mutate,
  };
}