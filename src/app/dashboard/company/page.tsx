'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Briefcase, Users, DollarSign, FileText, Target, Sparkles, 
  Plus, Search, CreditCard, Download, UserPlus, TrendingUp, Eye,
  CheckCircle2, XCircle, MessageSquare, Calendar, Clock, 
} from 'lucide-react';
import { useCompanyDashboard } from '@/hooks/useCompanyDashboard';
import { useApplications } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

function timeAgo(date: string) {
  const hours = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export default function CompanyDashboardPage() {
  const { dashboard, isLoading } = useCompanyDashboard();
  const { updateStatus } = useApplications({ role: 'company' });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-2xl" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || { activeProjects: 0, openPositions: 0, totalApplicants: 0, totalBudget: 0, pendingReview: 0 };
  const activeProjects: any[] = dashboard?.activeProjects || [];
  const recentApplications: any[] = dashboard?.recentApplications || [];
  const pipeline = (dashboard?.pipeline || { new: 0, reviewing: 0, interview: 0, offer: 0, hired: 0 }) as {
    new: number; reviewing: number; interview: number; offer: number; hired: number;
  };

  const handleShortlist = async (id: string) => { await updateStatus(id, 'shortlisted'); };
  const handleReject = async (id: string) => { await updateStatus(id, 'rejected'); };

  const pipelineStages = [
    { stage: 'new', label: 'New', count: pipeline.new || 0, color: 'bg-amber-500', icon: FileText },
    { stage: 'reviewing', label: 'Review', count: pipeline.reviewing || 0, color: 'bg-blue-500', icon: Eye },
    { stage: 'interview', label: 'Interview', count: pipeline.interview || 0, color: 'bg-purple-500', icon: Calendar },
    { stage: 'offer', label: 'Offer', count: pipeline.offer || 0, color: 'bg-orange-500', icon: Target },
    { stage: 'hired', label: 'Hired', count: pipeline.hired || 0, color: 'bg-emerald-500', icon: CheckCircle2 },
  ];

  const conversionRate = ((pipeline.hired || 0) / Math.max((pipeline.new || 1), 1) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm mb-3">
                <Sparkles className="h-3 w-3" /> Company Dashboard
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Welcome back, {dashboard?.user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="mt-2 text-white/80 text-sm md:text-base max-w-xl">
                Your company is making great progress! Here&apos;s what&apos;s happening with your projects and hiring.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-white text-blue-700 hover:bg-blue-50 font-medium shadow-lg">
                <Link href="/dashboard/company/post-project">
                  <Plus className="h-4 w-4 mr-2" /> Post New Project
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium">
                <Link href="/dashboard/company/talent-search">
                  <Search className="h-4 w-4 mr-2" /> Find Talent
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium">
                <Link href="/dashboard/company/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" /> View Analytics
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Briefcase, label: 'Active Projects', value: stats.activeProjects, href: '/dashboard/company/my-projects', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { icon: FileText, label: 'Open Positions', value: stats.openPositions, href: '/dashboard/company/jobs', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
          { icon: Users, label: 'Total Applicants', value: stats.totalApplicants, href: '/dashboard/company/applications', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { icon: DollarSign, label: 'Total Budget', value: formatCurrency(stats.totalBudget), color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href || '#'}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Active Projects + Hiring Pipeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Projects */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Active Projects ({activeProjects.length})</h2>
            </div>
            <Link href="/dashboard/company/my-projects" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <CardContent className="p-5">
            {activeProjects.length === 0 ? (
              <div className="text-center py-10">
                <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-500">No active projects yet</p>
                <p className="text-sm text-gray-400 mt-1">Post your first project to get started.</p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/dashboard/company/post-project"><Plus className="h-4 w-4 mr-1" /> Post New Project</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProjects.slice(0, 3).map((project: any) => {
                  const completed = (project.milestones || []).filter((m: any) => m.status === 'completed' || m.status === 'approved').length;
                  const total = (project.milestones || []).length || 1;
                  const progress = Math.round((completed / total) * 100);
                  const nextMilestone = (project.milestones || []).find((m: any) => m.status === 'pending' || m.status === 'in_progress');

                  return (
                    <div key={project._id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Candidate: {project.selectedApplicant?.name || 'Not assigned'} • Trust: {project.selectedApplicant?.trustScore || 'N/A'}%
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{project.status}</Badge>
                      </div>

                      {total > 1 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                            <span>Progress</span>
                            <span>{completed}/{total} milestones</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {nextMilestone && (
                        <p className="text-xs text-gray-500 mb-3">
                          Next: <span className="font-medium">{nextMilestone.title}</span> • Due in {nextMilestone.deadline} days
                        </p>
                      )}

                      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button size="sm" variant="ghost" asChild className="text-xs">
                          <Link href={`/dashboard/company/my-projects/${project._id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Message
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hiring Pipeline */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Hiring Pipeline</h2>
            </div>
            <Link href="/dashboard/company/applications" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-1 mb-6">
              {pipelineStages.map((stage, i) => (
                <React.Fragment key={stage.stage}>
                  <Link
                    href={`/dashboard/company/applications?status=${stage.stage}`}
                    className="flex flex-col items-center gap-2 flex-1 hover:opacity-80 transition-opacity group"
                  >
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stage.count}</span>
                    <span className="text-[10px] text-gray-500 text-center font-medium">{stage.label}</span>
                    <div className={`w-full h-1 rounded-full ${stage.color} group-hover:h-1.5 transition-all`} />
                  </Link>
                  {i < pipelineStages.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300 flex-shrink-0 mt-1" />}
                </React.Fragment>
              ))}
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Conversion Rate: <span className="font-bold text-gray-900 dark:text-white">{conversionRate}%</span>
                <span className="text-xs text-gray-400 ml-2">(Target: 20%)</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Applications ({stats.pendingReview} New)</h2>
          </div>
          <Link href="/dashboard/company/applications" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <CardContent className="p-5">
          {recentApplications.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-500">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">Applications will appear here when candidates apply.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentApplications.slice(0, 5).map((app: any) => (
                <div key={app._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold">
                      {(app.applicantId?.name || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {app.applicantId?.name || 'Candidate'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {app.projectId?.title || 'Project'} • Trust: {app.applicantId?.trustScore || 0}% • {timeAgo(app.submittedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" asChild className="h-8 w-8 p-0">
                      <Link href={`/dashboard/company/applications/${app._id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    {app.status === 'pending' && (
                      <>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600" onClick={() => handleShortlist(app._id)}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => handleReject(app._id)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations (Placeholder) */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/10 dark:to-amber-900/10">
        <div className="flex items-center justify-between p-5 border-b border-yellow-100 dark:border-yellow-800/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-yellow-600" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">AI-Powered Talent Recommendations</h2>
          </div>
        </div>
        <CardContent className="p-5">
          <p className="text-center text-sm text-gray-500 py-6">
            🤖 AI recommendations will appear after you post 2-3 projects and receive applications.
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="sm" asChild>
              <Link href="/dashboard/company/post-project"><Plus className="h-4 w-4 mr-1" /> Post Project</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/company/jobs/post"><Plus className="h-4 w-4 mr-1" /> Post Job</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/company/talent-search"><Search className="h-4 w-4 mr-1" /> Search Talent</Link>
            </Button>
            <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-1" /> Invite Team Member</Button>
            <Button variant="outline" size="sm"><CreditCard className="h-4 w-4 mr-1" /> Add Funds</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Generate Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}