'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, Filter, MessageSquare, PenSquare, Search, Star, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProjects } from '@/hooks/useProjects';
import { useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type ProjectStatus = 'active' | 'in_progress' | 'completed' | 'draft';

type ProjectItem = {
  _id: string;
  title: string;
  status: string;
  budget?: { min?: number; max?: number };
  duration?: number;
  applicationsCount?: number;
  createdAt?: string;
  selectedApplicant?: string;
  milestones?: Array<{ status?: string }>;
};

function statusLabel(status: ProjectStatus) { if (status === 'active') return 'Active'; if (status === 'in_progress') return 'In Progress'; if (status === 'completed') return 'Completed'; return 'Draft'; }
function normalizeStatus(status?: string): ProjectStatus { if (status === 'open' || status === 'active') return 'active'; if (status === 'in_progress') return 'in_progress'; if (status === 'completed') return 'completed'; if (status === 'draft') return 'draft'; return 'draft'; }
function formatCurrency(value?: number) { if (!value) return 'Negotiable'; return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value); }
function formatRelativeDate(value?: string) { if (!value) return 'Recently'; const hours = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60))); if (hours < 24) return `${hours}h ago`; return `${Math.round(hours / 24)}d ago`; }
function getStatusBadge(status: ProjectStatus) { const styles: Record<ProjectStatus, string> = { active: 'bg-green-100 text-green-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-purple-100 text-purple-700', draft: 'bg-yellow-100 text-yellow-700' }; return styles[status] || 'bg-gray-100 text-gray-700'; }

