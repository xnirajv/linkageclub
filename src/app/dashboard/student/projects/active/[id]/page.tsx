'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectDetails } from '@/components/projects/ProjectDetails';
import { MilestoneTracker } from '@/components/projects/MilestoneTracker';
import { ProjectChat } from '@/components/projects/ProjectChat';
import { useProject } from '@/hooks/useProjects';
import { getCompanyId } from '@/types/project';
import DashboardLayout from '@/app/dashboard/layout';

export default function ActiveProjectPage() {
  const params = useParams();
  const { project, isLoading } = useProject(params.id as string);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Project not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-gray-600">
            Active Project • Started on {new Date(project.startDate || project.createdAt).toLocaleDateString()}
          </p>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="text-lg font-semibold">
                Rs. {project.budget.min.toLocaleString()} - Rs. {project.budget.max.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-lg font-semibold">{project.duration} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="text-lg font-semibold">{project.company?.name || 'Company'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-semibold">
                {project.milestones?.length
                  ? Math.round((project.milestones.filter((m: any) => m.status === 'approved').length / project.milestones.length) * 100)
                  : 0}% Complete
              </p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectDetails project={project} />
          </TabsContent>

          <TabsContent value="milestones">
            <MilestoneTracker milestones={project.milestones as any} projectId={project._id} />
          </TabsContent>

          <TabsContent value="chat">
            <ProjectChat projectId={project._id} companyId={getCompanyId(project)} />
          </TabsContent>

          <TabsContent value="files">
            <div className="text-center py-12 text-gray-500">Files section coming soon...</div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}