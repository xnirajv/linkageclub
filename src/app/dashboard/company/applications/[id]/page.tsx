'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Mail, MessageSquare, ShieldCheck, Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useApplication, useApplications } from '@/hooks/useApplications';

type ApplicationDetail = {
  _id: string; status?: string; coverLetter?: string; proposedAmount?: number; proposedDuration?: number;
  applicantId?: { _id?: string; name?: string; email?: string; trustScore?: number; location?: string };
  projectId?: { title?: string };
};

function formatCurrency(value?: number) { if (!value) return 'Negotiable'; return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value); }

export default function ApplicationDetailPage() {
  const params = useParams(); const router = useRouter(); const applicationId = params.id as string;
  const { application, isLoading, errorMessage, getStatusHistory } = useApplication(applicationId);
  const { updateStatus, sendMessage, scheduleInterview } = useApplications();
  const [message, setMessage] = useState(''); const [actionError, setActionError] = useState<string | null>(null); const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false); const [isSending, setIsSending] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false); const [isScheduling, setIsScheduling] = useState(false);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '', type: 'video', duration: '60', link: '', location: '', notes: '' });

  const detail = application as ApplicationDetail | undefined;
  const candidate = detail?.applicantId;
  const projectTitle = detail?.projectId?.title || 'Project';

  useEffect(() => {
    let active = true;
    const loadHistory = async () => { const data = await getStatusHistory(); if (active && data) setStatusHistory(data.history || []); };
    if (applicationId) loadHistory();
    return () => { active = false; };
  }, [applicationId, getStatusHistory]);

  const handleStatus = async (nextStatus: string) => { if (isUpdating) return; setIsUpdating(true); setActionError(null); const result = await updateStatus(applicationId, nextStatus); if (!result.success) setActionError(result.error || 'Failed'); else { setActionSuccess(`Application marked as ${nextStatus}.`); const data = await getStatusHistory(); if (data) setStatusHistory(data.history || []); } setIsUpdating(false); };

  const handleSendMessage = async () => { if (!message.trim() || isSending) return; setIsSending(true); const result = await sendMessage(applicationId, message.trim()); if (!result.success) setActionError(result.error || 'Failed'); else { setActionSuccess('Message sent.'); setMessage(''); } setIsSending(false); };

  const handleScheduleInterview = async () => { if (isScheduling) return; setIsScheduling(true); const result = await scheduleInterview(applicationId, { date: interviewForm.date, time: interviewForm.time, type: interviewForm.type, duration: Number(interviewForm.duration), link: interviewForm.link || undefined, location: interviewForm.location || undefined, notes: interviewForm.notes || undefined }); if (!result.success) setActionError(result.error || 'Failed'); else { setActionSuccess('Interview scheduled.'); setIsInterviewOpen(false); } setIsScheduling(false); };

  if (isLoading) return <div className="rounded-3xl bg-card/80 p-8 text-sm text-gray-500">Loading...</div>;
  if (!detail) return <div className="space-y-4"><div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{errorMessage || 'Application not found.'}</div><Button asChild variant="outline"><Link href="/dashboard/company/applications">Back</Link></Button></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3"><Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button><div><h1 className="text-3xl font-semibold">Application Detail</h1><p className="mt-2 text-sm text-gray-500">Review candidate profile and take action.</p></div></div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleStatus('shortlisted')} disabled={isUpdating}>Shortlist</Button>
          <Button variant="outline" onClick={() => handleStatus('rejected')} disabled={isUpdating}>Reject</Button>
          <Button variant="outline" onClick={() => handleStatus('accepted')} disabled={isUpdating}>Accept</Button>
          <Button variant="outline" onClick={() => setIsInterviewOpen(true)}>Schedule Interview</Button>
        </div>
      </div>

      {(actionError || actionSuccess) && <div className={`rounded-2xl border p-4 text-sm ${actionError ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{actionError || actionSuccess}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Trust Score" value={`${candidate?.trustScore || 0}%`} />
        <Metric title="Status" value={detail.status || 'pending'} />
        <Metric title="Proposed" value={formatCurrency(detail.proposedAmount)} />
        <Metric title="Timeline" value={detail.proposedDuration ? `${detail.proposedDuration} days` : 'N/A'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80"><CardHeader><CardTitle>Candidate Profile</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div className="rounded-2xl border bg-gray-50 p-4"><div className="font-semibold">{candidate?.name || 'Candidate'}</div><div className="mt-1 text-gray-500">{projectTitle}</div><div className="mt-3">{candidate?.email || 'N/A'}</div><div className="mt-1">{candidate?.location || 'N/A'}</div></div></CardContent></Card>
          <Card className="border-none bg-card/80"><CardHeader><CardTitle>Cover Letter</CardTitle></CardHeader><CardContent className="text-sm"><p>{detail.coverLetter || 'No cover letter.'}</p></CardContent></Card>
          <Card className="border-none bg-card/80"><CardHeader><CardTitle>Communication</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex gap-3"><Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type message..." /><Button onClick={handleSendMessage} disabled={isSending || !message.trim()}><MessageSquare className="h-4 w-4" /></Button></div></CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card className="border-none bg-card/80"><CardHeader><CardTitle>Status History</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">{statusHistory.length === 0 && <div className="rounded-2xl border border-dashed p-4 text-sm text-gray-500">No status updates yet.</div>}{statusHistory.map((item, i) => (<div key={`${item.status}-${i}`} className="rounded-2xl border bg-gray-50 p-4"><div className="font-semibold">{item.status}</div><div className="mt-1 text-xs text-gray-500">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recently'}</div>{item.notes && <div className="mt-2 text-sm">{item.notes}</div>}</div>))}</CardContent></Card>
          <Card className="border-none bg-card/80"><CardHeader><CardTitle>Actions</CardTitle></CardHeader><CardContent className="space-y-3"><Button className="w-full" onClick={() => handleStatus('shortlisted')} disabled={isUpdating}>Shortlist</Button><Button variant="outline" className="w-full" onClick={() => setIsInterviewOpen(true)}><Calendar className="mr-2 h-4 w-4" />Schedule Interview</Button><Button variant="outline" className="w-full" disabled><Mail className="mr-2 h-4 w-4" />Email</Button><Button variant="outline" className="w-full" disabled><Download className="mr-2 h-4 w-4" />Resume</Button></CardContent></Card>
        </div>
      </div>

      <Dialog open={isInterviewOpen} onOpenChange={setIsInterviewOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Input type="date" value={interviewForm.date} onChange={(e) => setInterviewForm((p) => ({ ...p, date: e.target.value }))} />
            <Input type="time" value={interviewForm.time} onChange={(e) => setInterviewForm((p) => ({ ...p, time: e.target.value }))} />
            <select className="w-full rounded-md border p-2" value={interviewForm.type} onChange={(e) => setInterviewForm((p) => ({ ...p, type: e.target.value }))}><option value="video">Video</option><option value="phone">Phone</option><option value="in-person">In person</option></select>
            <Input type="number" min="15" max="180" value={interviewForm.duration} onChange={(e) => setInterviewForm((p) => ({ ...p, duration: e.target.value }))} placeholder="Duration (min)" />
            <Input value={interviewForm.link} onChange={(e) => setInterviewForm((p) => ({ ...p, link: e.target.value }))} placeholder="Meeting link" />
            <Input value={interviewForm.notes} onChange={(e) => setInterviewForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsInterviewOpen(false)}>Cancel</Button><Button onClick={handleScheduleInterview} disabled={isScheduling || !interviewForm.date || !interviewForm.time}>{isScheduling ? 'Scheduling...' : 'Schedule'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return <Card className="border-none bg-card/80"><CardContent className="p-5"><div className="text-sm uppercase tracking-wider text-gray-500">{title}</div><div className="mt-3 text-2xl font-semibold">{value}</div></CardContent></Card>;
}