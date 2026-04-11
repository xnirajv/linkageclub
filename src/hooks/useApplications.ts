import useSWR from 'swr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import apiClient, { fetcher } from '@/lib/api/client';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseApplicationsOptions {
  page?: number;
  limit?: number;
  type?: 'project' | 'job' | 'all';
  status?: string;
  role?: 'applicant' | 'company';
  projectId?: string;
  jobId?: string;
}

interface ApplicationsResponse {
  applications: any[];
  pagination: any;
}

interface ApplicationResponse {
  application: any;
}

interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

async function revalidateApplicationKeys(
  mutate: ReturnType<typeof useSWRConfig>['mutate'],
  applicationId?: string
) {
  await mutate(
    (key) =>
      typeof key === 'string' &&
      (key.startsWith('/api/applications') ||
        key.startsWith('/api/projects') ||
        (applicationId ? key.includes(applicationId) : false)),
    undefined,
    { revalidate: true }
  );
}

export function useApplications(options: UseApplicationsOptions = {}) {
  const [filters, setFilters] = useState<UseApplicationsOptions>(options);
  const previousOptionsRef = useRef(options);
  const { mutate: globalMutate } = useSWRConfig();

  useEffect(() => {
    const previousOptions = previousOptionsRef.current;
    const keys = Array.from(new Set([...Object.keys(previousOptions), ...Object.keys(options)])) as Array<keyof UseApplicationsOptions>;
    const hasChanged = keys.some((key) => previousOptions[key] !== options[key]);

    if (!hasChanged) {
      return;
    }

    previousOptionsRef.current = options;
    setFilters({
      ...options,
      page: options.page ?? 1,
    });
  }, [options]);

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const { data, error, mutate } = useSWR<ApiEnvelope<ApplicationsResponse>>(
    `/api/applications?${queryParams.toString()}`,
    fetcher
  );

  const updateStatus = useCallback(
    async (
      applicationId: string,
      status: string,
      notes?: string
    ): Promise<ActionResult<{ application: any }>> => {
      try {
        const response = await apiClient.patch<ApiEnvelope<{ application: any }>>(
          `/api/applications/${applicationId}/status`,
          { status, notes }
        );
        await revalidateApplicationKeys(globalMutate, applicationId);
        return {
          success: true,
          data: response.data,
        };
      } catch (actionError) {
        return {
          success: false,
          error: actionError instanceof Error ? actionError.message : 'Failed to update status',
        };
      }
    },
    [globalMutate]
  );

  const sendMessage = useCallback(
    async (applicationId: string, content: string, attachments?: string[]): Promise<ActionResult> => {
      try {
        await apiClient.post(`/api/applications/${applicationId}/message`, {
          content,
          attachments,
        });
        await revalidateApplicationKeys(globalMutate, applicationId);
        return { success: true };
      } catch (actionError) {
        return {
          success: false,
          error: actionError instanceof Error ? actionError.message : 'Failed to send message',
        };
      }
    },
    [globalMutate]
  );

  const scheduleInterview = useCallback(
    async (applicationId: string, interview: any): Promise<ActionResult> => {
      try {
        await apiClient.post(`/api/applications/${applicationId}/interview`, interview);
        await revalidateApplicationKeys(globalMutate, applicationId);
        return { success: true };
      } catch (actionError) {
        return {
          success: false,
          error: actionError instanceof Error ? actionError.message : 'Failed to schedule interview',
        };
      }
    },
    [globalMutate]
  );

  const withdraw = useCallback(
    async (applicationId: string): Promise<ActionResult> => {
      try {
        await apiClient.post(`/api/applications/${applicationId}/withdraw`);
        await revalidateApplicationKeys(globalMutate, applicationId);
        return { success: true };
      } catch (actionError) {
        return {
          success: false,
          error: actionError instanceof Error ? actionError.message : 'Failed to withdraw application',
        };
      }
    },
    [globalMutate]
  );

  return {
    applications: data?.data?.applications || [],
    pagination: data?.data?.pagination,
    isLoading: !error && !data,
    isError: error,
    errorMessage: error instanceof Error ? error.message : data?.error,
    filters,
    setFilters,
    updateStatus,
    sendMessage,
    scheduleInterview,
    withdraw,
    mutate,
  };
}

export function useApplication(id: string) {
  const { data, error, mutate } = useSWR<ApiEnvelope<ApplicationResponse>>(
    id ? `/api/applications/${id}` : null,
    fetcher
  );

  const getMessages = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiEnvelope<{ messages: any[] }>>(`/api/applications/${id}/messages`);
      return response.data?.messages || [];
    } catch {
      return [];
    }
  }, [id]);

  return {
    application: data?.data?.application,
    isLoading: !error && !data,
    isError: error,
    errorMessage: error instanceof Error ? error.message : data?.error,
    getMessages,
    mutate,
  };
}
