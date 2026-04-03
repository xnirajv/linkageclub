'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Briefcase, ArrowRight, Users, Clock, Calendar, TrendingUp, Plus, Rocket } from 'lucide-react';

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

export function ActiveProjects({ 
  projects, 
  isLoading, 
  onViewAll,
  onProjectClick 
}: ActiveProjectsProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary-600" />
            Active Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-charcoal-100 dark:bg-charcoal-700 rounded-xl"></div>
            <div className="h-20 bg-charcoal-100 dark:bg-charcoal-700 rounded-xl"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalApplications = projects.reduce((sum, p) => sum + (p.applicationsCount || 0), 0);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <Rocket className="h-4 w-4 text-primary-600" />
            </div>
            Active Projects
            {projects.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({projects.length})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {totalApplications} total applicants
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center">
              <Briefcase className="h-10 w-10 text-charcoal-400" />
            </div>
            <p className="text-muted-foreground font-medium">No active projects</p>
            <p className="text-xs text-muted-foreground mt-1">Post a project to get started</p>
            <Button variant="outline" size="sm" className="mt-4 gap-2" asChild>
              <a href="/dashboard/company/post-project">
                <Plus className="h-3 w-3" />
                Post New Project
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group p-4 rounded-xl border border-charcoal-100 dark:border-charcoal-800 bg-card dark:bg-charcoal-900 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => onProjectClick?.(project._id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-charcoal-950 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                        {project.title}
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="h-2.5 w-2.5" />
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.applicationsCount || 0} applications
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Posted {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                {project.applicationsCount && project.applicationsCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-charcoal-100 dark:border-charcoal-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-charcoal-500">Response rate</span>
                      <span className="text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        85%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {projects.length > 0 && onViewAll && (
          <div className="mt-4 pt-3 border-t border-charcoal-100 dark:border-charcoal-800 text-center">
            <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1 text-primary-600 hover:text-primary-700">
              View All Projects
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}