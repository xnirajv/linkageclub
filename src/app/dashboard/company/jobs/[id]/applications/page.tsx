'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, Eye, Users } from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { applications = [], isLoading } = useApplications({ role: 'company', limit: 50 });
  const [query, setQuery] = useState('');

  const apps = (applications as any[]).filter((a: any) => {
    const jobId = typeof a.jobId?._id === 'string' ? a.jobId._id : a.jobId?._id?.toString();
    return jobId === params.id;
  });

  const filtered = useMemo(() => apps.filter((a: any) => {
    const name = a.applicantId?.name || '';
    return name.toLowerCase().includes(query.toLowerCase());
  }), [query, apps]);

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h1 className="text-2xl font-bold">Applications</h1><p className="text-gray-500">{apps.length} candidates</p></div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applicants..." className="pl-9 rounded-xl" />
      </div>

      {filtered.length === 0 ? (
        <Card className="border border-dashed border-gray-200 dark:border-gray-800 shadow-none"><CardContent className="p-12 text-center"><Users className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No applications yet</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app: any) => (
            <Card key={app._id} className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium">
                    {(app.applicantId?.name || 'C')[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{app.applicantId?.name}</p>
                    <p className="text-xs text-gray-500">{app.applicantId?.email} • Trust: {app.applicantId?.trustScore || 0}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{app.status || 'pending'}</Badge>
                  <Button size="sm" variant="ghost" asChild><Link href={`/dashboard/company/applications/${app._id}`}><Eye className="h-4 w-4" /></Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}