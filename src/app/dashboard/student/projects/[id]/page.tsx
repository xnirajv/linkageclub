'use client';

import { useParams } from 'next/navigation';
import { useProject } from '@/hooks/useProjects';
import { ProjectDetails } from '@/components/projects/ProjectDetails';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Project not found</h2>
        <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  return <ProjectDetails project={project} />;
}