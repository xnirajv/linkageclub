'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Search, Users } from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type AppRecord = {
  _id?: string;
  status?: string;
  submittedAt?: string;
  jobId?: { _id?: { toString(): string } | string; title?: string };
  applicantId?: { name?: string; email?: string; trustScore?: number };
};

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { applications = [], isLoading } = useApplications({});
  const [query, setQuery] = useState('');

  const records = (applications as AppRecord[]).filter((item) => {
    const jobId = typeof item.jobId?._id === 'string' ? item.jobId?._id : item.jobId?._id?.toString();
    return jobId === params.id;
  });

  const filtered = useMemo(() => {
    return records.filter((item) => {
      const name = item.applicantId?.name || '';
      return name.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, records]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Job Applications</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Review the candidate pipeline for this role with a cleaner shortlist and interview action flow.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Total', `${filtered.length}`],
          ['Shortlisted', `${filtered.filter((item) => item.status === 'shortlisted').length}`],
          ['Interview', `${filtered.filter((item) => item.status === 'interview').length}`],
        ].map(([title, value]) => (
          <Card key={title} className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardContent className="p-5">
              <div className="text-sm uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{title}</div>
              <div className="mt-3 text-2xl font-semibold text-charcoal-950 dark:text-white">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardContent className="p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applicants by name..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Applications ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="rounded-[24px] bg-silver-50/70 p-6 text-sm text-charcoal-500">Loading applications...</div>}
          {!isLoading && filtered.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No job applications found for this role yet.
            </div>
          )}
          {!isLoading && filtered.map((app) => (
            <div key={app._id || app.applicantId?.email} className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold text-charcoal-950 dark:text-white">{app.applicantId?.name || 'Candidate'}</div>
                  <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{app.applicantId?.email}</div>
                  <div className="mt-2 text-sm text-charcoal-700 dark:text-charcoal-300">
                    Trust Score: {app.applicantId?.trustScore || 0}% • Status: {app.status || 'pending'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={app._id ? `/dashboard/company/applications/${app._id}` : '/dashboard/company/applications'}>Open Application</Link>
                  </Button>
                  <Button size="sm" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Shortlist
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Interview
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
