'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronRight, Briefcase, FolderOpen } from 'lucide-react';
import Link from 'next/link';

interface Milestone {
  _id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
}

interface Project {
  _id: string;
  title: string;
  company?: {
    name: string;
  };
  status: string;
  progress?: number;
  milestones?: Milestone[];
  deadline?: string;
}

interface ActiveProjectsProps {
  projects?: Project[];
  isLoading?: boolean;
  limit?: number;
  emptyMessage?: string;
}

export function ActiveProjects({ 
  projects = [], 
  isLoading, 
  limit = 2,
  emptyMessage = "No active projects yet"
}: ActiveProjectsProps) {
  const displayProjects = projects.length > 0 ? projects.slice(0, limit) : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-charcoal-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{emptyMessage}</p>
            <Button size="sm" variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/student/projects">
                Browse Projects
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Projects</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/student/projects/active">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayProjects.map((project) => {
            const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length || 0;
            const totalMilestones = project.milestones?.length || 1;
            const progress = project.progress || Math.round((completedMilestones / totalMilestones) * 100);

            return (
              <div key={project._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{project.title}</h4>
                    <p className="text-sm text-charcoal-600">{project.company?.name}</p>
                  </div>
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    In Progress
                  </Badge>
                </div>

                <Progress value={progress} className="h-2 mb-2" />
                
                <div className="flex items-center justify-between text-xs text-charcoal-500">
                  <span>{progress}% complete</span>
                  {project.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <Button size="sm" variant="link" className="mt-2 p-0 h-auto" asChild>
                  <Link href={`/dashboard/student/projects/${project._id}`}>
                    View Details <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}