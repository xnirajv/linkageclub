'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Download, Mail, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useApplication, useApplications } from '@/hooks/useApplications';

type ApplicationDetail = {
  _id: string;
  status?: string;
  coverLetter?: string;
  proposedAmount?: number;
  proposedDuration?: number;
  applicantId?: { _id?: string; name?: string; email?: string; trustScore?: number; location?: string };
  projectId?: { title?: string };
};

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

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const { application, isLoading, errorMessage, getStatusHistory } = useApplication(applicationId);
  const { updateStatus, sendMessage, scheduleInterview } = useApplications();
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [reviewNotes, setReviewNotes] = useState<string | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    type: 'video',
    duration: '60',
    link: '',
    location: '',
    notes: '',
  });

  const detail = application as ApplicationDetail | undefined;
  const candidate = detail?.applicantId;
  const projectTitle = detail?.projectId?.title || 'Project';
  const statusLabel = detail?.status || 'pending';

  const metrics = useMemo(() => ({
    trustScore: candidate?.trustScore ?? 0,
    proposed: formatCurrency(detail?.proposedAmount),
    timeline: detail?.proposedDuration ? `${detail.proposedDuration} days` : 'N/A',
  }), [candidate?.trustScore, detail?.proposedAmount, detail?.proposedDuration]);

  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      const data = await getStatusHistory();
      if (!active) return;
      if (!data) {
        setHistoryError('Failed to load status history.');
      } else {
        setStatusHistory(data.history || []);
        setReviewNotes(data.reviewNotes || null);
      }
      setHistoryLoading(false);
    };

    if (applicationId) {
      loadHistory();
    }

    return () => {
      active = false;
    };
  }, [applicationId, getStatusHistory]);

  const refreshHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    const data = await getStatusHistory();
    if (!data) {
      setHistoryError('Failed to load status history.');
    } else {
      setStatusHistory(data.history || []);
      setReviewNotes(data.reviewNotes || null);
    }
    setHistoryLoading(false);
  };

  const handleStatus = async (nextStatus: 'shortlisted' | 'accepted' | 'rejected') => {
    if (isUpdating) return;
    setIsUpdating(true);
    setActionError(null);
    setActionSuccess(null);
    const result = await updateStatus(applicationId, nextStatus);
    if (!result.success) {
      setActionError(result.error || 'Failed to update status.');
    } else {
      setActionSuccess(`Application marked as ${nextStatus}.`);
      await refreshHistory();
    }
    setIsUpdating(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    setActionError(null);
    setActionSuccess(null);
    const result = await sendMessage(applicationId, message.trim());
    if (!result.success) {
      setActionError(result.error || 'Failed to send message.');
    } else {
      setActionSuccess('Message sent.');
      setMessage('');
    }
    setIsSending(false);
  };

  const handleScheduleInterview = async () => {
    if (isScheduling) return;
    setIsScheduling(true);
    setActionError(null);
    setActionSuccess(null);

    const result = await scheduleInterview(applicationId, {
      date: interviewForm.date,
      time: interviewForm.time,
      type: interviewForm.type,
      duration: Number(interviewForm.duration),
      link: interviewForm.link || undefined,
      location: interviewForm.location || undefined,
      notes: interviewForm.notes || undefined,
    });

    if (!result.success) {
      setActionError(result.error || 'Failed to schedule interview.');
    } else {
      setActionSuccess('Interview scheduled.');
      setIsInterviewOpen(false);
      await refreshHistory();
    }
    setIsScheduling(false);
  };

  if (isLoading) {
    return <div className="rounded-[28px] bg-card/80 p-8 text-sm text-charcoal-500 dark:bg-charcoal-900/72 dark:text-charcoal-400">Loading application...</div>;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage || 'Application not found.'}
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/applications">Back to Applications</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Application Detail</h1>
            <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Review candidate profile, proposal fit, communication, and next-step actions from one premium application workspace.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleStatus('shortlisted')} disabled={isUpdating || statusLabel === 'shortlisted'}>
            {isUpdating ? 'Updating...' : 'Shortlist'}
          </Button>
          <Button variant="outline" onClick={() => handleStatus('rejected')} disabled={isUpdating || statusLabel === 'rejected'}>
            Reject
          </Button>
          <Button variant="outline" onClick={() => handleStatus('accepted')} disabled={isUpdating || statusLabel === 'accepted'}>
            Accept
          </Button>
          <Button variant="outline" onClick={() => setIsInterviewOpen(true)}>
            Schedule Interview
          </Button>
        </div>
      </div>

      {(actionError || actionSuccess) && (
        <div className={`rounded-2xl border p-4 text-sm ${actionError ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {actionError || actionSuccess}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Trust Score" value={`${metrics.trustScore}%`} />
        <Metric title="Status" value={statusLabel} />
        <Metric title="Proposed" value={metrics.proposed} />
        <Metric title="Timeline" value={metrics.timeline} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Candidate Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                <div className="font-semibold text-charcoal-950 dark:text-white">{candidate?.name || 'Candidate'}</div>
                <div className="mt-1 text-charcoal-500 dark:text-charcoal-400">{projectTitle}</div>
                <div className="mt-3">{candidate?.email || 'Email not provided'}</div>
                <div className="mt-1">{candidate?.location || 'Location not provided'}</div>
                <div className="mt-3 flex items-center gap-2"><Star className="h-4 w-4 text-secondary-600" />Status: {statusLabel}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Cover Letter</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-charcoal-700 dark:text-charcoal-300">
              {detail.coverLetter || 'No cover letter provided.'}
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Communication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-300">
                Candidate conversation is aligned with the new company workflow. Use the quick reply area below to keep the hiring thread moving.
              </div>
              <div className="flex gap-3">
                <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." />
                <Button onClick={handleSendMessage} disabled={isSending || !message.trim()}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">AI Insight Snapshot</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                Proposed: {metrics.proposed} - {metrics.timeline} - Trust Score: {metrics.trustScore}%
              </div>
              <div className="rounded-[22px] border border-secondary-200 bg-secondary-50/80 p-4 dark:border-secondary-800/30 dark:bg-secondary-950/10">
                Status: {statusLabel}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Status History</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
              {historyLoading && <div className="rounded-[22px] bg-silver-50/70 p-4 text-sm text-charcoal-500">Loading history...</div>}
              {historyError && <div className="rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{historyError}</div>}
              {!historyLoading && !historyError && statusHistory.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-primary-200 bg-silver-50/70 p-4 text-sm text-charcoal-500">
                  No status updates yet.
                </div>
              )}
              {!historyLoading && !historyError && statusHistory.map((item, index) => (
                <div key={`${item.status}-${item.timestamp}-${index}`} className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
                  <div className="font-semibold text-charcoal-950 dark:text-white">{item.status}</div>
                  <div className="mt-1 text-xs text-charcoal-500">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recently'}
                  </div>
                  {item.notes && <div className="mt-2 text-sm text-charcoal-600">{item.notes}</div>}
                </div>
              ))}
              {reviewNotes && (
                <div className="rounded-[22px] border border-secondary-200 bg-secondary-50/80 p-4 text-sm text-charcoal-700">
                  Latest review notes: {reviewNotes}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => handleStatus('shortlisted')} disabled={isUpdating || statusLabel === 'shortlisted'}>
                Shortlist Candidate
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsInterviewOpen(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <Mail className="mr-2 h-4 w-4" />
                Email Candidate
              </Button>
              <Button variant="outline" className="w-full" disabled>
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/company/applications">Back to Applications</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-white/70"><ShieldCheck className="h-4 w-4" />Application Workspace</div>
              <div className="mt-4 text-xl font-semibold">This detail page now pulls live applicant data, statuses, and messaging state.</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isInterviewOpen} onOpenChange={setIsInterviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              type="date"
              value={interviewForm.date}
              onChange={(e) => setInterviewForm((prev) => ({ ...prev, date: e.target.value }))}
            />
            <Input
              type="time"
              value={interviewForm.time}
              onChange={(e) => setInterviewForm((prev) => ({ ...prev, time: e.target.value }))}
            />
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={interviewForm.type}
              onChange={(e) => setInterviewForm((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="video">Video</option>
              <option value="phone">Phone</option>
              <option value="in-person">In person</option>
            </select>
            <Input
              type="number"
              min="15"
              max="180"
              value={interviewForm.duration}
              onChange={(e) => setInterviewForm((prev) => ({ ...prev, duration: e.target.value }))}
              placeholder="Duration in minutes"
            />
            <Input
              value={interviewForm.link}
              onChange={(e) => setInterviewForm((prev) => ({ ...prev, link: e.target.value }))}
              placeholder="Meeting link (optional)"
            />
            <Input
              value={interviewForm.location}
              onChange={(e) => setInterviewForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Location (optional)"
            />
            <Input
              value={interviewForm.notes}
              onChange={(e) => setInterviewForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes (optional)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInterviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleInterview}
              disabled={isScheduling || !interviewForm.date || !interviewForm.time}
            >
              {isScheduling ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
      <CardContent className="p-5">
        <div className="text-sm uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{title}</div>
        <div className="mt-3 text-2xl font-semibold text-charcoal-950 dark:text-white">{value}</div>
      </CardContent>
    </Card>
  );
}
