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

// ✅ ADD THIS INTERFACE
interface AssessmentsResponse {
  assessments: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useAssessments(options: UseAssessmentsOptions = {}) {
  const [filters, setFilters] = useState(options);

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'all') {
      queryParams.append(key, value.toString());
    }
  });

  // ✅ FIX: Add type to useSWR
  const { data, error, mutate } = useSWR<AssessmentsResponse>(
    `/api/assessments?${queryParams.toString()}`,
    fetcher
  );

  const applyFilters = useCallback((newFilters: Partial<UseAssessmentsOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  return {
    assessments: data?.assessments || [],
    pagination: data?.pagination,
    isLoading: !error && !data,
    isError: error,
    filters,
    applyFilters,
    mutate,
  };
}

// ✅ ADD THIS INTERFACE
interface AssessmentResponse {
  assessment: any;
}

export function useAssessment(id: string) {
  const [attemptStarted, setAttemptStarted] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);

  // ✅ FIX: Add type to useSWR
  const { data, error, mutate } = useSWR<AssessmentResponse>(
    id ? `/api/assessments/${id}` : null,
    fetcher
  );

  const assessment = data?.assessment;

  const startAssessment = useCallback(async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to start assessment');
      
      setAssessmentData(data);
      setAttemptStarted(true);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, []);

  const submitAssessment = useCallback(async (answers: number[], timeSpent: number) => {
    try {
      const response = await fetch(`/api/assessments/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timeSpent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit assessment');
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
    assessment: assessmentData?.questions ? assessmentData : assessment,
    isLoading: !error && !data && !assessmentData,
    isError: error,
    startAssessment,
    submitAssessment,
    getResults,
    attemptStarted,
    mutate,
  };
}