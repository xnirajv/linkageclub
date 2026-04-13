import useSWR from 'swr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import apiClient, { fetcher } from '@/lib/api/client';
import { Project } from '@/types/project';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UseProjectsOptions {
  page?: number;
  limit?: number;
  category?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  experienceLevel?: string;
  search?: string;
  status?: string;
}

interface UseUserProjectsOptions {
  type?: 'all' | 'active' | 'completed';
  role?: 'student' | 'company';
}

interface CreateProjectData {
  title: string;
  description: string;
  category: string;
  skills: Array<{
    name: string;
    level: string;
    mandatory: boolean;
  }>;
  budget: {
    type: string;
    min: number;
    max: number;
    currency: string;
  };
  duration: number;
  requirements: string[];
  experienceLevel: string;
  visibility: 'public' | 'private';
  milestones?: Array<{
    title: string;
    description?: string;
    amount: number;
    deadline: number;
  }>;
}

interface ApplyPayload {
  proposedAmount: number;
  proposedDuration: number;
  coverLetter: string;
  attachments?: string[];
  portfolio?: string;
  additionalInfo?: string;
}

interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ProjectsPayload {
  projects: Project[];
  pagination: Pagination;
}

interface ProjectPayload {
  project: Project;
}

interface UserProjectsPayload {
  projects: Project[];
}

async function revalidateProjectKeys(
  mutate: ReturnType<typeof useSWRConfig>['mutate'],
  projectId?: string
) {
  await mutate(
    (key) =>
      typeof key === 'string' &&
      (key.startsWith('/api/projects') ||
        key.startsWith('/api/applications') ||
        (projectId ? key.includes(projectId) : false)),
    undefined,
    { revalidate: true }
  );
}

export function useProjectActions() {
  const { mutate } = useSWRConfig();

  const applyToProject = useCallback(
    async (projectId: string, application: ApplyPayload): Promise<ActionResult<{ application: unknown }>> => {
      try {
        const response = await apiClient.post<ApiEnvelope<{ application: unknown }>>(
          `/api/projects/${projectId}/apply`,
          application
        );
        await revalidateProjectKeys(mutate, projectId);
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to apply',
        };
      }
    },
    [mutate]
  );

  const saveProject = useCallback(
    async (projectId: string): Promise<ActionResult<{ saved: boolean; projectId: string }>> => {
      try {
        const response = await apiClient.post<ApiEnvelope<{ saved: boolean; projectId: string }>>(
          `/api/projects/${projectId}/save`
        );
        await revalidateProjectKeys(mutate, projectId);
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to save project',
        };
      }
    },
    [mutate]
  );

  const createProject = useCallback(
    async (projectData: CreateProjectData): Promise<ActionResult<{ project: Project }>> => {
      try {
        const response = await apiClient.post<ApiEnvelope<{ project: Project }>>('/api/projects', projectData);
        await revalidateProjectKeys(mutate);
        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create project',
        };
      }
    },
    [mutate]
  );

  return {
    applyToProject,
    saveProject,
    createProject,
  };
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [filters, setFilters] = useState<UseProjectsOptions>(options);
  const previousOptionsRef = useRef(options);
  const actions = useProjectActions();

  useEffect(() => {
    const previousOptions = previousOptionsRef.current;
    const keys = Array.from(new Set([...Object.keys(previousOptions), ...Object.keys(options)])) as Array<keyof UseProjectsOptions>;
    const hasChanged = keys.some((key) => {
      const previousValue = previousOptions[key];
      const nextValue = options[key];

      if (Array.isArray(previousValue) || Array.isArray(nextValue)) {
        return JSON.stringify(previousValue ?? []) !== JSON.stringify(nextValue ?? []);
      }

      return previousValue !== nextValue;
    });

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
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => queryParams.append(key, item));
      return;
    }

    queryParams.append(key, value.toString());
  });

  const { data, error, mutate } = useSWR<ApiEnvelope<ProjectsPayload>>(
    `/api/projects?${queryParams.toString()}`,
    fetcher
  );

  const applyFilters = useCallback((newFilters: Partial<UseProjectsOptions>) => {
    setFilters((current) => ({
      ...current,
      ...newFilters,
      page: 1,
    }));
  }, []);

  const loadMore = useCallback(() => {
    setFilters((current) => ({
      ...current,
      page: (current.page || 1) + 1,
    }));
  }, []);

  return {
    projects: data?.data?.projects || [],
    pagination: data?.data?.pagination,
    isLoading: !error && !data,
    isError: error,
    errorMessage: error instanceof Error ? error.message : data?.error,
    filters,
    applyFilters,
    loadMore,
    applyToProject: actions.applyToProject,
    saveProject: actions.saveProject,
    createProject: actions.createProject,
    mutate,
  };
}

export function useProject(id: string) {
  const { mutate: globalMutate } = useSWRConfig();
  const { data, error, mutate } = useSWR<ApiEnvelope<ProjectPayload>>(
    id ? `/api/projects/${id}` : null,
    fetcher
  );

  const updateProject = useCallback(
    async (updates: Partial<Project>): Promise<ActionResult<{ project: Project }>> => {
      try {
        const response = await apiClient.patch<ApiEnvelope<{ project: Project }>>(`/api/projects/${id}`, updates);
        await revalidateProjectKeys(globalMutate, id);
        return {
          success: true,
          data: response.data,
        };
      } catch (actionError) {
        return {
          success: false,
          error: actionError instanceof Error ? actionError.message : 'Failed to update project',
        };
      }
    },
    [globalMutate, id]
  );

  return {
    project: data?.data?.project,
    isLoading: !error && !data,
    isError: error,
    errorMessage: error instanceof Error ? error.message : data?.error,
    updateProject,
    mutate,
  };
}

export function useUserProjects(userId?: string, options: UseUserProjectsOptions = {}) {
  const actions = useProjectActions();
  const queryParams = new URLSearchParams();

  Object.entries(options).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });

  const key = userId
    ? `/api/projects/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    : null;

  const { data, error, mutate } = useSWR<ApiEnvelope<UserProjectsPayload>>(key, fetcher);

  return {
    projects: data?.data?.projects || [],
    isLoading: !error && !data,
    isError: error,
    errorMessage: error instanceof Error ? error.message : data?.error,
    applyToProject: actions.applyToProject,
    saveProject: actions.saveProject,
    createProject: actions.createProject,
    mutate,
  };
}
