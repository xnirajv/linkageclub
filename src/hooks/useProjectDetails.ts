'use client';

import useSWR from 'swr';

interface ProjectDetails {
  _id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
  description: string;
  summary?: string;
  budget: { type: string; min: number; max: number; currency: string };
  duration: number;
  location?: { type: string; label?: string };
  skills: Array<{ name: string; level: string }>;
  candidate?: {
    _id: string;
    name: string;
    avatar?: string;
    trustScore: number;
    location?: string;
    skills?: string[];
    portfolio?: Array<{ title: string; tech: string; rating: number }>;
  };
  milestones: Array<{
    _id: string;
    title: string;
    amount: number;
    deadline: number;
    status: string;
    deliverables?: string;
    feedback?: string;
    submittedAt?: string;
    progress?: number;
  }>;
  paymentSummary?: {
    totalBudget: number;
    released: number;
    pending: number;
    platformFee: number;
    transactions: Array<{
      _id: string;
      type: string;
      amount: number;
      date: string;
      milestone?: string;
      status: string;
    }>;
  };
  attachments: Array<{ _id: string; name: string; size: number; url: string }>;
  requirements: string[];
  experienceLevel: string;
  visibility: string;
  applicationsCount: number;
  createdAt: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  return data.data?.project || data.project;
};

export function useProjectDetails(id: string) {
  const { data, error, isLoading, mutate } = useSWR<ProjectDetails>(
    id ? `/api/projects/${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    project: data,
    isLoading,
    isError: !!error,
    errorMessage: error instanceof Error ? error.message : undefined,
    refetch: mutate,
  };
}