'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, Calendar, Eye, MapPin, Users } from 'lucide-react';
import { useJob } from '@/hooks/useJobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompanyJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { job, isLoading } = useJob(params.id as string);

  const current = job || {
    _id: params.id,
    title: 'Senior Frontend Developer',
    location: 'Bangalore (Remote)',
    type: 'full-time',
    status: 'published',
    description: 'Build premium responsive frontend experiences using React, TypeScript, and Next.js.',
    salary: { min: 1200000, max: 1800000, period: 'year' },
    applicationsCount: 24,
  };

  if (isLoading) {
    return <div className="rounded-[28px] bg-card/80 p-8 text-sm text-charcoal-500 dark:bg-charcoal-900/72 dark:text-charcoal-400">Loading job details...</div>;
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
            <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Job detail, requirements, applications, and candidate flow for your company hiring team.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">Edit Job</Button>
          <Button asChild>
            <Link href={`/dashboard/company/jobs/${params.id}/applications`}>
              <Users className="mr-2 h-4 w-4" />
              View Applications
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Status" value={String(current.status || 'published')} />
        <Metric title="Location" value={String(current.location || 'Remote')} />
        <Metric title="Type" value={String(current.type || 'full-time')} />
        <Metric title="Applications" value={String(current.applicationsCount || 0)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Job Description</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-charcoal-700 dark:text-charcoal-300">{current.description}</CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Role Snapshot</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Snapshot icon={<MapPin className="h-4 w-4 text-info-700" />} label="Location" value={String(current.location || 'Remote')} />
              <Snapshot icon={<Briefcase className="h-4 w-4 text-primary-700" />} label="Type" value={String(current.type || 'full-time')} />
              <Snapshot icon={<Calendar className="h-4 w-4 text-secondary-700" />} label="Posted" value="Recently" />
              <Snapshot icon={<Eye className="h-4 w-4 text-charcoal-700" />} label="Visibility" value="Public" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Compensation</CardTitle></CardHeader>
            <CardContent className="text-sm text-charcoal-700 dark:text-charcoal-300">
              Rs{Math.round((current.salary?.min || 0) / 100000)}L - Rs{Math.round((current.salary?.max || 0) / 100000)}L / {current.salary?.period || 'year'}
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
            <CardContent className="p-6">
              <div className="text-xl font-semibold">This role detail view is now aligned to the company dashboard redesign.</div>
              <div className="mt-3 text-sm leading-7 text-white/82">Open the applications screen to review, shortlist, and message candidates.</div>
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

function Snapshot({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{icon}{label}</div>
      <div className="mt-3 text-sm font-medium text-charcoal-950 dark:text-white">{value}</div>
    </div>
  );
}
