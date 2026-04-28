'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Filter, MessageSquare, Search, Sparkles, UserRoundX } from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';

type CompanyApplication = {
  _id: string; status?: string; proposedAmount?: number; proposedDuration?: number;
  submittedAt?: string; createdAt?: string; coverLetter?: string; attachments?: string[];
  applicantId?: { name?: string; trustScore?: number; location?: string; skills?: Array<{ name?: string }>; experience?: Array<{ title?: string }> };
  projectId?: { _id?: string; title?: string }; jobId?: { title?: string };
};

const statusTabs = ['all', 'pending', 'shortlisted', 'interview', 'rejected'] as const;
type StatusTab = typeof statusTabs[number];

function formatCurrency(value?: number) { if (!value) return 'Negotiable'; return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value); }
function relativeLabel(value?: string) { if (!value) return 'Recently'; const hours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60))); if (hours < 24) return `${hours}h ago`; return `${Math.round(hours / 24)}d ago`; }

export default function CompanyApplicationsPage() {
  const { applications = [], isLoading, errorMessage, updateStatus, sendMessage } = useApplications({ role: 'company', limit: 100 });
  const typedApplications = applications as CompanyApplication[];
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<StatusTab>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMessageOpen, setBulkMessageOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const displayApplications = useMemo(() => typedApplications.filter((app) => {
    const searchMatch = (app.applicantId?.name || '').toLowerCase().includes(query.toLowerCase()) || (app.projectId?.title || '').toLowerCase().includes(query.toLowerCase());
    const statusMatch = tab === 'all' || (tab === 'interview' ? (app.status || '').startsWith('interview') : (app.status || '') === tab);
    return searchMatch && statusMatch;
  }), [query, tab, typedApplications]);

  const stats = { all: typedApplications.length, pending: typedApplications.filter((a) => a.status === 'pending').length, shortlisted: typedApplications.filter((a) => a.status === 'shortlisted').length, rejected: typedApplications.filter((a) => a.status === 'rejected').length };

  const handleStatusChange = async (id: string, status: string) => {
    if (updatingId) return; setUpdatingId(id); setActionError(null);
    const result = await updateStatus(id, status);
    if (!result.success) setActionError(result.error || 'Failed');
    setUpdatingId(null);
  };

  const toggleSelect = (id: string) => { setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };
  const toggleSelectAll = () => { setSelectedIds((prev) => prev.size === displayApplications.length ? new Set() : new Set(displayApplications.map((a) => a._id))); };

  const handleBulkMessage = async () => {
    if (!bulkMessage.trim() || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    for (const id of ids) await sendMessage(id, bulkMessage.trim());
    setBulkMessage(''); setBulkMessageOpen(false); setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700"><Sparkles className="h-3.5 w-3.5" />Applications Management</div>
        <h1 className="mt-4 text-3xl font-semibold">Applications</h1>
        <p className="mt-2 text-sm text-gray-500">Review new candidates, shortlist strong profiles, and move the hiring pipeline forward.</p>
      </div>

      {(actionError || errorMessage) && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{actionError || errorMessage}</div>}

      <Card className="border-none bg-card/80"><CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by applicant or project..." className="pl-9" /></div><Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filters</Button></CardContent></Card>

      <div className="grid gap-3 md:grid-cols-5">{statusTabs.map((value) => (<button key={value} type="button" onClick={() => setTab(value)} className={`rounded-2xl border px-4 py-4 text-left transition ${tab === value ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-card/80'}`}><div className="font-semibold capitalize">{value === 'all' ? 'All' : value}</div><div className="mt-1 text-sm">{stats[value]}</div></button>))}</div>

      <Card className="border-none bg-card/80"><CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3 text-sm"><input type="checkbox" checked={displayApplications.length > 0 && selectedIds.size === displayApplications.length} onChange={toggleSelectAll} /><span>{selectedIds.size} selected</span></div><div className="flex gap-2"><Button variant="outline" onClick={() => setBulkMessageOpen(true)} disabled={selectedIds.size === 0}>Message All</Button></div></CardContent></Card>

      <Card className="border-none bg-card/80 shadow-lg"><CardHeader><CardTitle>Applications List ({displayApplications.length})</CardTitle></CardHeader><CardContent className="space-y-4">
        {isLoading && <div className="rounded-2xl bg-gray-50 p-6 text-sm">Loading...</div>}
        {!isLoading && displayApplications.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">No applications match this view.</div>}
        {!isLoading && displayApplications.map((app) => {
          const name = app.applicantId?.name || 'Candidate';
          const title = app.projectId?.title || 'Opportunity';
          const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2);
          return (
            <div key={app._id} className="rounded-3xl border bg-gradient-to-b from-white to-gray-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={selectedIds.has(app._id)} onChange={() => toggleSelect(app._id)} />
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-sm font-semibold text-primary-800">{initials}</div>
                    <div><h3 className="text-lg font-semibold">{name}</h3><p className="text-sm text-gray-500">Applied for: {title}</p></div>
                  </div>
                  <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2"><div>Trust: {app.applicantId?.trustScore || 0}%</div><div>Status: {app.status || 'pending'}</div><div>Proposed: {formatCurrency(app.proposedAmount)}</div><div>{relativeLabel(app.submittedAt || app.createdAt)}</div></div>
                  {app.coverLetter && <div className="text-sm text-gray-700">{app.coverLetter.slice(0, 140)}{app.coverLetter.length > 140 ? '...' : ''}</div>}
                </div>
                <div className="flex flex-wrap gap-2 lg:w-[240px] lg:flex-col">
                  <Button asChild size="sm"><Link href={`/dashboard/company/applications/${app._id}`}>View Full Application</Link></Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(app._id, 'shortlisted')} disabled={updatingId === app._id}>Shortlist</Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(app._id, 'accepted')} disabled={updatingId === app._id}><CheckCircle2 className="mr-2 h-4 w-4" />Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(app._id, 'rejected')} disabled={updatingId === app._id}><UserRoundX className="mr-2 h-4 w-4" />Reject</Button>
                  <Button asChild size="sm" variant="outline"><Link href="/dashboard/messages"><MessageSquare className="mr-2 h-4 w-4" />Message</Link></Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent></Card>

      <Dialog open={bulkMessageOpen} onOpenChange={setBulkMessageOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Message Selected Candidates</DialogTitle></DialogHeader><Textarea rows={5} value={bulkMessage} onChange={(e) => setBulkMessage(e.target.value)} placeholder="Write a message..." /><DialogFooter><Button variant="outline" onClick={() => setBulkMessageOpen(false)}>Cancel</Button><Button onClick={handleBulkMessage} disabled={!bulkMessage.trim()}>Send</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}