'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, Filter, MessageSquare, Search, Sparkles, UserRoundX,
} from 'lucide-react';
import { useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';

type CompanyApplication = {
  _id: string;
  status?: string;
  proposedAmount?: number;
  proposedDuration?: number;
  submittedAt?: string;
  createdAt?: string;
  coverLetter?: string;
  attachments?: string[];
  applicantId?: {
    name?: string;
    trustScore?: number;
    location?: string;
    skills?: Array<{ name?: string }>;
    experience?: Array<{ title?: string }>;
  };
  projectId?: { _id?: string; title?: string };
  jobId?: { title?: string };
};

const statusTabs = ['all', 'pending', 'shortlisted', 'interview', 'rejected'] as const;
type StatusTab = typeof statusTabs[number];
type TrustFilter = 'any' | '80' | '90';
type ExperienceFilter = 'any' | '1-2' | '3-5' | '5+';

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

function relativeLabel(value?: string) {
  if (!value) return 'Recently';
  const hours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60)));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function isInterviewStatus(status?: string) {
  return status?.startsWith('interview');
}

function getExperienceYears(application: CompanyApplication) {
  return application.applicantId?.experience?.length || 0;
}

export default function CompanyApplicationsPage() {
  const { applications = [], isLoading, errorMessage, updateStatus, sendMessage } = useApplications({ role: 'company', limit: 100 });
  const typedApplications = applications as CompanyApplication[];
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<StatusTab>('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [trustFilter, setTrustFilter] = useState<TrustFilter>('any');
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('any');
  const [skillFilter, setSkillFilter] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMessageOpen, setBulkMessageOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkSending, setBulkSending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const projectOptions = useMemo(() => {
    const options = new Map<string, string>();
    typedApplications.forEach((application) => {
      if (application.projectId?._id) {
        options.set(application.projectId._id, application.projectId.title || 'Project');
      }
    });
    return Array.from(options.entries());
  }, [typedApplications]);

  const displayApplications = useMemo(() => {
    return typedApplications.filter((application) => {
      const applicant = application.applicantId?.name || '';
      const opportunity = application.projectId?.title || application.jobId?.title || '';
      const searchMatch =
        applicant.toLowerCase().includes(query.toLowerCase()) ||
        opportunity.toLowerCase().includes(query.toLowerCase()) ||
        (application.applicantId?.skills || []).some((skill) =>
          (skill.name || '').toLowerCase().includes(query.toLowerCase())
        );

      const statusMatch =
        tab === 'all' ||
        (tab === 'interview' ? isInterviewStatus(application.status) : (application.status || '').toLowerCase() === tab);

      const projectMatch = projectFilter === 'all' || application.projectId?._id === projectFilter;

      const trustScore = application.applicantId?.trustScore || 0;
      const trustMatch =
        trustFilter === 'any' ||
        (trustFilter === '80' && trustScore >= 80) ||
        (trustFilter === '90' && trustScore >= 90);

      const experienceYears = getExperienceYears(application);
      const experienceMatch =
        experienceFilter === 'any' ||
        (experienceFilter === '1-2' && experienceYears >= 1 && experienceYears <= 2) ||
        (experienceFilter === '3-5' && experienceYears >= 3 && experienceYears <= 5) ||
        (experienceFilter === '5+' && experienceYears >= 5);

      const skillMatch =
        !skillFilter ||
        (application.applicantId?.skills || []).some((skill) =>
          (skill.name || '').toLowerCase().includes(skillFilter.toLowerCase())
        );

      const min = minBudget ? Number(minBudget) : null;
      const max = maxBudget ? Number(maxBudget) : null;
      const budget = application.proposedAmount || 0;
      const budgetMatch =
        (!min || budget >= min) && (!max || budget <= max);

      return searchMatch && statusMatch && projectMatch && trustMatch && experienceMatch && skillMatch && budgetMatch;
    });
  }, [query, tab, typedApplications, projectFilter, trustFilter, experienceFilter, skillFilter, minBudget, maxBudget]);

  const stats = {
    all: typedApplications.length,
    pending: typedApplications.filter((item) => item.status === 'pending').length,
    shortlisted: typedApplications.filter((item) => item.status === 'shortlisted').length,
    interview: typedApplications.filter((item) => isInterviewStatus(item.status)).length,
    rejected: typedApplications.filter((item) => item.status === 'rejected').length,
  };

  const handleStatusChange = async (applicationId: string, status: 'shortlisted' | 'accepted' | 'rejected') => {
    if (updatingId) {
      return;
    }

    setUpdatingId(applicationId);
    setActionError(null);
    const result = await updateStatus(applicationId, status);
    if (!result.success) {
      setActionError(result.error || 'Failed to update status.');
    }
    setUpdatingId(null);
  };

  const toggleSelect = (applicationId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(applicationId)) {
        next.delete(applicationId);
      } else {
        next.add(applicationId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === displayApplications.length) {
        return new Set();
      }
      return new Set(displayApplications.map((app) => app._id));
    });
  };

  const handleBulkStatus = async (status: 'shortlisted' | 'rejected') => {
    if (selectedIds.size === 0 || updatingId) {
      return;
    }

    setActionError(null);
    setUpdatingId('bulk');
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      const result = await updateStatus(id, status);
      if (!result.success) {
        setActionError(result.error || 'Failed to update some applications.');
        break;
      }
    }
    setUpdatingId(null);
    setSelectedIds(new Set());
  };

  const handleBulkMessage = async () => {
    if (bulkSending || !bulkMessage.trim() || selectedIds.size === 0) {
      return;
    }

    setBulkSending(true);
    setActionError(null);
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      const result = await sendMessage(id, bulkMessage.trim());
      if (!result.success) {
        setActionError(result.error || 'Failed to send some messages.');
        break;
      }
    }
    setBulkSending(false);
    setBulkMessage('');
    setBulkMessageOpen(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
          <Sparkles className="h-3.5 w-3.5" />
          Applications Management
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-charcoal-950 dark:text-white">Applications</h1>
        <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">
          Review new candidates, shortlist strong profiles, and move the company hiring pipeline forward with cleaner context.
        </p>
      </div>

      {(actionError || errorMessage) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError || errorMessage}
        </div>
      )}

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Projects</option>
            {projectOptions.map(([id, title]) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by applicant or project..." className="pl-9" />
          </div>
          <Button variant="outline" onClick={() => setFiltersOpen((prev) => !prev)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </CardContent>
      </Card>

      {filtersOpen && (
        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardContent className="grid gap-4 p-5 md:grid-cols-5">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-500">Trust Score</div>
              <select
                value={trustFilter}
                onChange={(event) => setTrustFilter(event.target.value as TrustFilter)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="any">Any</option>
                <option value="80">80+</option>
                <option value="90">90+</option>
              </select>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-500">Experience</div>
              <select
                value={experienceFilter}
                onChange={(event) => setExperienceFilter(event.target.value as ExperienceFilter)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="any">Any</option>
                <option value="1-2">1-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-500">Skill</div>
              <Input value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)} placeholder="React" />
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-500">Min Budget</div>
              <Input value={minBudget} onChange={(event) => setMinBudget(event.target.value)} placeholder="40000" />
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal-500">Max Budget</div>
              <Input value={maxBudget} onChange={(event) => setMaxBudget(event.target.value)} placeholder="60000" />
            </div>
            <Button
              variant="outline"
              className="md:col-span-5"
              onClick={() => {
                setTrustFilter('any');
                setExperienceFilter('any');
                setSkillFilter('');
                setMinBudget('');
                setMaxBudget('');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-5">
        {statusTabs.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-[24px] border px-4 py-4 text-left transition ${tab === value ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-card/80 text-charcoal-700 dark:border-white/10 dark:bg-charcoal-900/72 dark:text-charcoal-300'}`}
          >
            <div className="font-semibold capitalize">
              {value === 'all' ? 'All' : value === 'pending' ? 'New' : value}
            </div>
            <div className="mt-1 text-sm">{stats[value]}</div>
          </button>
        ))}
      </div>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-charcoal-600 dark:text-charcoal-300">
            <input
              type="checkbox"
              checked={displayApplications.length > 0 && selectedIds.size === displayApplications.length}
              onChange={toggleSelectAll}
            />
            <span>Select All</span>
            <span>{selectedIds.size} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleBulkStatus('shortlisted')} disabled={selectedIds.size === 0 || updatingId === 'bulk'}>
              Shortlist Selected
            </Button>
            <Button variant="outline" onClick={() => handleBulkStatus('rejected')} disabled={selectedIds.size === 0 || updatingId === 'bulk'}>
              Reject Selected
            </Button>
            <Button variant="outline" onClick={() => setBulkMessageOpen(true)} disabled={selectedIds.size === 0}>
              Message All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardHeader>
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Applications List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="rounded-[24px] bg-silver-50/70 p-6 text-sm text-charcoal-500">Loading applications...</div>}
          {!isLoading && displayApplications.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No applications match this view yet.
            </div>
          )}
          {!isLoading && displayApplications.map((application) => {
            const applicant = application.applicantId?.name || 'Candidate';
            const title = application.projectId?.title || application.jobId?.title || 'Opportunity';
            const trustScore = application.applicantId?.trustScore || 0;
            const amount = application.proposedAmount;
            const days = application.proposedDuration;
            const isNew = application.status === 'pending' && relativeLabel(application.submittedAt || application.createdAt).includes('h');
            const skills = application.applicantId?.skills || [];
            return (
              <div key={application._id} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(application._id)}
                        onChange={() => toggleSelect(application._id)}
                      />
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-sm font-semibold text-primary-800">
                        {applicant.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{applicant}</h3>
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                          {isNew && <span className="mr-2 rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700">NEW</span>}
                          Applied for: {title}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                      <div>Trust Score: {trustScore}%</div>
                      <div>Experience: {getExperienceYears(application)} years</div>
                      <div>Status: {application.status || 'pending'}</div>
                      <div>Proposed: {formatCurrency(amount)}</div>
                      <div>Timeline: {days ? `${days} days` : 'N/A'}</div>
                      <div>{relativeLabel(application.submittedAt || application.createdAt)}</div>
                    </div>
                    {skills.length > 0 && (
                      <div className="text-xs text-charcoal-600 dark:text-charcoal-300">
                        Skills: {skills.map((skill) => skill.name).filter(Boolean).join(', ')}
                      </div>
                    )}
                    {application.coverLetter && (
                      <div className="text-sm text-charcoal-700 dark:text-charcoal-300">
                        {application.coverLetter.slice(0, 140)}{application.coverLetter.length > 140 ? '...' : ''}
                      </div>
                    )}
                    {application.attachments && application.attachments.length > 0 && (
                      <div className="text-xs text-charcoal-500 dark:text-charcoal-400">
                        Attachments: {application.attachments.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 lg:w-[240px] lg:flex-col">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/company/applications/${application._id}`}>
                        View Full Application
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(application._id, 'shortlisted')}
                      disabled={updatingId === application._id || application.status === 'shortlisted'}
                    >
                      {updatingId === application._id ? 'Updating...' : 'Shortlist'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(application._id, 'accepted')}
                      disabled={updatingId === application._id || application.status === 'accepted'}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(application._id, 'rejected')}
                      disabled={updatingId === application._id || application.status === 'rejected'}
                    >
                      <UserRoundX className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/messages">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={bulkMessageOpen} onOpenChange={setBulkMessageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message Selected Candidates</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={5}
            value={bulkMessage}
            onChange={(event) => setBulkMessage(event.target.value)}
            placeholder="Write a message to all selected candidates..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkMessageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkMessage} disabled={bulkSending || !bulkMessage.trim()}>
              {bulkSending ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
