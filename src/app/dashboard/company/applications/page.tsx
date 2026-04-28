'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Users, MessageSquare, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

function timeAgo(date: string) {
  const hours = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export default function ApplicationsPage() {
  const { applications = [], isLoading, updateStatus } = useApplications({ role: 'company', limit: 50 });
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');

  const apps = applications as any[];

  const filtered = useMemo(() => apps.filter((a: any) => {
    const name = (a.applicantId?.name || '').toLowerCase();
    const title = (a.projectId?.title || a.jobId?.title || '').toLowerCase();
    const match = name.includes(query.toLowerCase()) || title.includes(query.toLowerCase());
    const tabMatch = tab === 'all' || a.status === tab;
    return match && tabMatch;
  }), [query, tab, apps]);

  const counts = {
    all: apps.length,
    pending: apps.filter((a: any) => a.status === 'pending').length,
    shortlisted: apps.filter((a: any) => a.status === 'shortlisted').length,
    accepted: apps.filter((a: any) => a.status === 'accepted').length,
    rejected: apps.filter((a: any) => a.status === 'rejected').length,
  };

  const handleStatus = async (id: string, status: string) => {
    await updateStatus(id, status);
  };

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-3 py-1 text-xs font-medium text-gray-500 mb-3">
          <Sparkles className="h-3 w-3" />Applications
        </div>
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-gray-500 mt-1">Review and manage candidate applications</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or project..." className="pl-9 rounded-xl" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries({ all: 'All', pending: 'New', shortlisted: 'Shortlisted', accepted: 'Hired', rejected: 'Rejected' }).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === key ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {label} ({counts[key as keyof typeof counts]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border border-dashed border-gray-200 dark:border-gray-800 shadow-none">
          <CardContent className="p-12 text-center"><Users className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No applications found</p></CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app: any) => (
            <Card key={app._id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-sm font-medium flex-shrink-0">
                      {(app.applicantId?.name || 'C')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{app.applicantId?.name || 'Candidate'}</h3>
                        <Badge variant={
                          app.status === 'pending' ? 'warning' : app.status === 'shortlisted' ? 'info' :
                          app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'secondary'
                        } className="text-[10px]">{app.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {app.projectId?.title || app.jobId?.title || 'Position'} • Trust: {app.applicantId?.trustScore || 0}% • {timeAgo(app.submittedAt || app.createdAt)}
                      </p>
                      {app.coverLetter && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{app.coverLetter}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" asChild><Link href={`/dashboard/company/applications/${app._id}`}><Eye className="h-4 w-4" /></Link></Button>
                    {app.status === 'pending' && (
                      <>
                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleStatus(app._id, 'shortlisted')}><CheckCircle2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleStatus(app._id, 'rejected')}><XCircle className="h-4 w-4" /></Button>
                      </>
                    )}
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