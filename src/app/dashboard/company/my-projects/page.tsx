'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, Filter, MessageSquare, PenSquare, Search, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ProjectStatus = 'active' | 'open' | 'completed' | 'draft';

interface ProjectItem {
  id: string;
  title: string;
  status: ProjectStatus;
  budget: string;
  duration: string;
  applications: number;
  hired: boolean;
  candidate?: string;
  trustScore?: number;
  progress?: number;
  posted: string;
  bestMatch?: string;
}

const projectItems: ProjectItem[] = [
  { id: 'p1', title: 'MERN E-commerce Platform', status: 'active', budget: 'Rs50,000-Rs70,000', duration: '30 days', applications: 12, hired: true, candidate: 'Riya Sharma', trustScore: 92, progress: 40, posted: '2 weeks ago' },
  { id: 'p2', title: 'Admin Dashboard', status: 'open', budget: 'Rs30,000-Rs40,000', duration: '20 days', applications: 8, hired: false, bestMatch: 'Raj Patel (88%)', posted: '5 days ago' },
  { id: 'p3', title: 'Mobile App UI Design', status: 'active', budget: 'Rs35,000-Rs50,000', duration: '25 days', applications: 15, hired: true, candidate: 'Priya Singh', trustScore: 85, progress: 60, posted: '1 week ago' },
  { id: 'p4', title: 'Portfolio Website', status: 'completed', budget: 'Rs25,000', duration: '14 days', applications: 10, hired: true, candidate: 'Ankit Sharma', trustScore: 90, progress: 100, posted: 'Completed 2 weeks ago' },
  { id: 'p5', title: 'REST API Development', status: 'completed', budget: 'Rs40,000', duration: '18 days', applications: 11, hired: true, candidate: 'Neha Gupta', trustScore: 91, progress: 100, posted: 'Completed 1 month ago' },
  { id: 'p6', title: 'AI Chatbot Integration', status: 'draft', budget: 'Rs60,000', duration: '35 days', applications: 0, hired: false, posted: 'Last edited 2 days ago' },
];

function statusLabel(status: ProjectStatus) {
  if (status === 'open') return 'Open';
  if (status === 'active') return 'Active';
  if (status === 'completed') return 'Completed';
  return 'Draft';
}

export default function MyProjectsPage() {
  const [tab, setTab] = useState<'active' | 'open' | 'completed' | 'draft'>('active');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return projectItems.filter((project) => {
      const searchMatch = project.title.toLowerCase().includes(query.toLowerCase());
      const tabMatch = project.status === tab;
      return searchMatch && tabMatch;
    });
  }, [query, tab]);

  const completedProjects = projectItems.filter((project) => project.status === 'completed').slice(0, 2);
  const draftProjects = projectItems.filter((project) => project.status === 'draft');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">My Projects</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Manage active projects, open opportunities, completed work, and drafts from one premium control surface.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/company/post-project">
            <PenSquare className="mr-2 h-4 w-4" />
            Post New Project
          </Link>
        </Button>
      </div>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects..." className="pl-9" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ['active', `Active (${projectItems.filter((project) => project.status === 'active').length})`],
          ['open', `Open (${projectItems.filter((project) => project.status === 'open').length})`],
          ['completed', `Completed (${projectItems.filter((project) => project.status === 'completed').length})`],
          ['draft', `Drafts (${projectItems.filter((project) => project.status === 'draft').length})`],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value as typeof tab)}
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
          {filtered.map((project) => (
            <div key={project.id} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{project.title}</h3>
                    <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                      Status: {statusLabel(project.status)} • Applications: {project.applications} • Hired: {project.hired ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                    <div>{project.candidate ? `Candidate: ${project.candidate} (Trust Score: ${project.trustScore}%)` : `Best Match: ${project.bestMatch || 'Not assigned yet'}`}</div>
                    <div>Budget: {project.budget}</div>
                    <div>Duration: {project.duration}</div>
                    <div>Posted: {project.posted}</div>
                  </div>
                  {typeof project.progress === 'number' && (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-charcoal-500 dark:text-charcoal-400">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-primary-100 dark:bg-charcoal-800">
                        <div className="h-2 rounded-full bg-gradient-to-r from-secondary-500 via-info-500 to-primary-700" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 lg:w-[220px] lg:flex-col">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/company/my-projects/${project.id}`}>View Details</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={project.status === 'open' ? '/dashboard/company/applications' : '/dashboard/messages'}>
                      {project.status === 'open' ? 'Review Applications' : 'Message Candidate'}
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={project.status === 'draft' ? '/dashboard/company/post-project' : `/dashboard/company/my-projects/${project.id}/manage`}>
                      {project.status === 'draft' ? 'Continue Editing' : 'Manage Project'}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
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
              <div key={project.id} className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
                <div className="font-semibold text-charcoal-950">{project.title}</div>
                <div className="mt-2 text-sm text-charcoal-500">{project.candidate} • {project.budget}</div>
                <div className="mt-3 flex items-center gap-3 text-sm text-charcoal-700">
                  <Star className="h-4 w-4 text-secondary-600" />
                  Rating ready
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Drafts</CardTitle>
            <Clock3 className="h-5 w-5 text-info-700" />
          </CardHeader>
          <CardContent className="space-y-3">
            {draftProjects.map((project) => (
              <div key={project.id} className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
                <div className="font-semibold text-charcoal-950">{project.title}</div>
                <div className="mt-2 text-sm text-charcoal-500">{project.posted}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href="/dashboard/company/post-project">Continue Editing</Link>
                  </Button>
                  <Button size="sm" variant="outline">Delete Draft</Button>
                </div>
              </div>
            ))}
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
