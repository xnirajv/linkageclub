'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Sparkles, Plus, Trash2, Loader2,
  AlertCircle, CheckCircle2, Eye, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/hooks/useProjects';
import { toast } from 'sonner';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'AI / ML', 'Data Science',
  'DevOps', 'Design', 'Content Writing', 'Marketing', 'Other',
];

export default function ManageProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, isLoading, updateProject } = useProject(projectId);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [duration, setDuration] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [locationType, setLocationType] = useState<'remote' | 'onsite' | 'hybrid'>('remote');
  const [locationLabel, setLocationLabel] = useState('');
  const [status, setStatus] = useState('open');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [reqInput, setReqInput] = useState('');

  useEffect(() => {
    if (!project) return;
    setTitle(project.title || '');
    setSummary(project.summary || '');
    setDescription(project.description || '');
    setCategory(project.category || '');
    setSkills((project.skills || []).map((s: any) => s.name || s));
    setBudgetMin(String(project.budget?.min ?? ''));
    setBudgetMax(String(project.budget?.max ?? ''));
    setDuration(String(project.duration ?? ''));
    setExperienceLevel(project.experienceLevel || 'intermediate');
    setLocationType(project.location?.type || 'remote');
    setLocationLabel(project.location?.label || '');
    setStatus(project.status || 'open');
    setRequirements(project.requirements || []);
    setMilestones((project.milestones || []).map((m: any) => ({
      id: m._id || Date.now().toString(),
      title: m.title || '',
      amount: m.amount || 0,
      deadline: m.deadline || 0,
      deliverables: m.description || '',
      status: m.status || 'pending',
    })));
  }, [project]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProject({
        title: title.trim(),
        summary: summary.trim() || undefined,
        description: description.trim(),
        category,
        skills: skills.filter(Boolean).map((name) => ({
          name,
          level: experienceLevel as any,
          mandatory: true,
        })),
        budget: {
          type: (project?.budget?.type as any) || 'fixed',
          min: Number(budgetMin) || 0,
          max: Number(budgetMax) || 0,
          currency: 'INR',
        },
        duration: Number(duration) || 0,
        experienceLevel: experienceLevel as any,
        location: {
          type: locationType,
          label: locationType === 'remote' ? undefined : locationLabel.trim(),
        },
        status: status as any,
        requirements: requirements.filter(Boolean),
        milestones: milestones
          .filter((m) => m.title)
          .map((m) => ({
            title: m.title,
            description: m.deliverables || m.title,
            amount: m.amount,
            deadline: m.deadline,
            status: m.status,
          })),
      });

      if (result.success) {
        setSuccess('Project updated successfully!');
        toast.success('Project updated!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to save');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { id: Date.now().toString(), title: '', amount: 0, deadline: 0, deliverables: '', status: 'pending' },
    ]);
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, field: string, value: any) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Project deleted');
        router.push('/dashboard/company/my-projects');
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600">Project not found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/company/my-projects">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-3 py-1 text-xs font-medium text-gray-500">
              <Sparkles className="h-3 w-3" />Edit Project
            </div>
            <h1 className="mt-3 text-2xl font-bold">{title || 'Untitled'}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/company/my-projects/${projectId}`}><Eye className="h-4 w-4 mr-1" />View</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteProject}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}
      {success && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{success}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-sm font-medium mb-1 block">Title *</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className="rounded-xl" /></div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-sm bg-white">
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Summary</label><Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary" className="rounded-xl" /></div>
              <div><label className="text-sm font-medium mb-1 block">Description *</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description" rows={6} className="rounded-xl" /></div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm bg-white">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg">Skills</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add skill" className="rounded-xl" onKeyDown={(e) => { if (e.key === 'Enter' && skillInput.trim()) { e.preventDefault(); setSkills([...skills, skillInput.trim()]); setSkillInput(''); } }} />
                <Button variant="outline" size="sm" onClick={() => { if (skillInput.trim()) { setSkills([...skills, skillInput.trim()]); setSkillInput(''); } }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">{skills.map((s) => (<Badge key={s} variant="secondary" className="cursor-pointer gap-1" onClick={() => setSkills(skills.filter((x) => x !== s))}>{s} <X className="h-3 w-3" /></Badge>))}</div>
            </CardContent>
          </Card>

          {/* Budget & Duration */}
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg">Budget & Duration</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div><label className="text-sm font-medium mb-1 block">Min Budget (₹)</label><Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Min" className="rounded-xl" /></div>
              <div><label className="text-sm font-medium mb-1 block">Max Budget (₹)</label><Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Max" className="rounded-xl" /></div>
              <div><label className="text-sm font-medium mb-1 block">Duration (days)</label><Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Days" className="rounded-xl" /></div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg">Location</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                {(['remote', 'onsite', 'hybrid'] as const).map((type) => (
                  <button key={type} onClick={() => setLocationType(type)} className={`flex-1 p-3 rounded-xl border text-sm capitalize transition-all ${locationType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>{type}</button>
                ))}
              </div>
              {locationType !== 'remote' && <Input value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="Location" className="rounded-xl" />}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-lg">Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={reqInput} onChange={(e) => setReqInput(e.target.value)} placeholder="Add requirement" className="rounded-xl" onKeyDown={(e) => { if (e.key === 'Enter' && reqInput.trim()) { e.preventDefault(); setRequirements([...requirements, reqInput.trim()]); setReqInput(''); } }} />
                <Button variant="outline" size="sm" onClick={() => { if (reqInput.trim()) { setRequirements([...requirements, reqInput.trim()]); setReqInput(''); } }}>Add</Button>
              </div>
              {requirements.map((r, i) => (<div key={i} className="flex items-center gap-2 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />{r}<button onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="ml-auto text-red-500"><X className="h-3 w-3" /></button></div>))}
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <div>
          <Card className="border shadow-sm sticky top-24">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Milestones</CardTitle>
              <Button size="sm" variant="outline" onClick={addMilestone}><Plus className="h-4 w-4 mr-1" />Add</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.map((m, idx) => (
                <div key={m.id} className="p-4 rounded-xl border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Milestone {idx + 1}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeMilestone(m.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                  <Input value={m.title} onChange={(e) => updateMilestone(m.id, 'title', e.target.value)} placeholder="Title" className="rounded-xl" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" value={m.amount || ''} onChange={(e) => updateMilestone(m.id, 'amount', Number(e.target.value))} placeholder="Amount ₹" className="rounded-xl" />
                    <Input type="number" value={m.deadline || ''} onChange={(e) => updateMilestone(m.id, 'deadline', Number(e.target.value))} placeholder="Deadline day" className="rounded-xl" />
                  </div>
                  <Input value={m.deliverables || ''} onChange={(e) => updateMilestone(m.id, 'deliverables', e.target.value)} placeholder="Deliverables" className="rounded-xl" />
                </div>
              ))}
              {milestones.length === 0 && <p className="text-center text-gray-500 py-8 text-sm">No milestones added yet</p>}
              {milestones.length > 0 && (
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-500">Total:</span>
                  <span className="font-medium">₹{milestones.reduce((s, m) => s + (m.amount || 0), 0).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}