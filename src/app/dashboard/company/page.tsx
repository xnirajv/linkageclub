'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  CreditCard,
  FileText,
  MessageSquare,
  PenSquare,
  Search,
  Sparkles,
  Target,
  UserPlus,
  Users,
} from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { useUserProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CompanyProject = {
  _id?: string;
  title?: string;
  status?: string;
  duration?: number;
  createdAt?: string | Date;
  applicationsCount?: number;
  budget?: { min?: number; max?: number };
  milestones?: Array<{ title?: string; status?: string; deadline?: number | string }>;
  selectedApplicant?: string | { _id?: string; name?: string; trustScore?: number };
};

type CompanyApplication = {
  _id?: string;
  status?: string;
  createdAt?: string;
  submittedAt?: string;
  proposedAmount?: number;
  proposedDuration?: number;
  projectId?: { _id?: string; title?: string };
  applicantId?: { _id?: string; name?: string; trustScore?: number; experience?: number | Array<any> };
};

const recommendationCards = [
  { name: 'Priya Mehta', role: 'React Expert', trust: 95, availability: 'Available now', rate: '₹1,500/hr', match: 98 },
  { name: 'Neha Gupta', role: 'Node.js Pro', trust: 92, availability: 'Available in 2 weeks', rate: '₹1,200/hr', match: 95 },
  { name: 'Vikram Singh', role: 'Full Stack', trust: 94, availability: 'Available now', rate: '₹2,000/hr', match: 92 },
];

const spendingTrend = [
  { month: 'Jan', amount: 42000 },
  { month: 'Feb', amount: 56000 },
  { month: 'Mar', amount: 47000 },
  { month: 'Apr', amount: 69000 },
  { month: 'May', amount: 52000 },
  { month: 'Jun', amount: 78000 },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRelative(dateValue?: string | Date) {
  if (!dateValue) return 'Recently';
  const now = Date.now();
  const value = new Date(dateValue).getTime();
  const diffHours = Math.max(1, Math.round((now - value) / (1000 * 60 * 60)));
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  const diffWeeks = Math.round(diffDays / 7);
  return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
}

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const { projects = [], isLoading: projectsLoading } = useUserProjects(user?.id, { role: 'company' });
  const { applications = [], isLoading: applicationsLoading, updateStatus } = useApplications({ role: 'company', limit: 100 });

  const typedProjects = projects as unknown as CompanyProject[];
  const typedApplications = applications as CompanyApplication[];
  const companyName = (user as { company?: { name?: string } } | null)?.company?.name || 'TechCorp Solutions';
  const firstName = user?.name?.split(' ')[0] || 'Rahul';

  const stats = useMemo(() => {
    const activeProjects = typedProjects.filter((project) => ['in_progress', 'active'].includes(project.status || '')).length;
    const openProjects = typedProjects.filter((project) => ['open', 'published'].includes(project.status || '')).length;
    const totalApplicants = typedApplications.length;
    const totalSpent = typedProjects.reduce((sum, project) => sum + (project.budget?.max || project.budget?.min || 0), 0);
    const pendingCount = typedApplications.filter((application) => application.status === 'pending').length;
    const reviewedCount = typedApplications.filter((application) => application.status === 'reviewed').length;
    const interviewCount = typedApplications.filter((application) => ['interview_scheduled', 'interview_completed'].includes(application.status || '')).length;
    const offerCount = typedApplications.filter((application) => application.status === 'accepted').length;
    const hiredCount = typedApplications.filter((application) => application.status === 'accepted').length;
    const conversionRate = totalApplicants ? Math.round((hiredCount / totalApplicants) * 1000) / 10 : 0;

    return {
      activeProjects,
      openProjects,
      totalApplicants,
      totalSpent,
      pendingCount,
      reviewedCount,
      interviewCount,
      offerCount,
      hiredCount,
      conversionRate,
    };
  }, [typedApplications, typedProjects]);

  const quickStats = [
    {
      label: 'Active Projects',
      value: `${stats.activeProjects}`,
      trend: `↑ ${Math.max(1, Math.ceil(stats.activeProjects / 2))} from last month`,
      icon: Briefcase,
      accent: 'from-primary-700 to-info-600',
    },
    {
      label: 'Open Positions',
      value: `${stats.openProjects}`,
      trend: `↑ ${Math.max(1, Math.ceil(stats.openProjects / 2))} from last month`,
      icon: PenSquare,
      accent: 'from-secondary-500 to-secondary-300',
    },
    {
      label: 'Total Applicants',
      value: `${stats.totalApplicants}`,
      trend: `↑ ${Math.max(3, Math.ceil(stats.totalApplicants / 4))} from last month`,
      icon: Users,
      accent: 'from-info-600 to-primary-600',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(stats.totalSpent),
      trend: '↑ 45% from last month',
      icon: CreditCard,
      accent: 'from-charcoal-700 to-charcoal-500',
    },
  ];

  const activeProjects = typedProjects
    .filter((project) => ['open', 'in_progress', 'active'].includes(project.status || ''))
    .slice(0, 3);
  const recentApplications = typedApplications.slice(0, 3);
  const pipelineStages = [
    { label: 'New', count: stats.pendingCount },
    { label: 'Reviewing', count: stats.reviewedCount },
    { label: 'Interview', count: stats.interviewCount },
    { label: 'Offer', count: stats.offerCount },
    { label: 'Hired', count: stats.hiredCount },
  ];

  if (projectsLoading || applicationsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-56 animate-pulse rounded-[32px] bg-card/70 dark:bg-charcoal-900/65" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[28px] bg-card/70 dark:bg-charcoal-900/65" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="h-96 animate-pulse rounded-[28px] bg-card/70 dark:bg-charcoal-900/65" />
          <div className="h-96 animate-pulse rounded-[28px] bg-card/70 dark:bg-charcoal-900/65" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,_rgba(225,221,214,0.35),_transparent_35%),linear-gradient(135deg,_rgba(52,74,134,0.96),_rgba(64,119,148,0.95)_60%,_rgba(75,73,69,0.95))] text-white shadow-[0_28px_80px_rgba(52,74,134,0.24)]">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-card/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/88">
                <BadgeCheck className="h-3.5 w-3.5" />
                Company Dashboard
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">Welcome back, {firstName}!</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
                Your company {companyName} is making great progress! Here&apos;s what&apos;s happening with your projects and hiring.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="bg-card text-charcoal-950 hover:bg-card/92">
                  <Link href="/dashboard/company/post-project">
                    <PenSquare className="mr-2 h-4 w-4" />
                    Post New Project
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
                  <Link href="/dashboard/company/talent-search">
                    <Search className="mr-2 h-4 w-4" />
                    Find Talent
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
                  <Link href="/dashboard/company/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-none bg-card/78 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/70">
        <CardHeader>
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickStats.map(({ label, value, trend, icon: Icon, accent }) => (
              <div key={label} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.52))] p-5 dark:border-white/10 dark:bg-charcoal-950/35">
                <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-sm uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{label}</div>
                <div className="mt-2 text-2xl font-semibold text-charcoal-950 dark:text-white">{value}</div>
                <div className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">{trend}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card className="border-none bg-card/78 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Active Projects ({stats.activeProjects})</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/company/my-projects">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeProjects.map((project) => {
            const candidate = project.selectedApplicant as { name?: string; trustScore?: number } | undefined;
            const candidateName = candidate?.name || 'Not assigned yet';
            const trustScore = candidate?.trustScore || 0;
            const totalMilestones = project.milestones?.length || 0;
            const completedMilestones = project.milestones?.filter((milestone) => milestone.status === 'completed' || milestone.status === 'approved').length || 0;
            const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

            return (
              <div key={project._id} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{project.title}</h3>
                      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                        Candidate: {candidateName} • Trust Score: {trustScore}% • Started: {formatRelative(project.createdAt)}
                      </p>
                    </div>
                    <div className="text-sm text-charcoal-600 dark:text-charcoal-300">
                      Progress: ████████░░░░░░░░ {progress}% • Amount: {formatCurrency(project.budget?.max || project.budget?.min || 0)}
                    </div>
                    <div className="text-sm text-charcoal-500 dark:text-charcoal-400">
                      Next Milestone: UI Development - Due in 3 days
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:w-[240px] lg:flex-col">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/company/my-projects/${project._id}`}>View Details</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/messages">Message Candidate</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/company/my-projects/${project._id}`}>Review Work</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {activeProjects.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No active projects yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="border-none bg-card/78 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Recent Applications ({stats.pendingCount} New)</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/company/applications">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentApplications.map((application) => (
            <div key={application._id} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{application.applicantId?.name}</h3>
                    <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                      Applied for: {application.projectId?.title} • Trust Score: {application.applicantId?.trustScore}% • Experience: {Array.isArray(application.applicantId?.experience) ? application.applicantId.experience.length : 0} years • {formatRelative(application.submittedAt)}
                    </p>
                  </div>
                  <div className="text-sm text-charcoal-600 dark:text-charcoal-300">
                    Proposed: {formatCurrency(application.proposedAmount || 0)} • {application.proposedDuration || 0} days
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:w-[240px] lg:flex-col">
                  {application._id && (
                    <Button asChild size="sm">
                      <Link href={`/dashboard/company/applications/${application._id}`}>View Application</Link>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => application._id && updateStatus(application._id, 'shortlisted')}>Shortlist</Button>
                  <Button size="sm" variant="outline" onClick={() => application._id && updateStatus(application._id, 'rejected')}>Reject</Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/messages">Message</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {recentApplications.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No recent applications.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hiring Pipeline */}
      <Card className="border-none bg-card/78 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/70">
        <CardHeader>
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Hiring Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 text-sm">
              {pipelineStages.map((stage, index) => (
                <React.Fragment key={stage.label}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950/50 dark:text-primary-400">
                      {stage.count}
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-charcoal-950 dark:text-white">{stage.label}</div>
                    </div>
                  </div>
                  {index < pipelineStages.length - 1 && <ArrowRight className="h-4 w-4 text-charcoal-400" />}
                </React.Fragment>
              ))}
            </div>
            <div className="text-center text-sm text-charcoal-500 dark:text-charcoal-400">
              Conversion Rate: {stats.conversionRate}% (Target: 20%)
              <Button asChild variant="link" size="sm" className="ml-2">
                <Link href="/dashboard/company/analytics">Improve Conversion →</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Powered Talent Recommendations */}
      <Card className="border-none bg-card/78 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">AI-Powered Talent Recommendations</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/company/talent-search">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-charcoal-500 dark:text-charcoal-400">
            Based on your hiring history, these candidates might be perfect:
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendationCards.map((card) => (
              <div key={card.name} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-info-500 flex items-center justify-center text-white font-semibold">
                    {card.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="font-semibold text-charcoal-950 dark:text-white">{card.name}</h3>
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{card.role}</p>
                  <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300">
                    Trust Score: {card.trust} • Available: {card.availability}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary-700 dark:text-primary-400">{card.rate}</p>
                  <p className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">{card.match}% match</p>
                  <Button asChild size="sm" className="mt-3 w-full">
                    <Link href={`/dashboard/company/talent-search?candidate=${card.name}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spending Analytics */}
      <Card className="border-none bg-card/78 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Spending Analytics (Last 6 Months)</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/company/analytics">Detailed Analytics →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-semibold text-charcoal-950 dark:text-white">{formatCurrency(stats.totalSpent)}</div>
              <div className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">
                Total Spent • Average per hire: {formatCurrency(stats.totalSpent / Math.max(1, stats.hiredCount))}
              </div>
              <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                ROI: 4.2x (You&apos;ve earned ₹5,00,000 from hired candidates)
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-charcoal-500 dark:text-charcoal-400 mb-2">
                  {spendingTrend.map((item) => (
                    <span key={item.month}>{item.month}</span>
                  ))}
                </div>
                <div className="flex items-end justify-between h-20 gap-1">
                  {spendingTrend.map((item, index) => {
                    const maxAmount = Math.max(...spendingTrend.map(d => d.amount));
                    const height = (item.amount / maxAmount) * 100;
                    return (
                      <div key={item.month} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-gradient-to-t from-primary-600 to-info-500 rounded-t-sm"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-card text-charcoal-950 hover:bg-card/92">
                <Link href="/dashboard/company/post-project">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Post New Project
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
                <Link href="/dashboard/company/jobs/post">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Post New Job
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
                <Link href="/dashboard/company/talent-search">
                  <Search className="mr-2 h-4 w-4" />
                  Search Talent
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
                <Link href="/dashboard/company/team">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Team Member
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
                <Link href="/dashboard/company/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Funds
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
                <Link href="/dashboard/company/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}