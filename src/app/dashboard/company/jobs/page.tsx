'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Users, Briefcase, Clock } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

function formatSalary(job: any) {
  if (!job?.salary?.min) return 'Not specified';
  return `₹${Math.round(job.salary.min / 100000)}L - ₹${Math.round(job.salary.max / 100000)}L`;
}

function timeAgo(date: string) {
  const hours = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export default function CompanyJobsPage() {
  const { jobs = [], isLoading } = useJobs({});
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'published' | 'draft' | 'filled'>('all');

  const allJobs = jobs as any[];
  const filtered = useMemo(() => allJobs.filter((j: any) => {
    const match = (j.title || '').toLowerCase().includes(query.toLowerCase());
    const statusMatch = tab === 'all' || (j.status || 'published') === tab;
    return match && statusMatch;
  }), [query, tab, allJobs]);

  const counts = {
    all: allJobs.length,
    published: allJobs.filter((j: any) => (j.status || 'published') === 'published').length,
    draft: allJobs.filter((j: any) => j.status === 'draft').length,
    filled: allJobs.filter((j: any) => j.status === 'filled').length,
  };

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Jobs</h1><p className="text-gray-500">{counts.all} positions</p></div>
        <Button size="sm" asChild><Link href="/dashboard/company/jobs/post"><Plus className="h-4 w-4 mr-1" />Post Job</Link></Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs..." className="pl-9 rounded-xl" />
      </div>

      <div className="flex gap-2">
        {Object.entries({ all: 'All', published: 'Active', draft: 'Drafts', filled: 'Filled' }).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {label} ({counts[key as keyof typeof counts]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border border-dashed border-gray-200 dark:border-gray-800 shadow-none">
          <CardContent className="p-12 text-center"><Briefcase className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No jobs found</p></CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((job: any) => (
            <Card key={job._id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{job.title}</h3>
                      <Badge variant="secondary" className="text-[10px] capitalize">{(job.status || 'published').replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {job.location || 'Remote'} • {job.type || 'Full-time'} • {formatSalary(job)} • {job.applicationsCount || 0} applicants
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" asChild><Link href={`/dashboard/company/jobs/${job._id}`}><Eye className="h-4 w-4" /></Link></Button>
                    <Button size="sm" variant="ghost" asChild><Link href={`/dashboard/company/jobs/${job._id}/applications`}><Users className="h-4 w-4" /></Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}