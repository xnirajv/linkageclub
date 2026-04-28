'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Users, Plus, Eye, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProjects } from '@/hooks/useProjects';
import { useApplications } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const { projects = [], isLoading: pLoading } = useUserProjects(user?.id, { role: 'company' });
  const { applications = [], isLoading: aLoading } = useApplications({ role: 'company', limit: 10 });

  const activeProjects = (projects as any[]).filter((p) => p.status === 'open' || p.status === 'in_progress').slice(0, 4);
  const recentApps = (applications as any[]).slice(0, 5);
  const isLoading = pLoading || aLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32 rounded-lg" /><Skeleton className="h-32 rounded-lg" /><Skeleton className="h-32 rounded-lg" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, {user?.name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your projects.</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-none">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold">{activeProjects.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-800 shadow-none">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Applicants</p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-800 shadow-none">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold">
                {formatCurrency(activeProjects.reduce((s: number, p: any) => s + (p.budget?.max || 0), 0))}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Plus className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Projects</h2>
          <Link href="/dashboard/company/my-projects" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {activeProjects.length === 0 ? (
          <Card className="border border-dashed border-gray-300 dark:border-gray-700 shadow-none">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No active projects</p>
              <Button asChild className="mt-3" size="sm">
                <Link href="/dashboard/company/post-project"><Plus className="h-4 w-4 mr-1" />Post Project</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeProjects.map((project: any) => (
              <Card key={project._id} className="border border-gray-200 dark:border-gray-800 shadow-none hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{project.title}</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {project.status === 'open' ? 'Open' : 'In Progress'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {project.applicationsCount || 0} applicants • {formatCurrency(project.budget?.max || 0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/dashboard/company/my-projects/${project._id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/dashboard/company/my-projects/${project._id}/applications`}><Users className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <Link href="/dashboard/company/applications" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <Card className="border border-dashed border-gray-300 dark:border-gray-700 shadow-none">
            <CardContent className="p-8 text-center"><p className="text-gray-500">No applications yet</p></CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentApps.map((app: any) => (
              <Card key={app._id} className="border border-gray-200 dark:border-gray-800 shadow-none">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{app.applicantId?.name || 'Candidate'}</p>
                    <p className="text-xs text-gray-500">{app.projectId?.title || 'Project'} • {app.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/dashboard/company/applications/${app._id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/dashboard/messages"><MessageSquare className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}