'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock3,
  Filter,
  MessageSquare,
  PenSquare,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ProjectStatus = 'active' | 'open' | 'completed' | 'draft';

type ProjectItem = {
  _id: string;
  title: string;
  status: string;
  budget?: { min?: number; max?: number };
  duration?: number;
  applicationsCount?: number;
  createdAt?: string;
  selectedApplicant?: string;
};

function statusLabel(status: ProjectStatus) {
  if (status === 'open') return 'Open';
  if (status === 'active') return 'Active';
  if (status === 'completed') return 'Completed';
  return 'Draft';
}

function normalizeStatus(status?: string): ProjectStatus {
  if (status === 'in_progress' || status === 'active') {
    return 'active';
  }

  if (status === 'completed') {
    return 'completed';
  }

  if (status === 'draft') {
    return 'draft';
  }

  return 'open';
}

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

function formatRelativeDate(value?: string) {
  if (!value) {
    return 'Recently';
  }

  const diffHours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60)));
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.round(diffHours / 24)}d ago`;
}

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { projects = [], isLoading, errorMessage } = useUserProjects(user?.id, { role: 'company' });
  const [tab, setTab] = useState<ProjectStatus>('active');
  const [query, setQuery] = useState('');

  const typedProjects = projects as ProjectItem[];
  const filteredProjects = useMemo(() => {
    return typedProjects.filter((project) => {
      const projectStatus = normalizeStatus(project.status);
      const searchMatch = project.title.toLowerCase().includes(query.toLowerCase());
      return searchMatch && projectStatus === tab;
    });
  }, [query, tab, typedProjects]);

  const completedProjects = typedProjects.filter((project) => normalizeStatus(project.status) === 'completed').slice(0, 2);
  const draftProjects = typedProjects.filter((project) => normalizeStatus(project.status) === 'draft').slice(0, 2);

  const counts = {
    active: typedProjects.filter((project) => normalizeStatus(project.status) === 'active').length,
    open: typedProjects.filter((project) => normalizeStatus(project.status) === 'open').length,
    completed: typedProjects.filter((project) => normalizeStatus(project.status) === 'completed').length,
    draft: typedProjects.filter((project) => normalizeStatus(project.status) === 'draft').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">My Projects</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">
            Manage active projects, open opportunities, completed work, and drafts from one premium control surface.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/company/post-project">
            <PenSquare className="mr-2 h-4 w-4" />
            Post New Project
          </Link>
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects..." className="pl-9" />
          </div>
          <Button variant="outline" disabled>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ['active', `Active (${counts.active})`],
          ['open', `Open (${counts.open})`],
          ['completed', `Completed (${counts.completed})`],
          ['draft', `Drafts (${counts.draft})`],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value as ProjectStatus)}
            className={`rounded-[24px] border px-4 py-4 text-left transition ${tab === value ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-card/80 text-charcoal-700 dark:border-white/10 dark:bg-charcoal-900/72 dark:text-charcoal-300'}`}
          >
            <div className="font-semibold">{label}</div>
          </button>
        ))}
      </div>

      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardHeader>
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">{statusLabel(tab)} Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="rounded-[24px] bg-silver-50/70 p-6 text-sm text-charcoal-500">
              Loading projects...
            </div>
          )}
          {!isLoading && filteredProjects.map((project) => {
            const projectStatus = normalizeStatus(project.status);
            const budgetValue = project.budget?.max || project.budget?.min;
            return (
              <div key={project._id} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{project.title}</h3>
                      <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                        Status: {statusLabel(projectStatus)} - Applications: {project.applicationsCount || 0} - Posted: {formatRelativeDate(project.createdAt)}
                      </p>
                    </div>
                    <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                      <div>Budget: {formatCurrency(budgetValue)}</div>
                      <div>Duration: {project.duration || 0} days</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:w-[220px] lg:flex-col">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/company/my-projects/${project._id}`}>View Details</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={projectStatus === 'open' ? `/dashboard/company/my-projects/${project._id}/applications` : '/dashboard/messages'}>
                        {projectStatus === 'open' ? 'Review Applications' : 'Message Candidate'}
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/company/my-projects/${project._id}/manage`}>
                        {projectStatus === 'draft' ? 'Continue Editing' : 'Manage Project'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {!isLoading && filteredProjects.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No projects match this view yet.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Completed Projects</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-primary-700" />
          </CardHeader>
          <CardContent className="space-y-3">
            {completedProjects.map((project) => (
              <div key={project._id} className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
                <div className="font-semibold text-charcoal-950">{project.title}</div>
                <div className="mt-2 text-sm text-charcoal-500">{formatCurrency(project.budget?.max || project.budget?.min)} - {project.duration || 0} days</div>
                <div className="mt-3 flex items-center gap-3 text-sm text-charcoal-700">
                  <Star className="h-4 w-4 text-secondary-600" />
                  Ready for review
                </div>
              </div>
            ))}
            {completedProjects.length === 0 && (
              <div className="rounded-[22px] border border-dashed border-primary-200 bg-silver-50/70 p-4 text-sm text-charcoal-500">
                No completed projects yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Drafts</CardTitle>
            <Clock3 className="h-5 w-5 text-info-700" />
          </CardHeader>
          <CardContent className="space-y-3">
            {draftProjects.map((project) => (
              <div key={project._id} className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
                <div className="font-semibold text-charcoal-950">{project.title}</div>
                <div className="mt-2 text-sm text-charcoal-500">{formatRelativeDate(project.createdAt)}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/company/my-projects/${project._id}/manage`}>Continue Editing</Link>
                  </Button>
                </div>
              </div>
            ))}
            {draftProjects.length === 0 && (
              <div className="rounded-[22px] border border-dashed border-primary-200 bg-silver-50/70 p-4 text-sm text-charcoal-500">
                No drafts right now.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xl font-semibold">Project management, candidate review, and communication are now grouped for company flow.</div>
            <div className="mt-2 text-sm text-white/80">Use the project cards above to move into applications, milestones, and candidate coordination.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-card text-charcoal-950 hover:bg-card/92">
              <Link href="/dashboard/company/applications">
                <Users className="mr-2 h-4 w-4" />
                Review Applications
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
              <Link href="/dashboard/messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Open Messages
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
