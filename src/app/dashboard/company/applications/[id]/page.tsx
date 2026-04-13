'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Download, Mail, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { application, isLoading, errorMessage } = useApplication(applicationId);
  const { updateStatus, sendMessage } = useApplications();
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const detail = application as ApplicationDetail | undefined;
  const candidate = detail?.applicantId;
  const projectTitle = detail?.projectId?.title || 'Project';
  const statusLabel = detail?.status || 'pending';

  const metrics = useMemo(() => ({
    trustScore: candidate?.trustScore ?? 0,
    proposed: formatCurrency(detail?.proposedAmount),
    timeline: detail?.proposedDuration ? `${detail.proposedDuration} days` : 'N/A',
  }), [candidate?.trustScore, detail?.proposedAmount, detail?.proposedDuration]);

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
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => handleStatus('shortlisted')} disabled={isUpdating || statusLabel === 'shortlisted'}>
                Shortlist Candidate
              </Button>
              <Button variant="outline" className="w-full" disabled>
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
