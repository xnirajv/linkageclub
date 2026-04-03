import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/api/client';

interface UseJobsOptions {
  page?: number;
  limit?: number;
  type?: string[];
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  experience?: string;
  skills?: string[];
  search?: string;
  saved?: boolean;
}

// Job creation data interface
interface CreateJobData {
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  location: string;
  type: string;
  experience: {
    min: number;
    max: number;
    level: string;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  skills: Array<{
    name: string;
    level: string;
    mandatory: boolean;
  }>;
  benefits: string[];
  department: string;
  openings: number;
  questions?: Array<{
    question: string;
    type: string;
    required: boolean;
  }>;
  deadline?: string;
}

interface JobsResponse {
  jobs?: any[];
  pagination?: any;
}

interface JobResponse {
  job?: any;
  similarJobs?: any[];
}

export function useJobs(options: UseJobsOptions = {}) {
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

  const { data, error, mutate } = useSWR<JobsResponse>(
    `/api/jobs?${queryParams.toString()}`,
    fetcher
  );

  const applyFilters = useCallback((newFilters: Partial<UseJobsOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const loadMore = useCallback(() => {
    setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  }, []);

  const applyToJob = useCallback(async (jobId: string, application: any) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application),
      });

      if (!response.ok) throw new Error('Failed to apply');

      mutate(); // Refresh jobs
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  const saveJob = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to save');
      
      mutate(); // Refresh jobs
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  // ✅ NEW: Create job method
  const createJob = useCallback(async (jobData: CreateJobData) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create job');
      }
      
      const data = await response.json();
      
      // Refresh jobs list after creating new job
      mutate();
      
      return { 
        success: true, 
        job: data.job,
        id: data.job?._id 
      };
    } catch (error) {
      console.error('Error creating job:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }, [mutate]);

  return {
    jobs: data?.jobs || [],
    pagination: data?.pagination,
    isLoading: !error && !data,
    isError: error,
    filters,
    applyFilters,
    loadMore,
    applyToJob,
    saveJob,
    createJob, // ✅ Now included!
    mutate,
  };
}

export function useJob(id: string) {
  const { data, error, mutate } = useSWR<JobResponse>(
    id ? `/api/jobs/${id}` : null,
    fetcher
  );

  const checkIfSaved = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${id}/save`);
      const data = await response.json();
      return data.saved;
    } catch (error) {
      return false;
    }
  }, [id]);

  // ✅ NEW: Update job method
  const updateJob = useCallback(async (jobData: Partial<CreateJobData>) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) throw new Error('Failed to update job');
      
      mutate(); // Refresh job data
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [id, mutate]);

  // ✅ NEW: Delete job method
  const deleteJob = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete job');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [id]);

  return {
    job: data?.job,
    similarJobs: data?.similarJobs,
    isLoading: !error && !data,
    isError: error,
    checkIfSaved,
    updateJob, // ✅ New
    deleteJob, // ✅ New
    mutate,
  };
}
