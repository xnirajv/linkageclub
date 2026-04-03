import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/api/client';

interface UseAssessmentsOptions {
  page?: number;
  limit?: number;
  skill?: string;
  level?: string;
  price?: 'free' | 'paid' | 'all';
  search?: string;
}

interface AssessmentsResponse {
  assessments?: any[];
  pagination?: any;
}

interface AssessmentResponse {
  assessment?: any;
}

export function useAssessments(options: UseAssessmentsOptions = {}) {
  const [filters, setFilters] = useState(options);

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const { data, error, mutate } = useSWR<AssessmentsResponse>(
    `/api/assessments?${queryParams.toString()}`,
    fetcher
  );

  const applyFilters = useCallback((newFilters: Partial<UseAssessmentsOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const startAssessment = useCallback(async (assessmentId: string, paymentId?: string) => {
    try {
      const url = paymentId 
        ? `/api/assessments/${assessmentId}/start?paymentId=${paymentId}`
        : `/api/assessments/${assessmentId}/start`;

      const response = await fetch(url, { method: 'POST' });

      if (!response.ok) throw new Error('Failed to start assessment');

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, []);

  return {
    assessments: data?.assessments || [],
    pagination: data?.pagination,
    isLoading: !error && !data,
    isError: error,
    filters,
    applyFilters,
    startAssessment,
    mutate,
  };
}

export function useAssessment(id: string) {
  const { data, error, mutate } = useSWR<AssessmentResponse>(
    id ? `/api/assessments/${id}` : null,
    fetcher
  );

  const submitAssessment = useCallback(async (answers: number[], timeSpent: number) => {
    try {
      const response = await fetch(`/api/assessments/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timeSpent }),
      });

      if (!response.ok) throw new Error('Failed to submit assessment');

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [id]);

  const getResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessments/${id}/results`);
      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  }, [id]);

  return {
    assessment: data?.assessment,
    isLoading: !error && !data,
    isError: error,
    submitAssessment,
    getResults,
    mutate,
  };
}
