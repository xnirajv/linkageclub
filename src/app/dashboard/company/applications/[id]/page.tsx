'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Star, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { useApplication, useApplications } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { application, isLoading } = useApplication(params.id as string);
  const { updateStatus, scheduleInterview } = useApplications();
  const [updating, setUpdating] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '', type: 'video', duration: '60', link: '', notes: '' });

  const app = application as any;

  const handleStatus = async (status: string) => {
    setUpdating(true);
    await updateStatus(params.id as string, status);
    setUpdating(false);
  };

  const handleSchedule = async () => {
    setUpdating(true);
    await scheduleInterview(params.id as string, interviewForm);
    setShowInterview(false);
    setUpdating(false);
  };

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;
  if (!app) return <div className="text-center py-12"><p className="text-gray-500">Application not found</p><Button asChild variant="outline" className="mt-4"><Link href="/dashboard/company/applications">Back</Link></Button></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h1 className="text-2xl font-bold">Application</h1><p className="text-gray-500">{app.projectId?.title || app.jobId?.title || 'Position'}</p></div>
      </div>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xl font-semibold flex-shrink-0">
              {(app.applicantId?.name || 'A')[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">{app.applicantId?.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Mail className="h-4 w-4" />{app.applicantId?.email}</p>
                </div>
                <Badge variant={
                  app.status === 'pending' ? 'warning' : app.status === 'shortlisted' ? 'info' :
                  app.status === 'accepted' ? 'success' : 'secondary'
                }>{app.status}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-3 text-sm">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-current" />{app.applicantId?.trustScore || 0}%</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{app.proposedAmount ? formatCurrency(app.proposedAmount) : 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {app.coverLetter && (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800"><h3 className="font-semibold text-sm">Cover Letter</h3></div>
          <CardContent className="p-5"><p className="text-sm whitespace-pre-line">{app.coverLetter}</p></CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => handleStatus('shortlisted')} disabled={updating || app.status === 'shortlisted'}><CheckCircle2 className="h-4 w-4 mr-1" />Shortlist</Button>
        <Button size="sm" variant="outline" onClick={() => handleStatus('accepted')} disabled={updating || app.status === 'accepted'} className="text-green-600">Accept</Button>
        <Button size="sm" variant="outline" onClick={() => handleStatus('rejected')} disabled={updating || app.status === 'rejected'} className="text-red-600"><XCircle className="h-4 w-4 mr-1" />Reject</Button>
        <Button size="sm" variant="outline" onClick={() => setShowInterview(true)}><Calendar className="h-4 w-4 mr-1" />Interview</Button>
      </div>

      {showInterview && (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800"><h3 className="font-semibold text-sm">Schedule Interview</h3></div>
          <CardContent className="p-5 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input type="date" value={interviewForm.date} onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })} className="rounded-xl" />
              <Input type="time" value={interviewForm.time} onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })} className="rounded-xl" />
            </div>
            <select value={interviewForm.type} onChange={e => setInterviewForm({ ...interviewForm, type: e.target.value })} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="video">Video</option><option value="phone">Phone</option><option value="in-person">In Person</option>
            </select>
            <Input value={interviewForm.link} onChange={e => setInterviewForm({ ...interviewForm, link: e.target.value })} placeholder="Meeting link" className="rounded-xl" />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowInterview(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSchedule} disabled={updating}>Schedule</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}