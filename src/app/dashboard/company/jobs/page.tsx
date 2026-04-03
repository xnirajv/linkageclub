'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Briefcase, Calendar, Eye, Filter, PenSquare, Search, Users } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type JobItem = {
  _id?: string;
  title?: string;
  location?: string;
  type?: string;
  status?: string;
  applicationsCount?: number;
  postedAt?: string | Date;
  salary?: { min?: number; max?: number; period?: string };
};

const fallbackJobs: JobItem[] = [
  { _id: 'j1', title: 'Senior Frontend Developer', location: 'Bangalore (Remote)', type: 'full-time', status: 'published', applicationsCount: 24, postedAt: new Date().toISOString(), salary: { min: 1200000, max: 1800000, period: 'year' } },
  { _id: 'j2', title: 'Backend Developer - Node.js', location: 'Remote', type: 'full-time', status: 'published', applicationsCount: 35, postedAt: new Date().toISOString(), salary: { min: 1000000, max: 1500000, period: 'year' } },
  { _id: 'j3', title: 'UI/UX Designer', location: 'Hybrid - Bangalore', type: 'contract', status: 'published', applicationsCount: 12, postedAt: new Date().toISOString(), salary: { min: 700000, max: 1100000, period: 'year' } },
  { _id: 'j4', title: 'Platform Engineer', location: 'Remote', type: 'full-time', status: 'draft', applicationsCount: 0, postedAt: new Date().toISOString(), salary: { min: 1400000, max: 1900000, period: 'year' } },
];

function formatSalary(job: JobItem) {
  if (!job.salary?.min || !job.salary?.max) return 'Salary not specified';
  const min = Math.round(job.salary.min / 100000);
  const max = Math.round(job.salary.max / 100000);
  return `Rs${min}-${max} LPA`;
}

function formatRelative(value?: string | Date) {
  if (!value) return 'Recently';
  const hours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60)));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function CompanyJobsPage() {
  const { jobs = [], isLoading } = useJobs({});
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'published' | 'draft' | 'filled' | 'closed'>('published');

  const sourceJobs = ((jobs as JobItem[]).length ? (jobs as JobItem[]) : fallbackJobs);

  const filteredJobs = useMemo(() => {
    return sourceJobs.filter((job) => {
      const searchMatch = (job.title || '').toLowerCase().includes(query.toLowerCase());
      const statusMatch = (job.status || 'published') === tab;
      return searchMatch && statusMatch;
    });
  }, [query, sourceJobs, tab]);

  const counts = {
    published: sourceJobs.filter((job) => (job.status || 'published') === 'published').length,
    draft: sourceJobs.filter((job) => job.status === 'draft').length,
    filled: sourceJobs.filter((job) => job.status === 'filled').length,
    closed: sourceJobs.filter((job) => job.status === 'closed').length,
  };

  const totalApplications = sourceJobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Jobs</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Manage active roles, expiring listings, and future hiring demand with the same premium company control surface.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/company/jobs/post">
            <PenSquare className="mr-2 h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Active Jobs', value: counts.published, tone: 'text-primary-700' },
          { label: 'Total Applications', value: totalApplications, tone: 'text-info-700' },
          { label: 'Draft Jobs', value: counts.draft, tone: 'text-charcoal-700' },
          { label: 'Filled Roles', value: counts.filled, tone: 'text-secondary-700' },
        ].map((item) => (
          <Card key={item.label} className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardContent className="p-5">
              <div className="text-sm uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{item.label}</div>
              <div className={`mt-3 text-3xl font-semibold ${item.tone}`}>{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs by title..." className="pl-9" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ['published', `Active (${counts.published})`],
          ['draft', `Drafts (${counts.draft})`],
          ['filled', `Filled (${counts.filled})`],
          ['closed', `Closed (${counts.closed})`],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value as typeof tab)}
            className={`rounded-[24px] border px-4 py-4 text-left transition ${tab === value ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-card/80 text-charcoal-700 dark:border-white/10 dark:bg-charcoal-900/72 dark:text-charcoal-300'}`}
          >
            <div className="font-semibold">{label}</div>
          </button>
        ))}
      </div>

      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardHeader>
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Job Listings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="rounded-[24px] bg-silver-50/70 p-6 text-sm text-charcoal-500">Loading jobs...</div>}
          {!isLoading && filteredJobs.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No jobs found in this view yet.
            </div>
          )}
          {!isLoading && filteredJobs.map((job) => (
            <div key={job._id || job.title} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{job.title || 'Untitled role'}</h3>
                    <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                      {job.location || 'Remote'} • {(job.type || 'full-time').replace('-', ' ')} • Posted {formatRelative(job.postedAt)}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                    <div>Salary: {formatSalary(job)}</div>
                    <div>Applications: {job.applicationsCount || 0}</div>
                    <div>Status: {job.status || 'published'}</div>
                    <div>Views: {(job.applicationsCount || 0) * 18 + 120}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:w-[240px] lg:flex-col">
                  <Button asChild size="sm">
                    <Link href={job._id ? `/dashboard/company/jobs/${job._id}` : '/dashboard/company/jobs'}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={job._id ? `/dashboard/company/jobs/${job._id}/applications` : '/dashboard/company/applications'}>
                      <Users className="mr-2 h-4 w-4" />
                      View Applications
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Expiring Soon</CardTitle>
            <AlertTriangle className="h-5 w-5 text-secondary-700" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[22px] border border-secondary-200 bg-secondary-50/80 p-4">
              <div className="font-semibold text-charcoal-950">UI/UX Designer</div>
              <div className="mt-2 text-sm text-charcoal-500">Applications: 12 • Expires in 2 days</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm">Extend</Button>
                <Button size="sm" variant="outline">Close</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Hiring Activity</CardTitle>
            <Briefcase className="h-5 w-5 text-primary-700" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-info-700" />Best day to post roles: Tuesday</div>
            </div>
            <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700">
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary-700" />Top funnel role: Frontend & Product Design</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
