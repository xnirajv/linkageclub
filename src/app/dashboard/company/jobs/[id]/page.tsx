'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Users, Eye, Briefcase } from 'lucide-react';
import { useJob } from '@/hooks/useJobs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function formatSalary(job: any) {
  if (!job?.salary?.min) return 'Not specified';
  return `₹${Math.round(job.salary.min / 100000)}L - ₹${Math.round(job.salary.max / 100000)}L`;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { job, isLoading } = useJob(params.id as string);
  const j = (job || {}) as any;

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (!job) return <div className="text-center py-12"><p className="text-gray-500">Job not found</p><Button asChild variant="outline" className="mt-4"><Link href="/dashboard/company/jobs">Back</Link></Button></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1"><h1 className="text-2xl font-bold">{j.title}</h1><p className="text-gray-500">{j.location || 'Remote'} • {j.type || 'Full-time'}</p></div>
        <Button size="sm" asChild><Link href={`/dashboard/company/jobs/${params.id}/applications`}><Users className="h-4 w-4 mr-1" />Applications ({j.applicationsCount || 0})</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm"><CardContent className="p-4 text-center"><MapPin className="h-5 w-5 text-gray-400 mx-auto mb-1" /><p className="font-medium">{j.location || 'Remote'}</p></CardContent></Card>
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm"><CardContent className="p-4 text-center"><Briefcase className="h-5 w-5 text-gray-400 mx-auto mb-1" /><p className="font-medium">{j.type || 'Full-time'}</p></CardContent></Card>
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm"><CardContent className="p-4 text-center"><Clock className="h-5 w-5 text-gray-400 mx-auto mb-1" /><p className="font-medium">{formatSalary(j)}</p></CardContent></Card>
      </div>

      {j.description && (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800"><h3 className="font-semibold">Description</h3></div>
          <CardContent className="p-5"><p className="text-sm whitespace-pre-line">{j.description}</p></CardContent>
        </Card>
      )}

      {j.skills?.length > 0 && (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800"><h3 className="font-semibold">Skills</h3></div>
          <CardContent className="p-5"><div className="flex flex-wrap gap-2">{j.skills.map((s: any) => <Badge key={s.name} variant="secondary">{s.name}</Badge>)}</div></CardContent>
        </Card>
      )}
    </div>
  );
}