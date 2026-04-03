import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/api/client';

interface UseMentorsOptions {
  page?: number;
  limit?: number;
  expertise?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: string;
  search?: string;
  recommended?:boolean
}

interface MentorsResponse {
  mentors?: any[];
  pagination?: any;
}

interface MentorResponse {
  mentor?: any;
}

export function useMentors(options: UseMentorsOptions = {}) {
  const [filters, setFilters] = useState(options);

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  const { data, error, mutate } = useSWR<MentorsResponse>(
    `/api/mentors?${queryParams.toString()}`,
    fetcher
  );

  const applyFilters = useCallback((newFilters: Partial<UseMentorsOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const loadMore = useCallback(() => {
    setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  }, []);

  const bookSession = useCallback(async (mentorId: string, session: any) => {
    try {
      const response = await fetch(`/api/mentors/${mentorId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });

      if (!response.ok) throw new Error('Failed to book session');

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, []);

  return {
    mentors: data?.mentors || [],
    pagination: data?.pagination,
    isLoading: !error && !data,
    isError: error,
    filters,
    applyFilters,
    loadMore,
    bookSession,
    mutate,
  };
}

export function useMentor(id: string) {
  const { data, error, mutate } = useSWR<MentorResponse>(
    id ? `/api/mentors/${id}` : null,
    fetcher
  );

  const checkAvailability = useCallback(async (date: Date) => {
    try {
      const response = await fetch(`/api/mentors/${id}/availability?date=${date.toISOString()}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      return false;
    }
  }, [id]);

  const submitReview = useCallback(async (sessionId: string, rating: number, comment: string) => {
    try {
      const response = await fetch(`/api/mentors/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, rating, comment }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      mutate(); // Refresh mentor data
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [id, mutate]);

  return {
    mentor: data?.mentor,
    isLoading: !error && !data,
    isError: error,
    checkAvailability,
    submitReview,
    mutate,
  };
}
