'use client';

import { useMemo } from 'react';
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
import { useProjects } from '@/hooks/useProjects';
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
  milestones?: Array<{ title?: string }>;
  assignedCandidate?: { name?: string; trustScore?: number };
};

type CompanyApplication = {
  _id?: string;
  status?: string;
  createdAt?: string;
  submittedAt?: string;
  expectedBudget?: number;
  estimatedDuration?: number;
  applicant?: { name?: string; trustScore?: number; experience?: number };
  applicantId?: { name?: string };
  user?: { name?: string };
  project?: { title?: string };
  projectId?: { title?: string };
};

const recommendationCards = [
  { name: 'Priya Mehta', role: 'React Expert', trust: 95, availability: 'Available now', rate: 'Rs1,500/hr', match: 98 },
  { name: 'Neha Gupta', role: 'Node.js Pro', trust: 92, availability: 'Available in 2 weeks', rate: 'Rs1,200/hr', match: 95 },
  { name: 'Vikram Singh', role: 'Full Stack', trust: 94, availability: 'Available now', rate: 'Rs2,000/hr', match: 92 },
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
  const { projects = [], isLoading: projectsLoading } = useProjects({ limit: 12 });
  const { applications = [], isLoading: applicationsLoading } = useApplications({ role: 'company', limit: 100 });

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
    const reviewedCount = typedApplications.filter((application) => ['reviewed', 'reviewing'].includes(application.status || '')).length;
    const interviewCount = typedApplications.filter((application) => application.status === 'interview').length;
    const offerCount = typedApplications.filter((application) => application.status === 'offered').length;
    const hiredCount = typedApplications.filter((application) => ['accepted', 'hired'].includes(application.status || '')).length;
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
      value: `${stats.activeProjects || typedProjects.length || 3}`,
      trend: `+${Math.max(1, Math.ceil((stats.activeProjects || 3) / 2))} from last month`,
      icon: Briefcase,
      accent: 'from-primary-700 to-info-600',
    },
    {
      label: 'Open Positions',
      value: `${stats.openProjects || Math.max(2, typedProjects.length)}`,
      trend: `+${Math.max(1, Math.ceil((stats.openProjects || 2) / 2))} from last month`,
      icon: PenSquare,
      accent: 'from-secondary-500 to-secondary-300',
    },
    {
      label: 'Total Applicants',
      value: `${stats.totalApplicants || 24}`,
      trend: `+${Math.max(3, Math.ceil((stats.totalApplicants || 24) / 4))} from last month`,
      icon: Users,
      accent: 'from-info-600 to-primary-600',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(stats.totalSpent || 120000),
      trend: '+45% from last month',
      icon: CreditCard,
      accent: 'from-charcoal-700 to-charcoal-500',
    },
  ];

  const activeProjects = typedProjects.slice(0, 3);
  const recentApplications = typedApplications.slice(0, 3);
  const activeProjectDisplay: CompanyProject[] =
    activeProjects.length > 0
      ? activeProjects
      : [
          { title: 'E-commerce Platform', createdAt: new Date().toISOString(), duration: 30, applicationsCount: 12, budget: { max: 15000 }, milestones: [{ title: 'UI Development' }], assignedCandidate: { name: 'Riya Sharma', trustScore: 92 } },
          { title: 'Admin Dashboard', createdAt: new Date().toISOString(), duration: 20, applicationsCount: 8, budget: { max: 40000 }, milestones: [{ title: 'Applications review' }] },
          { title: 'Mobile App UI Design', createdAt: new Date().toISOString(), duration: 25, applicationsCount: 15, budget: { max: 22000 }, milestones: [{ title: 'Wireframes' }], assignedCandidate: { name: 'Priya Singh', trustScore: 85 } },
        ];
  const recentApplicationDisplay: CompanyApplication[] =
    recentApplications.length > 0
      ? recentApplications
      : [
          { applicant: { name: 'Riya Sharma', trustScore: 92, experience: 2 }, project: { title: 'E-commerce Platform' }, expectedBudget: 55000, estimatedDuration: 28, submittedAt: new Date().toISOString() },
          { applicant: { name: 'Raj Patel', trustScore: 88, experience: 3 }, project: { title: 'Admin Dashboard' }, expectedBudget: 60000, estimatedDuration: 25, submittedAt: new Date().toISOString() },
          { applicant: { name: 'Ankit Sharma', trustScore: 85, experience: 2 }, project: { title: 'Mobile App UI Design' }, expectedBudget: 45000, estimatedDuration: 20, submittedAt: new Date().toISOString() },
        ];
  const pipelineStages = [
    { label: 'New', count: stats.pendingCount || 8 },
    { label: 'Reviewing', count: stats.reviewedCount || 4 },
    { label: 'Interview', count: stats.interviewCount || 2 },
    { label: 'Offer', count: stats.offerCount || 1 },
    { label: 'Hired', count: stats.hiredCount || 1 },
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
                Your company {companyName} is making strong progress. Here&apos;s what&apos;s happening with your projects,
                hiring pipeline, and talent discovery.
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

            <div className="grid grid-cols-3 gap-3 rounded-[28px] border border-white/14 bg-card/10 p-4 backdrop-blur">
              {[
                { label: 'Projects', value: stats.activeProjects || 3 },
                { label: 'Applicants', value: stats.totalApplicants || 24 },
                { label: 'Conversion', value: `${stats.conversionRate || 12.5}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-[22px] bg-black/10 px-4 py-3 text-center">
                  <div className="text-lg font-semibold">{item.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/68">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map(({ label, value, trend, icon: Icon, accent }) => (
          <Card key={label} className="overflow-hidden border-none bg-card/78 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/70">
            <CardContent className="p-5">
              <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-sm uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{label}</div>
              <div className="mt-2 text-3xl font-semibold text-charcoal-950 dark:text-white">{value}</div>
              <div className="mt-2 text-sm text-info-700 dark:text-info-300">{trend}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-charcoal-950 dark:text-white">Active Projects</CardTitle>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                  Current engagements, next milestones, and candidate visibility.
                </p>
              </div>
              <Button asChild variant="ghost" className="text-primary-700 hover:text-primary-800">
                <Link href="/dashboard/company/my-projects">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeProjectDisplay.map((project, index) => {
                const title = project._id ? project.title || 'Untitled project' : ['E-commerce Platform', 'Admin Dashboard', 'Mobile App UI Design'][index];
                const candidateName = project.assignedCandidate?.name || ['Riya Sharma', 'Not assigned yet', 'Priya Singh'][index];
                const trust = project.assignedCandidate?.trustScore || [92, 88, 85][index];
                const progress = [40, 0, 60][index];
                const budget = formatCurrency(project.budget?.max || project.budget?.min || [15000, 40000, 22000][index]);
                const milestone = project.milestones?.[0]?.title || ['UI Development', 'Applications review', 'Wireframes'][index];

                return (
                  <div
                    key={project._id || `${title}-${index}`}
                    className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(225,221,214,0.35),rgba(255,255,255,0.88))] p-5 dark:border-white/10 dark:bg-charcoal-950/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{title}</h3>
                          <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                            {candidateName === 'Not assigned yet'
                              ? `Status: Open | Applications: ${project.applicationsCount || 8} candidates waiting`
                              : `Candidate: ${candidateName} | Trust Score: ${trust}% | Started ${formatRelative(project.createdAt)}`}
                          </p>
                        </div>
                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm text-charcoal-500 dark:text-charcoal-400">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-primary-100 dark:bg-charcoal-800">
                            <div className="h-2 rounded-full bg-gradient-to-r from-secondary-500 via-info-500 to-primary-700" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                          <div>Next milestone: {milestone}</div>
                          <div>Amount: {budget}</div>
                          <div>{['Due in 3 days', 'Best match available', 'Due tomorrow'][index]}</div>
                          <div>Duration: {project.duration || [30, 20, 25][index]} days</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:w-[220px] lg:flex-col">
                        <Button asChild size="sm">
                          <Link href={project._id ? `/dashboard/company/my-projects/${project._id}` : '/dashboard/company/my-projects'}>View Details</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/dashboard/messages">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message Candidate
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/dashboard/company/applications">Review Work</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-charcoal-950 dark:text-white">Recent Applications</CardTitle>
                <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                  New candidate activity that needs action from your team.
                </p>
              </div>
              <Button asChild variant="ghost" className="text-primary-700 hover:text-primary-800">
                <Link href="/dashboard/company/applications">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentApplicationDisplay.map((application, index) => {
                const applicantName =
                  application.applicant?.name ||
                  application.applicantId?.name ||
                  application.user?.name ||
                  ['Riya Sharma', 'Raj Patel', 'Ankit Sharma'][index];
                const projectTitle =
                  application.project?.title ||
                  application.projectId?.title ||
                  ['E-commerce Platform', 'Admin Dashboard', 'Mobile App UI Design'][index];
                const trust = application.applicant?.trustScore || [92, 88, 85][index];
                const experience = application.applicant?.experience || [2, 3, 2][index];
                const proposed = application.expectedBudget || [55000, 60000, 45000][index];
                const days = application.estimatedDuration || [28, 25, 20][index];

                return (
                  <div
                    key={application._id || `${applicantName}-${index}`}
                    className="rounded-[28px] border border-secondary-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-sm font-semibold text-primary-800">
                            {applicantName.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{applicantName}</h3>
                            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Applied for: {projectTitle}</p>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                          <div>Trust Score: {trust}%</div>
                          <div>Experience: {experience} years</div>
                          <div>{formatRelative(application.submittedAt || application.createdAt)}</div>
                          <div>Proposed: {formatCurrency(proposed)} | {days} days</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:w-[240px] lg:flex-col">
                        <Button asChild size="sm">
                          <Link href="/dashboard/company/applications">View Application</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/dashboard/company/applications">Shortlist</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/dashboard/messages">Message</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
            <CardHeader>
              <CardTitle className="text-xl text-charcoal-950 dark:text-white">Hiring Pipeline</CardTitle>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                New to hired movement across your active company pipeline.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {pipelineStages.map((stage, index) => (
                  <div key={stage.label} className="rounded-[22px] border border-white/60 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                          index === 0
                            ? 'bg-secondary-100 text-secondary-800'
                            : index === 1
                              ? 'bg-info-100 text-info-800'
                              : index === 2
                                ? 'bg-primary-100 text-primary-800'
                                : index === 3
                                  ? 'bg-charcoal-100 text-charcoal-800'
                                  : 'bg-primary-700 text-white'
                        }`}>
                          {stage.count}
                        </div>
                        <div>
                          <div className="font-semibold text-charcoal-950 dark:text-white">{stage.label}</div>
                          <div className="text-sm text-charcoal-500 dark:text-charcoal-400">{stage.count} candidates</div>
                        </div>
                      </div>
                      <Target className="h-4 w-4 text-charcoal-400" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[24px] border border-secondary-200 bg-secondary-50/80 p-4 dark:border-secondary-800/40 dark:bg-secondary-950/10">
                <div className="text-sm font-semibold text-charcoal-950 dark:text-white">
                  Conversion Rate: {stats.conversionRate || 12.5}% <span className="text-charcoal-500 dark:text-charcoal-400">(Target: 20%)</span>
                </div>
                <Button asChild variant="ghost" className="mt-2 h-auto px-0 text-primary-700 hover:text-primary-800">
                  <Link href="/dashboard/company/analytics">
                    Improve Conversion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white shadow-[0_20px_50px_rgba(52,74,134,0.24)]">
            <CardContent className="p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-card/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                <Sparkles className="h-3.5 w-3.5" />
                AI Talent Recommendations
              </div>
              <p className="mt-4 text-sm leading-7 text-white/82">
                Based on your hiring history, these candidates are strong matches for your active opportunities.
              </p>
              <div className="mt-5 space-y-3">
                {recommendationCards.map((candidate) => (
                  <div key={candidate.name} className="rounded-[22px] border border-white/12 bg-card/10 p-4 backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{candidate.name}</div>
                        <div className="mt-1 text-sm text-white/74">{candidate.role}</div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/78">
                          <span>Trust Score: {candidate.trust}%</span>
                          <span>{candidate.availability}</span>
                          <span>{candidate.rate}</span>
                        </div>
                      </div>
                      <div className="rounded-full bg-card/16 px-3 py-1 text-xs font-semibold">{candidate.match}% match</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-5 bg-card text-charcoal-950 hover:bg-card/92">
                <Link href="/dashboard/company/talent-search">View All</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-charcoal-950 dark:text-white">Spending Analytics</CardTitle>
              <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                Last 6 months of platform investment and hiring momentum.
              </p>
            </div>
            <Button asChild variant="ghost" className="text-primary-700 hover:text-primary-800">
              <Link href="/dashboard/company/analytics">
                Detailed Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid h-[240px] grid-cols-6 items-end gap-4 rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
              {spendingTrend.map((item, index) => {
                const height = Math.max(28, Math.round((item.amount / 78000) * 160));
                return (
                  <div key={item.month} className="flex h-full flex-col items-center justify-end gap-3">
                    <div className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">{item.amount >= 70000 ? formatCurrency(item.amount) : `${Math.round(item.amount / 1000)}k`}</div>
                    <div className={`w-full rounded-t-[18px] bg-gradient-to-t ${index % 2 === 0 ? 'from-primary-700 to-info-500' : 'from-secondary-500 to-secondary-300'}`} style={{ height: `${height}px` }} />
                    <div className="text-xs uppercase tracking-[0.14em] text-charcoal-500 dark:text-charcoal-400">{item.month}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-charcoal-600 dark:text-charcoal-300">
              <span>Total Spent: {formatCurrency(stats.totalSpent || 120000)}</span>
              <span>Average per hire: {formatCurrency(40000)}</span>
              <span>ROI: 4.2x</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Quick Actions</CardTitle>
            <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
              Fast access to the main company workflows from one place.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { href: '/dashboard/company/post-project', label: 'Post New Project', icon: PenSquare },
              { href: '/dashboard/company/jobs/post', label: 'Post New Job', icon: Briefcase },
              { href: '/dashboard/company/talent-search', label: 'Search Talent', icon: Search },
              { href: '/dashboard/company/team', label: 'Invite Team Member', icon: UserPlus },
              { href: '/dashboard/company/billing', label: 'Add Funds', icon: CreditCard },
              { href: '/dashboard/company/analytics', label: 'Generate Report', icon: FileText },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-[24px] border border-primary-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-4 transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg dark:border-white/10 dark:bg-charcoal-950/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-700 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-charcoal-400 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4 font-semibold text-charcoal-950 dark:text-white">{label}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-6 right-6 z-20 md:hidden">
        <Button asChild size="icon" className="h-14 w-14 rounded-full bg-primary-700 shadow-[0_18px_40px_rgba(52,74,134,0.35)] hover:bg-primary-800">
          <Link href="/dashboard/company/post-project" aria-label="Post new project">
            <PenSquare className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
