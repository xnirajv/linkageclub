'use client';

import useSWR from 'swr';

interface DashboardData {
  user: { name: string; email: string };
  stats: {
    activeProjects: number;
    openPositions: number;
    totalApplicants: number;
    totalBudget: number;
    pendingReview: number;
  };
  activeProjects: any[];
  recentApplications: any[];
  pipeline: Record<string, number>;
  recommendations: any[];
}

interface DashboardResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
}

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dashboard data');
  }
  return response.json();
};

export function useCompanyDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
    '/api/company/dashboard',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000,
      dedupingInterval: 10000,
    }
  );

  return {
    dashboard: data?.data,
    isLoading,
    isError: !!error,
    errorMessage: error instanceof Error ? error.message : data?.error,
    refetch: mutate,
  };
}