import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/api/client';

interface UseApplicationsOptions {
  page?: number;
  limit?: number;
  type?: 'project' | 'job' | 'all';
  status?: string;
  role?: 'applicant' | 'company';
}

interface ApplicationsResponse {
  applications?: any[];
  pagination?: any;
}

interface ApplicationResponse {
  application?: any;
}

export function useApplications(options: UseApplicationsOptions = {}) {
  const [filters, setFilters] = useState(options);

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const { data, error, mutate } = useSWR<ApplicationsResponse>(
    `/api/applications?${queryParams.toString()}`,
    fetcher
  );

  const updateStatus = useCallback(async (applicationId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      mutate(); // Refresh applications
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  const sendMessage = useCallback(async (applicationId: string, content: string, attachments?: string[]) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, attachments }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      mutate(); // Refresh applications
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  const scheduleInterview = useCallback(async (applicationId: string, interview: any) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interview),
      });

      if (!response.ok) throw new Error('Failed to schedule interview');

      mutate(); // Refresh applications
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  const withdraw = useCallback(async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/withdraw`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to withdraw application');

      mutate(); // Refresh applications
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  return {
    applications: data?.applications || [],
    pagination: data?.pagination,
    isLoading: !error && !data,
    isError: error,
    filters,
    updateStatus,
    sendMessage,
    scheduleInterview,
    withdraw,
    mutate,
  };
}

export function useApplication(id: string) {
  const { data, error, mutate } = useSWR<ApplicationResponse>(
    id ? `/api/applications/${id}` : null,
    fetcher
  );

  const getMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/applications/${id}/messages`);
      const data = await response.json();
      return data.messages;
    } catch (error) {
      return [];
    }
  }, [id]);

  return {
    application: data?.application,
    isLoading: !error && !data,
    isError: error,
    getMessages,
    mutate,
  };
}
