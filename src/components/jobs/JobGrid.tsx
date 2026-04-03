'use client';

import React from 'react';
import { Job } from '@/types/job';
import { JobCard } from '@/components/dashboard/student/JobCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase } from 'lucide-react';

interface JobGridProps {
  jobs: Job[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function JobGrid({ jobs, isLoading, emptyMessage = 'No jobs found' }: JobGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!jobs.length) {
    return (
      <EmptyState
        icon={Briefcase}
        title={emptyMessage}
        description="Try adjusting your filters or search terms"
      />
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  );
}
