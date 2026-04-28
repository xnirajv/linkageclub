'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Briefcase, ArrowRight, Users, Clock, Calendar, Plus, Rocket } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Project {
  _id: string;
  title: string;
  status: string;
  applicationsCount?: number;
  createdAt: string;
}

interface ActiveProjectsProps {
  projects: Project[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onProjectClick?: (id: string) => void;
}

export function ActiveProjects({ projects, isLoading, onViewAll, onProjectClick }: ActiveProjectsProps) {
  if (isLoading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-5 space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  const totalApplications = projects.reduce((sum, p) => sum + (p.applicationsCount || 0), 0);

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Rocket className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-sm">Active Projects ({projects.length})</h3>
        </div>
        <span className="text-xs text-gray-500">{totalApplications} applicants</span>
      </div>
      <CardContent className="p-5">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No active projects</p>
            <Button size="sm" variant="outline" className="mt-3" asChild>
              <Link href="/dashboard/company/post-project"><Plus className="h-3 w-3 mr-1" />Post Project</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <button
                key={project._id}
                className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
                onClick={() => onProjectClick?.(project._id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{project.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{project.applicationsCount || 0}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}
        {projects.length > 0 && onViewAll && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs">
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}