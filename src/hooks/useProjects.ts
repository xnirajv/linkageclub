import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/api/client';

interface UseProjectsOptions {
  page?: number;
  limit?: number;
  category?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  experienceLevel?: string;
  search?: string;
}

// Project creation data interface
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
    description: string;
    amount: number;
    deadline: number;
  }>;
}

interface ProjectsResponse {
  projects?: any[];
  pagination?: any;
}

interface ProjectResponse {
  project?: any;
}

export function useProjects(options: UseProjectsOptions = {}) {
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

  const { data, error, mutate } = useSWR<ProjectsResponse>(
    `/api/projects?${queryParams.toString()}`,
    fetcher
  );

  const applyFilters = useCallback((newFilters: Partial<UseProjectsOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const loadMore = useCallback(() => {
    setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  }, []);

  const applyToProject = useCallback(async (projectId: string, application: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application),
      });

      if (!response.ok) throw new Error('Failed to apply');

      mutate(); // Refresh projects
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  const saveProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/save`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to save');
      
      mutate(); // Refresh projects
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  // ✅ NEW: Create project method
  const createProject = useCallback(async (projectData: CreateProjectData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }
      
      const data = await response.json();
      
      // Refresh projects list
      mutate();
      
      return { 
        success: true, 
        project: data.project,
        id: data.project?._id 
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }, [mutate]);

  return {
    projects: data?.projects || [],
    pagination: data?.pagination,
    isLoading: !error && !data,
    isError: error,
    filters,
    applyFilters,
    loadMore,
    applyToProject,
    saveProject,
    createProject, // ✅ Now included!
    mutate,
  };
}

export function useProject(id: string) {
  const { data, error, mutate } = useSWR<ProjectResponse>(
    id ? `/api/projects/${id}` : null,
    fetcher
  );

  const updateProject = useCallback(async (updates: any) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update');

      mutate(); // Refresh project
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [id, mutate]);

  return {
    project: data?.project,
    isLoading: !error && !data,
    isError: error,
    updateProject,
    mutate,
  };
}