export default function MyProjectsPage() {
  const { user } = useAuth();
  const { projects = [], isLoading, errorMessage } = useUserProjects(user?.id, { role: 'company' });
  const { applications = [] } = useApplications({ role: 'company', type: 'project', limit: 200 });
  const [tab, setTab] = useState<ProjectStatus>('active');
  const [query, setQuery] = useState('');

  const typedProjects: ProjectItem[] = useMemo(() => projects.map((project) => ({
    _id: project._id, title: project.title || 'Untitled', status: project.status || 'open',
    budget: project.budget, duration: project.duration, applicationsCount: project.applicationsCount,
    createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : undefined,
    selectedApplicant: project.selectedApplicant, milestones: project.milestones,
  })), [projects]);

  const applicationByProject = useMemo(() => { const map = new Map<string, typeof applications>(); applications.forEach((app) => { const pid = app.projectId?._id || app.projectId; if (!pid) return; if (!map.has(pid)) map.set(pid, []); map.get(pid)?.push(app); }); return map; }, [applications]);

  const filteredProjects = useMemo(() => typedProjects.filter((project) => {
    const s = normalizeStatus(project.status); return project.title.toLowerCase().includes(query.toLowerCase()) && s === tab;
  }), [query, tab, typedProjects]);

  const completedProjects = typedProjects.filter((p) => normalizeStatus(p.status) === 'completed').slice(0, 3);
  const draftProjects = typedProjects.filter((p) => normalizeStatus(p.status) === 'draft').slice(0, 3);

  const counts = { active: typedProjects.filter((p) => normalizeStatus(p.status) === 'active').length, in_progress: typedProjects.filter((p) => normalizeStatus(p.status) === 'in_progress').length, completed: typedProjects.filter((p) => normalizeStatus(p.status) === 'completed').length, draft: typedProjects.filter((p) => normalizeStatus(p.status) === 'draft').length };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><h1 className="text-3xl font-semibold">My Projects</h1><p className="mt-2 text-sm text-gray-500">Manage active projects, opportunities, completed work, and drafts.</p></div>
        <Button asChild><Link href="/dashboard/company/post-project"><PenSquare className="mr-2 h-4 w-4" />Post New Project</Link></Button>
      </div>
      {errorMessage && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>}
      {isLoading && <div className="rounded-2xl bg-gray-50 p-6 text-sm text-center">Loading projects...</div>}
      {!isLoading && (
        <>
          <Card className="border-none bg-card/80"><CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects..." className="pl-9" /></div><Button variant="outline" disabled><Filter className="mr-2 h-4 w-4" />Filter</Button></CardContent></Card>
          <div className="grid gap-3 md:grid-cols-4">{[['active', `Active (${counts.active})`], ['in_progress', `In Progress (${counts.in_progress})`], ['completed', `Completed (${counts.completed})`], ['draft', `Drafts (${counts.draft})`]].map(([value, label]) => (<button key={value} type="button" onClick={() => setTab(value as ProjectStatus)} className={`rounded-2xl border px-4 py-4 text-left transition ${tab === value ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-gray-100 bg-card/80'}`}><div className="font-semibold">{label}</div></button>))}</div>
          <Card className="border-none bg-card/80 shadow-lg"><CardHeader><CardTitle className="text-xl">{statusLabel(tab)} Projects</CardTitle></CardHeader><CardContent className="space-y-4">
            {filteredProjects.map((project) => {
              const ps = normalizeStatus(project.status); const budgetValue = project.budget?.max || project.budget?.min;
              const apps = applicationByProject.get(project._id) || [];
              const accepted = apps.find((a) => a.status === 'accepted');
              const best = [...apps].sort((a, b) => (b.applicantId?.trustScore || 0) - (a.applicantId?.trustScore || 0))[0];
              const name = accepted?.applicantId?.name || best?.applicantId?.name || 'Not assigned yet';
              const trust = accepted?.applicantId?.trustScore || best?.applicantId?.trustScore || 0;
              const hired = Boolean(accepted || project.selectedApplicant);
              const total = project.milestones?.length || 0;
              const done = project.milestones?.filter((m) => m.status === 'completed' || m.status === 'approved').length || 0;
              const progress = total > 0 ? Math.round((done / total) * 100) : ps === 'completed' ? 100 : 0;
              return (
                <div key={project._id} className="rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2"><h3 className="text-lg font-semibold">{project.title}</h3><Badge className={getStatusBadge(ps)}>{statusLabel(ps)}</Badge></div>
                      <p className="text-sm text-gray-500">Status: {statusLabel(ps)} • Applications: {project.applicationsCount || 0} • Hired: {hired ? 'Yes' : 'No'}</p>
                      <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2"><div>{hired ? `Candidate: ${name} (Trust: ${trust}%)` : `Best Match: ${name}`}</div><div>Budget: {formatCurrency(budgetValue)}</div><div>Duration: {project.duration || 0} days</div><div>Posted: {formatRelativeDate(project.createdAt)}</div></div>
                      {ps !== 'draft' && (<div><div className="mb-2 flex items-center justify-between text-sm text-gray-500"><span>Progress</span><span>{progress}%</span></div><div className="h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-primary-600" style={{ width: `${progress}%` }} /></div></div>)}
                    </div>
                    <div className="flex flex-wrap gap-2 lg:w-[220px] lg:flex-col">
                      <Button asChild size="sm"><Link href={`/dashboard/company/my-projects/${project._id}`}>View Details</Link></Button>
                      {ps === 'active' && <Button asChild size="sm" variant="outline"><Link href={`/dashboard/company/my-projects/${project._id}/applications`}><Users className="mr-1 h-4 w-4" />Review Applications</Link></Button>}
                      {ps === 'in_progress' && <Button asChild size="sm" variant="outline"><Link href="/dashboard/messages"><MessageSquare className="mr-1 h-4 w-4" />Message</Link></Button>}
                      <Button asChild size="sm" variant="outline"><Link href={`/dashboard/company/my-projects/${project._id}/manage`}>{ps === 'draft' ? 'Continue Editing' : 'Manage Milestones'}</Link></Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredProjects.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">No projects match this view.</div>}
          </CardContent></Card>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-none bg-card/80"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-xl">Completed Projects</CardTitle><CheckCircle2 className="h-5 w-5 text-green-600" /></CardHeader><CardContent className="space-y-3">{completedProjects.map((project) => (<div key={project._id} className="rounded-2xl border bg-gray-50 p-4"><div className="font-semibold">{project.title}</div><div className="mt-2 text-sm text-gray-500">{formatCurrency(project.budget?.max || project.budget?.min)} • {project.duration || 0} days</div><div className="mt-3 flex items-center gap-3 text-sm"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />Ready for review</div><div className="mt-3 flex gap-2"><Button asChild size="sm" variant="outline"><Link href={`/dashboard/company/my-projects/${project._id}`}>View Details</Link></Button><Button size="sm" variant="outline"><Star className="mr-1 h-4 w-4" />Write Review</Button></div></div>))}{completedProjects.length === 0 && <div className="rounded-2xl border border-dashed p-4 text-sm text-gray-500">No completed projects yet.</div>}</CardContent></Card>
            <Card className="border-none bg-card/80"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-xl">Drafts</CardTitle><Clock3 className="h-5 w-5 text-yellow-600" /></CardHeader><CardContent className="space-y-3">{draftProjects.map((project) => (<div key={project._id} className="rounded-2xl border bg-gray-50 p-4"><div className="font-semibold">{project.title}</div><div className="mt-2 text-sm text-gray-500">Last edited {formatRelativeDate(project.createdAt)}</div><div className="mt-3 flex gap-2"><Button asChild size="sm"><Link href={`/dashboard/company/my-projects/${project._id}/manage`}>Continue Editing</Link></Button><Button size="sm" variant="outline" className="text-red-600">Delete Draft</Button></div></div>))}{draftProjects.length === 0 && <div className="rounded-2xl border border-dashed p-4 text-sm text-gray-500">No drafts right now.</div>}</CardContent></Card>
          </div>
        </>
      )}
    </div>
  );
}