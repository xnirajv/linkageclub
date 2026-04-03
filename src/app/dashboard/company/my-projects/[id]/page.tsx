'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, CreditCard, MessageSquare, ShieldCheck, Target } from 'lucide-react';
import { useProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export default function CompanyProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { project, isLoading } = useProject(params.id as string);

  const fallback = {
    title: 'MERN E-commerce Platform',
    category: 'Web Development',
    description: 'A premium commerce platform with authentication, catalog, checkout, payment integration, and admin reporting.',
    budget: { min: 50000, max: 70000 },
    duration: 30,
    status: 'active',
    milestones: [
      { title: 'UI Development', amount: 15000, status: 'completed' },
      { title: 'Backend API', amount: 20000, status: 'in_progress' },
      { title: 'Integration & Testing', amount: 15000, status: 'pending' },
    ],
  };

  const current = project || fallback;
  const progress = Math.round(((current.milestones?.filter((item: any) => item.status === 'completed').length || 0) / Math.max(current.milestones?.length || 1, 1)) * 100);

  if (isLoading) {
    return <div className="rounded-[28px] bg-card/80 p-8 text-sm text-charcoal-500 dark:bg-charcoal-900/72 dark:text-charcoal-400">Loading project details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">{current.title}</h1>
            <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Project detail, candidate management, milestones, and payment tracking in one company workspace.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/dashboard/company/my-projects/${params.id}/manage`}>Manage Project</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Candidate
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Status" value={String(current.status || 'active')} />
        <Metric title="Budget" value={`${formatCurrency(current.budget?.min || 0)} - ${formatCurrency(current.budget?.max || 0)}`} />
        <Metric title="Duration" value={`${current.duration || 0} days`} />
        <Metric title="Progress" value={`${progress}%`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Overview</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                <div className="font-semibold text-charcoal-950 dark:text-white">{current.category || 'Web Development'}</div>
                <div className="mt-3 leading-7">{current.description}</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <ActionCard icon={<Target className="h-4 w-4 text-primary-700" />} title="Review Milestone" text="Approve work, request changes, or release payment." />
                <ActionCard icon={<Calendar className="h-4 w-4 text-info-700" />} title="Timeline" text="Monitor milestone deadlines and delivery health." />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Milestones</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(current.milestones || []).map((milestone: any, index: number) => (
                <div key={`${milestone.title}-${index}`} className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-charcoal-950 dark:text-white">{milestone.title}</div>
                      <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{formatCurrency(milestone.amount || 0)}</div>
                    </div>
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">{milestone.status || 'pending'}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Candidate</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                <div className="font-semibold text-charcoal-950 dark:text-white">Riya Sharma</div>
                <div className="mt-2">Trust Score: 92%</div>
                <div className="mt-1">Location: Mumbai, India</div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm">View Profile</Button>
                  <Button size="sm" variant="outline">Rate Candidate</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Payments</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-secondary-700" />Released: {formatCurrency(15000)}</div>
                <div className="mt-2">Pending: {formatCurrency((current.budget?.max || 0) - 15000)}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-white/70"><ShieldCheck className="h-4 w-4" />Company Control</div>
              <div className="mt-4 text-xl font-semibold">This detail page now sits on the same premium project management language as the rest of the company dashboard.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
      <CardContent className="p-5">
        <div className="text-sm uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{title}</div>
        <div className="mt-3 text-2xl font-semibold text-charcoal-950 dark:text-white">{value}</div>
      </CardContent>
    </Card>
  );
}

function ActionCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
      <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-950 dark:text-white">{icon}{title}</div>
      <div className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">{text}</div>
    </div>
  );
}
