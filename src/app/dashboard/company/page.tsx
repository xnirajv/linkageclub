'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Users, Plus, Eye, Sparkles, FileText, DollarSign, Search, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProjects } from '@/hooks/useProjects';
import { useApplications } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

function timeAgo(date: string) {
  const hours = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const { projects = [], isLoading: pLoading } = useUserProjects(user?.id, { role: 'company' });
  const { applications = [], isLoading: aLoading } = useApplications({ role: 'company', limit: 10 });

  const allProjects = projects as any[];
  const activeProjects = allProjects.filter((p: any) => p.status === 'open' || p.status === 'in_progress');
  const recentApps = (applications as any[]).slice(0, 5);
  const isLoading = pLoading || aLoading;

  const totalBudget = allProjects.reduce((s: number, p: any) => s + (p.budget?.max || p.budget?.min || 0), 0);
  const pendingCount = (applications as any[]).filter((a: any) => a.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your project overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Briefcase, label: 'Active', value: activeProjects.length, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', href: '/dashboard/company/my-projects' },
          { icon: Users, label: 'Applicants', value: applications.length, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', href: '/dashboard/company/applications' },
          { icon: FileText, label: 'Pending', value: pendingCount, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', href: '/dashboard/company/applications?status=pending' },
          { icon: DollarSign, label: 'Budget', value: formatCurrency(totalBudget), color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', href: '#' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-gray-500">{stat.label}</p><p className="text-2xl font-bold mt-1">{stat.value}</p></div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><h2 className="text-lg font-semibold">Active Projects</h2><Badge variant="secondary" className="text-xs">{activeProjects.length}</Badge></div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/company/my-projects" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"><span>View all</span><ArrowRight className="h-3 w-3" /></Link>
            <Button size="sm" asChild><Link href="/dashboard/company/post-project"><Plus className="h-4 w-4 mr-1" />New</Link></Button>
          </div>
        </div>
        {activeProjects.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-none bg-transparent">
            <CardContent className="p-12 text-center">
              <Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">No active projects yet</p>
              <Button asChild><Link href="/dashboard/company/post-project"><Sparkles className="h-4 w-4 mr-2" />Post Your First Project</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeProjects.slice(0, 4).map((p: any) => {
              const completed = (p.milestones || []).filter((m: any) => m.status === 'completed' || m.status === 'approved').length;
              const progress = (p.milestones || []).length > 0 ? Math.round((completed / p.milestones.length) * 100) : 0;
              return (
                <Card key={p._id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{p.title}</h3>
                          <Badge variant={p.status === 'open' ? 'default' : 'secondary'} className="text-[10px] flex-shrink-0">{p.status === 'open' ? 'Open' : 'In Progress'}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{p.applicationsCount || 0} applicants • {formatCurrency(p.budget?.max || 0)} • {p.duration || 0}d</p>
                      </div>
                    </div>
                    {(p.milestones || []).length > 0 && <Progress value={progress} className="h-1.5 mb-3" />}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <Button size="sm" variant="ghost" asChild className="text-xs"><Link href={`/dashboard/company/my-projects/${p._id}`}><Eye className="h-3.5 w-3.5 mr-1" />Details</Link></Button>
                      <Button size="sm" variant="ghost" asChild className="text-xs"><Link href={`/dashboard/company/my-projects/${p._id}/applications`}><Users className="h-3.5 w-3.5 mr-1" />Applicants</Link></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <Link href="/dashboard/company/applications" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"><span>View all</span><ArrowRight className="h-3 w-3" /></Link>
        </div>
        {recentApps.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-none bg-transparent"><CardContent className="p-8 text-center"><Users className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No applications yet</p></CardContent></Card>
        ) : (
          <div className="space-y-2">
            {recentApps.map((app: any) => (
              <Card key={app._id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium">{(app.applicantId?.name || 'C')[0]}</div>
                    <div>
                      <p className="font-medium text-sm">{app.applicantId?.name || 'Candidate'}</p>
                      <p className="text-xs text-gray-500">{app.projectId?.title || 'Project'} • {timeAgo(app.submittedAt || app.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={app.status === 'pending' ? 'warning' : app.status === 'shortlisted' ? 'info' : app.status === 'accepted' ? 'success' : 'secondary'} className="text-[10px]">{app.status}</Badge>
                    <Button size="sm" variant="ghost" asChild className="h-8 w-8 p-0"><Link href={`/dashboard/company/applications/${app._id}`}><Eye className="h-3.5 w-3.5" /></Link></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          { icon: Plus, title: 'Post Project', href: '/dashboard/company/post-project' },
          { icon: Search, title: 'Find Talent', href: '/dashboard/company/talent-search' },
          { icon: BarChart3, title: 'Analytics', href: '/dashboard/company/analytics' },
          { icon: Users, title: 'Team', href: '/dashboard/company/team' },
        ].map((a) => (
          <Link key={a.title} href={a.href}>
            <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-none bg-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><a.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" /></div>
                <p className="font-medium text-sm">{a.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}