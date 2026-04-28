'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock3, MessageSquare, Search, UserRoundX, Users2 } from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type StatusFilter = 'all' | 'pending' | 'shortlisted' | 'accepted' | 'rejected';
const STATUS_OPTIONS: readonly StatusFilter[] = ['all', 'pending', 'shortlisted', 'accepted', 'rejected'] as const;

function formatCurrency(value?: number) { if (!value) return 'Negotiable'; return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value); }

export default function ProjectApplicationsPage() {
  const params = useParams(); const router = useRouter(); const projectId = params.id as string;
  const { applications = [], isLoading, errorMessage, updateStatus } = useApplications({ role: 'company', type: 'project', projectId, limit: 50 });
  const [query, setQuery] = useState(''); const [status, setStatus] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null); const [pageError, setPageError] = useState<string | null>(null);

  const typedApplications = applications as any[];

  const filtered = useMemo(() => typedApplications.filter((app: any) => {
    const name = app.applicantId?.name || ''; const sMatch = status === 'all' || app.status === status;
    return sMatch && name.toLowerCase().includes(query.toLowerCase());
  }), [query, status, typedApplications]);

  const stats = { total: typedApplications.length, pending: typedApplications.filter((a: any) => a.status === 'pending').length, shortlisted: typedApplications.filter((a: any) => a.status === 'shortlisted').length, accepted: typedApplications.filter((a: any) => a.status === 'accepted').length };

  const handleStatusChange = async (applicationId: string, nextStatus: string) => {
    if (updatingId) return; setUpdatingId(applicationId); setPageError(null);
    const result = await updateStatus(applicationId, nextStatus);
    if (!result.success) setPageError(result.error || 'Failed to update status.');
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3"><Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button><div><h1 className="text-3xl font-semibold">Project Applications</h1><p className="mt-2 text-sm text-gray-500">Review applicants, shortlist, and hire.</p></div></div>
      {(pageError || errorMessage) && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{pageError || errorMessage}</div>}
      <div className="grid gap-4 md:grid-cols-4">{[['Total', `${stats.total}`], ['Pending', `${stats.pending}`], ['Shortlisted', `${stats.shortlisted}`], ['Accepted', `${stats.accepted}`]].map(([t, v]) => (<Card key={t}><CardContent className="p-5"><div className="text-sm uppercase tracking-wider text-gray-500">{t}</div><div className="mt-3 text-2xl font-semibold">{v}</div></CardContent></Card>))}</div>
      <Card><CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applicants..." className="pl-9" /></div><select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="rounded-md border p-2">{STATUS_OPTIONS.map((o) => (<option key={o} value={o}>{o === 'all' ? 'All Statuses' : o.charAt(0).toUpperCase() + o.slice(1)}</option>))}</select></CardContent></Card>
      <Card><CardHeader><CardTitle>Applications ({filtered.length})</CardTitle></CardHeader><CardContent className="space-y-4">
        {isLoading && <div className="rounded-2xl bg-gray-50 p-6 text-sm">Loading...</div>}
        {!isLoading && filtered.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">No applications match this view.</div>}
        {!isLoading && filtered.map((app: any) => {
          const name = app.applicantId?.name || 'Candidate'; const initials = name.split(' ').map((p: string) => p[0]).join('').slice(0, 2);
          return (
            <div key={app._id} className="rounded-3xl border bg-gradient-to-b from-white to-gray-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-sm font-semibold text-primary-800">{initials || 'CA'}</div><div><div className="text-lg font-semibold">{name}</div><div className="mt-1 text-sm text-gray-500">{app.applicantId?.location || 'N/A'}</div></div></div>
                  <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2"><div>Trust: {app.applicantId?.trustScore || 0}%</div><div>Status: {app.status}</div><div>Proposed: {formatCurrency(app.proposedAmount)}</div><div>Timeline: {app.proposedDuration || 'N/A'} days</div><div>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</div></div>
                  <div className="text-sm leading-7 text-gray-700">{app.coverLetter}</div>
                </div>
                <div className="flex flex-wrap gap-2 lg:w-[260px] lg:flex-col">
                  <Button asChild size="sm"><Link href={`/dashboard/company/applications/${app._id}`}>View Details</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link href="/dashboard/messages"><MessageSquare className="mr-2 h-4 w-4" />Message</Link></Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(app._id, 'shortlisted')} disabled={updatingId === app._id || app.status === 'shortlisted'}><Users2 className="mr-2 h-4 w-4" />Shortlist</Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(app._id, 'accepted')} disabled={updatingId === app._id || app.status === 'accepted'}><CheckCircle2 className="mr-2 h-4 w-4" />Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(app._id, 'rejected')} disabled={updatingId === app._id || app.status === 'rejected'}><UserRoundX className="mr-2 h-4 w-4" />Reject</Button>
                  <div className="text-xs text-gray-500"><Clock3 className="mr-1 inline h-3.5 w-3.5" />Keep candidates updated quickly.</div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent></Card>
    </div>
  );
}