'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, Clock3, MessageSquare, Search, UserRoundX, Users2,
} from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ProjectApplication = {
  _id: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  proposedAmount?: number;
  proposedDuration?: number;
  coverLetter: string;
  submittedAt: string;
  applicantId?: {
    _id: string;
    name?: string;
    avatar?: string;
    trustScore?: number;
    location?: string;
  };
  projectId?: {
    _id: string;
    title?: string;
  };
};

const STATUS_OPTIONS = ['all', 'pending', 'shortlisted', 'accepted', 'rejected'] as const;
type StatusFilter = typeof STATUS_OPTIONS[number];

function formatCurrency(value?: number) {
  if (!value) {
    return 'Negotiable';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProjectApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { applications, isLoading, errorMessage, updateStatus } = useApplications({
    role: 'company',
    type: 'project',
    projectId,
    limit: 50,
  });

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const typedApplications = applications as ProjectApplication[];

  const filtered = useMemo(() => {
    return typedApplications.filter((application) => {
      const applicantName = application.applicantId?.name || '';
      const statusMatch = status === 'all' || application.status === status;
      const searchMatch = applicantName.toLowerCase().includes(query.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [query, status, typedApplications]);

  const stats = {
    total: typedApplications.length,
    pending: typedApplications.filter((item) => item.status === 'pending').length,
    shortlisted: typedApplications.filter((item) => item.status === 'shortlisted').length,
    accepted: typedApplications.filter((item) => item.status === 'accepted').length,
  };

  const projectTitle = typedApplications[0]?.projectId?.title || 'Project Applications';

  const handleStatusChange = async (applicationId: string, nextStatus: ProjectApplication['status']) => {
    if (updatingId) {
      return;
    }

    setUpdatingId(applicationId);
    setPageError(null);
    const result = await updateStatus(applicationId, nextStatus);
    if (!result.success) {
      setPageError(result.error || 'Failed to update application status.');
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">{projectTitle}</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">
            Review applicants, shortlist strong candidates, and move this project to the right partner with confidence.
          </p>
        </div>
      </div>

      {(pageError || errorMessage) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {pageError || errorMessage}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total', `${stats.total}`],
          ['Pending', `${stats.pending}`],
          ['Shortlisted', `${stats.shortlisted}`],
          ['Accepted', `${stats.accepted}`],
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
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search applicants..."
              className="pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Statuses' : option[0].toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardHeader>
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">
            Applications ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="rounded-[24px] bg-silver-50/70 p-6 text-sm text-charcoal-500">
              Loading applications...
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No applications match this view yet.
            </div>
          )}

          {!isLoading && filtered.map((application) => {
            const applicantName = application.applicantId?.name || 'Candidate';
            const initials = applicantName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2);

            return (
              <div
                key={application._id}
                className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-sm font-semibold text-primary-800">
                        {initials || 'CA'}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-charcoal-950 dark:text-white">{applicantName}</div>
                        <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                          {application.applicantId?.location || 'Location unavailable'}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                      <div>Trust Score: {application.applicantId?.trustScore || 0}%</div>
                      <div>Status: {application.status}</div>
                      <div>Proposed: {formatCurrency(application.proposedAmount)}</div>
                      <div>Timeline: {application.proposedDuration || 'N/A'} days</div>
                      <div>
                        Submitted: {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-sm leading-7 text-charcoal-700 dark:text-charcoal-300">
                      {application.coverLetter}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-[260px] lg:flex-col">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/company/applications/${application._id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/messages">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(application._id, 'shortlisted')}
                      disabled={updatingId === application._id || application.status === 'shortlisted'}
                    >
                      <Users2 className="mr-2 h-4 w-4" />
                      {updatingId === application._id ? 'Updating...' : 'Shortlist'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(application._id, 'accepted')}
                      disabled={updatingId === application._id || application.status === 'accepted'}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(application._id, 'rejected')}
                      disabled={updatingId === application._id || application.status === 'rejected'}
                    >
                      <UserRoundX className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <div className="text-xs text-charcoal-500 dark:text-charcoal-400">
                      <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                      First response time matters. Keep candidates updated quickly.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
