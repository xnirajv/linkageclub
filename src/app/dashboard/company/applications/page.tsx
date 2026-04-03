'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Filter, MessageSquare, Search, Sparkles } from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type CompanyApplication = {
  _id?: string;
  status?: string;
  expectedBudget?: number;
  estimatedDuration?: number;
  submittedAt?: string;
  createdAt?: string;
  applicantId?: { name?: string; trustScore?: number };
  projectId?: { title?: string };
  jobId?: { title?: string };
};

const statusTabs = ['all', 'pending', 'shortlisted', 'interview', 'rejected'] as const;
type StatusTab = typeof statusTabs[number];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function relativeLabel(value?: string) {
  if (!value) return 'Recently';
  const hours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60)));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function CompanyApplicationsPage() {
  const { applications = [], isLoading } = useApplications({ role: 'company' });
  const typedApplications = applications as CompanyApplication[];
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<StatusTab>('all');

  const displayApplications = useMemo(() => {
    return typedApplications.filter((application) => {
      const applicant = application.applicantId?.name || '';
      const opportunity = application.projectId?.title || application.jobId?.title || '';
      const searchMatch =
        applicant.toLowerCase().includes(query.toLowerCase()) ||
        opportunity.toLowerCase().includes(query.toLowerCase());
      const statusMatch = tab === 'all' || (application.status || '').toLowerCase() === tab;
      return searchMatch && statusMatch;
    });
  }, [query, tab, typedApplications]);

  const stats = {
    all: typedApplications.length,
    pending: typedApplications.filter((item) => item.status === 'pending').length,
    shortlisted: typedApplications.filter((item) => item.status === 'shortlisted').length,
    interview: typedApplications.filter((item) => item.status === 'interview').length,
    rejected: typedApplications.filter((item) => item.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
          <Sparkles className="h-3.5 w-3.5" />
          Applications Management
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-charcoal-950 dark:text-white">Applications</h1>
        <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Review new candidates, shortlist strong profiles, and move the company hiring pipeline forward with cleaner context.</p>
      </div>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by applicant or project..." className="pl-9" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-5">
        {statusTabs.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-[24px] border px-4 py-4 text-left transition ${tab === value ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-card/80 text-charcoal-700 dark:border-white/10 dark:bg-charcoal-900/72 dark:text-charcoal-300'}`}
          >
            <div className="font-semibold capitalize">{value === 'all' ? 'All' : value}</div>
            <div className="mt-1 text-sm">{stats[value]}</div>
          </button>
        ))}
      </div>

      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardHeader>
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Applications List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="rounded-[24px] bg-silver-50/70 p-6 text-sm text-charcoal-500">Loading applications...</div>}
          {!isLoading && displayApplications.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No applications match this view yet.
            </div>
          )}
          {!isLoading && displayApplications.map((application) => {
            const applicant = application.applicantId?.name || 'Candidate';
            const title = application.projectId?.title || application.jobId?.title || 'Opportunity';
            const trustScore = application.applicantId?.trustScore || 84;
            const amount = application.expectedBudget || 55000;
            const days = application.estimatedDuration || 28;
            return (
              <div key={application._id || `${applicant}-${title}`} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-sm font-semibold text-primary-800">
                        {applicant.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{applicant}</h3>
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Applied for: {title}</p>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                      <div>Trust Score: {trustScore}%</div>
                      <div>Status: {application.status || 'pending'}</div>
                      <div>Proposed: {formatCurrency(amount)}</div>
                      <div>Timeline: {days} days</div>
                      <div>{relativeLabel(application.submittedAt || application.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:w-[240px] lg:flex-col">
                    <Button asChild size="sm">
                      <Link href={application._id ? `/dashboard/company/applications/${application._id}` : '/dashboard/company/applications'}>
                        View Full Application
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">Shortlist</Button>
                    <Button size="sm" variant="outline">Reject</Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/messages">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Link>
                    </Button>
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
