'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, Briefcase, Users, Plus, Eye, MessageSquare,
  Sparkles, TrendingUp, Clock, DollarSign, FileText,
  Search,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProjects } from '@/hooks/useProjects';
import { useApplications } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(v: number) {
  if (!v) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(v);
}

function timeAgo(date: string) {
  const hours = Math.round((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const { projects = [], isLoading: pLoading } = useUserProjects(user?.id, { role: 'company' });
  const { applications = [], isLoading: aLoading } = useApplications({ role: 'company', limit: 10 });

  const allProjects = projects as any[];
  const activeProjects = allProjects.filter(
    (p: any) => p.status === 'open' || p.status === 'in_progress'
  );
  const recentApps = (applications as any[]).slice(0, 5);
  const isLoading = pLoading || aLoading;

  const totalSpent = allProjects.reduce(
    (sum: number, p: any) => sum + (p.budget?.max || p.budget?.min || 0),
    0
  );
  const pendingApps = (applications as any[]).filter(
    (a: any) => a.status === 'pending'
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your projects and hiring.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          icon={<Briefcase className="h-5 w-5" />}
          label="Active Projects"
          value={activeProjects.length}
          color="blue"
          link="/dashboard/company/my-projects"
        />
        <StatsCard
          icon={<Users className="h-5 w-5" />}
          label="Total Applicants"
          value={applications.length}
          color="green"
          link="/dashboard/company/applications"
        />
        <StatsCard
          icon={<FileText className="h-5 w-5" />}
          label="Pending Review"
          value={pendingApps}
          color="orange"
          link="/dashboard/company/applications?status=pending"
          highlight={pendingApps > 0}
        />
        <StatsCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Total Budget"
          value={formatCurrency(totalSpent)}
          color="purple"
          valueClassName="text-lg"
        />
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Projects
            </h2>
            {activeProjects.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeProjects.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/company/my-projects"
              className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
            <Button size="sm" asChild>
              <Link href="/dashboard/company/post-project">
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {activeProjects.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-none bg-transparent">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No active projects yet
              </h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                Post your first project and start receiving applications from talented candidates.
              </p>
              <Button asChild>
                <Link href="/dashboard/company/post-project">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Post Your First Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeProjects.slice(0, 4).map((project: any) => {
              const milestones = project.milestones || [];
              const completed = milestones.filter(
                (m: any) => m.status === 'completed' || m.status === 'approved'
              ).length;
              const progress = milestones.length > 0
                ? Math.round((completed / milestones.length) * 100)
                : 0;

              return (
                <Card
                  key={project._id}
                  className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {project.title}
                          </h3>
                          <Badge
                            variant={project.status === 'open' ? 'default' : 'secondary'}
                            className="text-[10px] flex-shrink-0"
                          >
                            {project.status === 'open' ? 'Open' : 'In Progress'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {project.applicationsCount || 0} applicants • {formatCurrency(project.budget?.max || project.budget?.min || 0)} • {project.duration || 0} days
                        </p>
                      </div>
                    </div>

                    {milestones.length > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{completed}/{milestones.length} milestones</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <Button size="sm" variant="ghost" asChild className="text-xs">
                        <Link href={`/dashboard/company/my-projects/${project._id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Details
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" asChild className="text-xs">
                        <Link href={`/dashboard/company/my-projects/${project._id}/applications`}>
                          <Users className="h-3.5 w-3.5 mr-1" />
                          Applicants
                        </Link>
                      </Button>
                      <Button size="sm" variant="ghost" asChild className="text-xs">
                        <Link href={`/dashboard/company/my-projects/${project._id}/manage`}>
                          <TrendingUp className="h-3.5 w-3.5 mr-1" />
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Applications
            </h2>
            {recentApps.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {recentApps.length}
              </Badge>
            )}
          </div>
          <Link
            href="/dashboard/company/applications"
            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-none bg-transparent">
            <CardContent className="p-8 text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">
                No applications yet. When candidates apply, they&apos;ll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentApps.map((app: any) => (
              <Card
                key={app._id}
                className="border border-gray-200 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-info-500 flex items-center justify-center text-white text-sm font-medium">
                      {(app.applicantId?.name || 'C')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {app.applicantId?.name || 'Candidate'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {app.projectId?.title || 'Project'} • {timeAgo(app.submittedAt || app.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        app.status === 'pending' ? 'warning' :
                        app.status === 'shortlisted' ? 'info' :
                        app.status === 'accepted' ? 'success' :
                        app.status === 'rejected' ? 'error' : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {app.status}
                    </Badge>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/dashboard/company/applications/${app._id}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/dashboard/messages">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 md:grid-cols-4">
        <QuickActionCard
          icon={<Plus className="h-5 w-5" />}
          title="Post Project"
          description="Create a new project listing"
          href="/dashboard/company/post-project"
          color="blue"
        />
        <QuickActionCard
          icon={<Search className="h-5 w-5" />}
          title="Find Talent"
          description="Search for skilled candidates"
          href="/dashboard/company/talent-search"
          color="green"
        />
        <QuickActionCard
          icon={<BarChart3 className="h-5 w-5" />}
          title="Analytics"
          description="View hiring insights"
          href="/dashboard/company/analytics"
          color="purple"
        />
        <QuickActionCard
          icon={<Users className="h-5 w-5" />}
          title="Team"
          description="Manage your team"
          href="/dashboard/company/team"
          color="orange"
        />
      </div>
    </div>
  );
}

// Reusable Stats Card
function StatsCard({
  icon,
  label,
  value,
  color,
  link,
  highlight = false,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'orange' | 'purple';
  link?: string;
  highlight?: boolean;
  valueClassName?: string;
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  };

  const content = (
    <Card className={`border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 ${link ? 'cursor-pointer' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold text-gray-900 dark:text-white ${valueClassName || ''}`}>
              {value}
            </p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
            {icon}
          </div>
        </div>
        {highlight && (
          <div className="mt-3 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Needs attention
          </div>
        )}
      </CardContent>
    </Card>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}

// Quick Action Card
function QuickActionCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorMap = {
    blue: 'hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10',
    green: 'hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-900/10',
    purple: 'hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/10',
    orange: 'hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-900/10',
  };

  return (
    <Link href={href}>
      <Card className={`border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-none bg-transparent transition-all duration-200 ${colorMap[color]}`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
              {icon}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">{title}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}