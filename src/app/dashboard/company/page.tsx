'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Users, DollarSign, FileText, Target, Sparkles, Plus, Search, CreditCard, Download, UserPlus } from 'lucide-react';
import { useCompanyDashboard } from '@/hooks/useCompanyDashboard';
import { WelcomeBanner } from '@/components/dashboard/company/WelcomeBanner';
import { StatCard } from '@/components/dashboard/company/StateCard';
import { ActiveProjectCard } from '@/components/dashboard/company/ActiveProjectsCard';
import { ApplicationListItem } from '@/components/dashboard/company/ApplicationListItem';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useApplications } from '@/hooks/useApplications';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

export default function CompanyDashboardPage() {
  const { dashboard, isLoading } = useCompanyDashboard();
  const { updateStatus } = useApplications({ role: 'company', limit: 5 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-28 rounded-xl" />))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || { activeProjects: 0, openPositions: 0, totalApplicants: 0, totalBudget: 0, pendingReview: 0 };
  const activeProjects: any[] = dashboard?.activeProjects || [];
  const recentApplications: any[] = dashboard?.recentApplications || [];
  
  // ✅ Fix: Type pipeline properly
  const pipeline = (dashboard?.pipeline || {}) as {
    new: number;
    reviewing: number;
    interview: number;
    offer: number;
    hired: number;
  };

  const handleShortlist = async (id: string) => { await updateStatus(id, 'shortlisted'); };
  const handleReject = async (id: string) => { const reason = prompt('Reason (optional):'); await updateStatus(id, 'rejected', reason || undefined); };

  const pipelineStages = [
    { stage: 'new', label: 'New', count: pipeline.new || 0, color: 'bg-yellow-500' },
    { stage: 'reviewing', label: 'Reviewing', count: pipeline.reviewing || 0, color: 'bg-blue-500' },
    { stage: 'interview', label: 'Interview', count: pipeline.interview || 0, color: 'bg-purple-500' },
    { stage: 'offer', label: 'Offer', count: pipeline.offer || 0, color: 'bg-orange-500' },
    { stage: 'hired', label: 'Hired', count: pipeline.hired || 0, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner firstName={dashboard?.user?.name?.split(' ')[0] || 'there'} />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={<Briefcase className="h-5 w-5" />} label="Active Projects" value={stats.activeProjects} href="/dashboard/company/my-projects" colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Open Positions" value={stats.openPositions} href="/dashboard/company/jobs" colorClass="text-green-600 bg-green-50 dark:bg-green-900/20" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Applicants" value={stats.totalApplicants} href="/dashboard/company/applications" colorClass="text-purple-600 bg-purple-50 dark:bg-purple-900/20" />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Total Budget" value={formatCurrency(stats.totalBudget)} colorClass="text-orange-600 bg-orange-50 dark:bg-orange-900/20" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold">Active Projects ({activeProjects.length})</h2>
            </div>
            <Link href="/dashboard/company/my-projects" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <CardContent className="p-5">
            {activeProjects.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">No active projects yet</p>
                <p className="text-sm text-gray-500 mt-1">Post your first project to get started.</p>
                <Button asChild className="mt-4"><Link href="/dashboard/company/post-project"><Plus className="h-4 w-4 mr-1" />Post New Project</Link></Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProjects.map((project: any) => (<ActiveProjectCard key={project._id} project={project} />))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 p-5 border-b border-gray-100 dark:border-gray-800">
            <Target className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold">Hiring Pipeline</h2>
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2 mb-6">
              {pipelineStages.map((stage, i) => (
                <React.Fragment key={stage.stage}>
                  <Link href={`/dashboard/company/applications?status=${stage.stage}`} className="flex flex-col items-center gap-2 flex-1 hover:opacity-80 transition-opacity">
                    <span className="text-2xl font-bold">{stage.count}</span>
                    <span className="text-xs text-gray-500 text-center">{stage.label}</span>
                    <div className={`w-full h-1.5 rounded-full ${stage.color}`} />
                  </Link>
                  {i < pipelineStages.length - 1 && <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0 mt-2" />}
                </React.Fragment>
              ))}
            </div>
            <div className="text-center text-sm text-gray-500">
              Conversion Rate: {((pipeline.hired || 0) / Math.max(pipeline.new || 1, 1) * 100).toFixed(1)}% (Target: 20%)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2"><Users className="h-5 w-5 text-green-600" /><h2 className="font-semibold">Recent Applications ({stats.pendingReview} New)</h2></div>
          <Link href="/dashboard/company/applications" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <CardContent className="p-5">
          {recentApplications.length === 0 ? (
            <div className="text-center py-12"><Users className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="font-medium">No applications yet</p></div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app: any) => (<ApplicationListItem key={app._id} application={app} onShortlist={handleShortlist} onReject={handleReject} />))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-600" /><h2 className="font-semibold">AI-Powered Talent Recommendations</h2></div>
          <Link href="/dashboard/company/talent-search" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <CardContent className="p-5"><p className="text-center text-gray-500 py-8">AI recommendations will appear after posting 2-3 projects.</p></CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold">Spending Analytics</h2>
          <Link href="/dashboard/company/analytics" className="text-sm text-blue-600 hover:underline flex items-center gap-1">Detailed Analytics <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <CardContent className="p-5">
          <div className="text-center mb-6">
            <span className="text-3xl font-bold">{formatCurrency(stats.totalBudget)}</span>
            <p className="text-sm text-gray-500 mt-1">Total Budget</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm sticky bottom-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="sm"><Link href="/dashboard/company/post-project"><Plus className="h-4 w-4" />Post Project</Link></Button>
            <Button variant="outline" size="sm" asChild><Link href="/dashboard/company/talent-search"><Search className="h-4 w-4" />Find Talent</Link></Button>
            <Button variant="outline" size="sm"><UserPlus className="h-4 w-4" />Invite Member</Button>
            <Button variant="outline" size="sm"><CreditCard className="h-4 w-4" />Add Funds</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" />Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}