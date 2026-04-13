'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, CreditCard, MessageSquare, ShieldCheck, Target } from 'lucide-react';
import { useApplication, useApplications } from '@/hooks/useApplications';
import { useProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/forms/Textarea';

type ApplicantRef = {
  _id?: string;
  name?: string;
  trustScore?: number;
  location?: string;
  skills?: Array<{ name?: string; level?: string }>;
};

type ProjectApplication = {
  _id: string;
  status?: string;
  proposedAmount?: number;
  applicantId?: ApplicantRef;
};

type SelectedApplicant = string | ApplicantRef;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CompanyProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, isLoading, errorMessage } = useProject(projectId);
  const { applications = [], isLoading: applicationsLoading, sendMessage } = useApplications({
    role: 'company',
    projectId,
    limit: 50,
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'candidate' | 'communication' | 'payments'>('overview');
  const [messageInput, setMessageInput] = useState('');
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSending, setMessageSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const typedApplications = applications as ProjectApplication[];
  const selectedApplication = useMemo(() => {
    if (!project?.selectedApplicant) {
      return typedApplications.find((application) => application.status === 'accepted') || null;
    }

    const selected = project.selectedApplicant as SelectedApplicant;
    const selectedId = typeof selected === 'string' ? selected : selected?._id;

    return (
      typedApplications.find(
        (application) => application.applicantId?._id === selectedId
      ) || null
    );
  }, [project?.selectedApplicant, typedApplications]);
  const selectedApplicationId = selectedApplication?._id || '';
  const { getMessages } = useApplication(selectedApplicationId);

  const completedMilestones = project?.milestones?.filter((item) => item.status === 'completed' || item.status === 'approved').length || 0;
  const progress = Math.round((completedMilestones / Math.max(project?.milestones?.length || 1, 1)) * 100);
  const releasedAmount =
    project?.milestones
      ?.filter((item) => item.status === 'approved' || item.status === 'completed')
      .reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  const pendingAmount = Math.max((project?.budget?.max || project?.budget?.min || 0) - releasedAmount, 0);

  useEffect(() => {
    let active = true;
    const loadMessages = async () => {
      if (!selectedApplicationId) {
        setMessages([]);
        return;
      }
      const data = await getMessages();
      if (active) {
        setMessages(data || []);
      }
    };
    void loadMessages();
    return () => {
      active = false;
    };
  }, [getMessages, selectedApplicationId]);

  const handleSendMessage = async () => {
    if (!selectedApplicationId || !messageInput.trim() || messageSending) return;
    setMessageSending(true);
    setMessageError(null);
    const result = await sendMessage(selectedApplicationId, messageInput.trim());
    if (!result.success) {
      setMessageError(result.error || 'Failed to send message.');
    } else {
      setMessageInput('');
      const updated = await getMessages();
      setMessages(updated || []);
    }
    setMessageSending(false);
  };

  if (isLoading || applicationsLoading) {
    return <div className="rounded-[28px] bg-card/80 p-8 text-sm text-charcoal-500 dark:bg-charcoal-900/72 dark:text-charcoal-400">Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage || 'Project not found.'}
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/my-projects">Back to My Projects</Link>
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
            <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">{project.title}</h1>
            <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Project detail, candidate management, milestones, and payment tracking in one company workspace.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/dashboard/company/my-projects/${projectId}/manage`}>Manage Project</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Candidate
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Status" value={String(project.status || 'open')} />
        <Metric title="Budget" value={`${formatCurrency(project.budget?.min || 0)} - ${formatCurrency(project.budget?.max || 0)}`} />
        <Metric title="Duration" value={`${project.duration || 0} days`} />
        <Metric title="Progress" value={`${progress}%`} />
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {[
          ['overview', 'Overview'],
          ['milestones', 'Milestones'],
          ['candidate', 'Candidate'],
          ['communication', 'Communication'],
          ['payments', 'Payments'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value as typeof activeTab)}
            className={`rounded-[24px] border px-4 py-3 text-left text-sm transition ${activeTab === value ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-card/80 text-charcoal-700 dark:border-white/10 dark:bg-charcoal-900/72 dark:text-charcoal-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Overview</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-charcoal-700 dark:text-charcoal-300">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                    <div className="text-xs uppercase tracking-[0.16em] text-charcoal-500">Project Details</div>
                    <div className="mt-3 space-y-2">
                      <div>Title: {project.title}</div>
                      <div>Category: {project.category || 'General'}</div>
                      <div>Budget: {formatCurrency(project.budget?.min || 0)} - {formatCurrency(project.budget?.max || 0)}</div>
                      <div>Duration: {project.duration || 0} days</div>
                      <div>Status: {project.status || 'open'}</div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                    <div className="text-xs uppercase tracking-[0.16em] text-charcoal-500">Quick Actions</div>
                    <div className="mt-3 flex flex-col gap-2">
                      <Button asChild size="sm">
                        <Link href="/dashboard/messages">Message Candidate</Link>
                      </Button>
                      <Button size="sm" variant="outline">Review Milestone</Button>
                      <Button size="sm" variant="outline">Release Payment</Button>
                      <Button size="sm" variant="outline">View Contract</Button>
                      <Button size="sm" variant="outline">Report Issue</Button>
                    </div>
                  </div>
                </div>
                <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                  <div className="font-semibold text-charcoal-950 dark:text-white">Project Description</div>
                  <div className="mt-3 leading-7">{project.description}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'milestones' && (
            <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Milestones</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(project.milestones || []).map((milestone, index) => (
                  <div key={`${milestone.title}-${index}`} className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-charcoal-950 dark:text-white">{milestone.title}</div>
                        <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{formatCurrency(milestone.amount || 0)}</div>
                      </div>
                      <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">{milestone.status || 'pending'}</span>
                    </div>
                  </div>
                ))}
                {(project.milestones || []).length === 0 && (
                  <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-6 text-sm text-charcoal-500">
                    No milestones added yet.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'communication' && (
            <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Communication</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm text-charcoal-700 dark:text-charcoal-300">
                {messages.length === 0 && (
                  <div className="rounded-[22px] border border-dashed border-primary-200 bg-silver-50/70 p-4 text-sm text-charcoal-500">
                    No messages yet.
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
                    <div className="text-xs text-charcoal-500">{message.sender?.name || 'User'}</div>
                    <div className="text-[11px] text-charcoal-400">
                      {message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Recently'}
                    </div>
                    <div className="mt-2 text-sm text-charcoal-700">{message.content}</div>
                  </div>
                ))}
                {messageError && (
                  <div className="rounded-[22px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {messageError}
                  </div>
                )}
                <div className="space-y-3">
                  <Textarea
                    rows={3}
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    placeholder="Type your message..."
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim() || messageSending}>
                    {messageSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {activeTab === 'candidate' && (
            <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Candidate</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
                <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                  <div className="font-semibold text-charcoal-950 dark:text-white">{selectedApplication?.applicantId?.name || 'No candidate selected yet'}</div>
                  <div className="mt-2">Trust Score: {selectedApplication?.applicantId?.trustScore || 0}%</div>
                  <div className="mt-1">Location: {selectedApplication?.applicantId?.location || 'Not provided'}</div>
                  <div className="mt-1">Status: {selectedApplication?.status || 'Awaiting company decision'}</div>
                  <div className="mt-1">Proposed amount: {formatCurrency(selectedApplication?.proposedAmount || 0)}</div>
                  {selectedApplication?.applicantId?.skills?.length ? (
                    <div className="mt-2 text-xs text-charcoal-600">
                      Skills: {selectedApplication.applicantId.skills.map((skill) => skill.name).filter(Boolean).join(', ')}
                    </div>
                  ) : null}
                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/company/my-projects/${projectId}/applications`}>Review Applicants</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/messages">Message</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Payments</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
                <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                  <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-secondary-700" />Released: {formatCurrency(releasedAmount)}</div>
                  <div className="mt-2">Pending: {formatCurrency(pendingAmount)}</div>
                  <div className="mt-2">Platform commission (10%): {formatCurrency(Math.round((project.budget?.max || project.budget?.min || 0) * 0.1))}</div>
                </div>
                <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-4 text-xs text-charcoal-500">
                  Transaction history will appear here once payments are released.
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-white/70"><ShieldCheck className="h-4 w-4" />Company Control</div>
              <div className="mt-4 text-xl font-semibold">This project now reflects the real database state instead of placeholder candidate and milestone data.</div>
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

function ActionCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
      <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-950 dark:text-white">{icon}{title}</div>
      <div className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">{text}</div>
    </div>
  );
}
