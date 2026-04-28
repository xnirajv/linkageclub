'use client';

import React from 'react';
import type { Project } from '@/types/project';
import { ProjectCard } from '@/components/dashboard/student/ProjectCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen } from 'lucide-react';

interface ProjectGridProps {
  projects: Project[];
  isLoading?: boolean;
  emptyMessage?: string;
  columns?: 1 | 2 | 3;
}

export function ProjectGrid({
  projects,
  isLoading,
  emptyMessage = 'No projects found',
  columns = 2,
}: ProjectGridProps) {
  if (isLoading) {
    const gridClass =
      columns === 1
        ? 'grid-cols-1'
        : columns === 3
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2';

    return (
      <div className={`grid ${gridClass} gap-6`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!projects.length) {
    return (
      <EmptyState
        icon={FolderOpen}
        title={emptyMessage}
        description="Try adjusting your filters or search terms"
      />
    );
  }

  const gridClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
}