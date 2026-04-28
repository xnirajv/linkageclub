'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/hooks/useProjects';

interface Milestone { title: string; amount: string; deadline: string; deliverables?: string; }

export default function ManageProjectPage() {
  const params = useParams(); const router = useRouter(); const projectId = params.id as string;
  const { project, isLoading, errorMessage, updateProject } = useProject(projectId);

  const [title, setTitle] = useState(''); const [summary, setSummary] = useState(''); const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); const [skills, setSkills] = useState<string[]>([]); const [skillInput, setSkillInput] = useState('');
  const [budgetMin, setBudgetMin] = useState(''); const [budgetMax, setBudgetMax] = useState(''); const [duration, setDuration] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [locationType, setLocationType] = useState<'remote' | 'onsite' | 'hybrid'>('remote'); const [locationLabel, setLocationLabel] = useState('');
  const [status, setStatus] = useState('open'); const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]); const [reqInput, setReqInput] = useState('');
  const [isSaving, setIsSaving] = useState(false); const [saveError, setSaveError] = useState<string | null>(null); const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    setTitle(project.title || ''); setSummary(project.summary || ''); setDescription(project.description || '');
    setCategory(project.category || ''); setSkills((project.skills || []).map((s: any) => s.name || s));
    setBudgetMin(String(project.budget?.min ?? '')); setBudgetMax(String(project.budget?.max ?? ''));
    setDuration(String(project.duration ?? '')); setExperienceLevel(project.experienceLevel || 'intermediate');
    setLocationType(project.location?.type || 'remote'); setLocationLabel(project.location?.label || '');
    setStatus(project.status || 'open'); setRequirements(project.requirements || []);
    setMilestones((project.milestones || []).map((m: any) => ({ title: m.title || '', amount: String(m.amount ?? ''), deadline: String(m.deadline ?? ''), deliverables: m.description || '' })));
  }, [project]);

  const milestoneTotal = useMemo(() => milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0), [milestones]);

  const handleSave = async () => {
    if (isSaving) return; setIsSaving(true); setSaveError(null); setSaveSuccess(null);
    try {
      const result = await updateProject({
        title: title.trim(), summary: summary.trim() || undefined, description: description.trim(), category,
        skills: skills.filter(Boolean).map((name) => ({ name, level: experienceLevel as any, mandatory: true })),
        budget: { type: (project?.budget?.type as any) || 'fixed', min: Number(budgetMin) || 0, max: Number(budgetMax) || 0, currency: 'INR' },
        duration: Number(duration) || 0, experienceLevel: experienceLevel as any,
        location: { type: locationType, label: locationType === 'remote' ? 'Remote' : locationLabel.trim() || undefined },
        status: status as any, requirements: requirements.filter(Boolean),
        milestones: milestones.filter((m) => m.title && m.amount).map((m) => ({ title: m.title, description: m.deliverables || m.title, amount: Number(m.amount), deadline: Number(m.deadline), status: 'pending' as const })),
      });
      if (result.success) { setSaveSuccess('Project updated!'); setTimeout(() => setSaveSuccess(null), 3000); }
      else setSaveError(result.error || 'Failed to save');
    } catch { setSaveError('Something went wrong'); }
    finally { setIsSaving(false); }
  };

  const handleDeleteMilestone = (index: number) => setMilestones((prev) => prev.filter((_, i) => i !== index));

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project?')) return;
    try { const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' }); if (res.ok) router.push('/dashboard/company/my-projects'); else alert('Failed to delete'); }
    catch { alert('Something went wrong'); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  if (!project) return <div className="text-center py-12"><AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" /><p className="text-gray-600">{errorMessage || 'Project not found'}</p><Button asChild variant="outline" className="mt-4"><Link href="/dashboard/company/my-projects">Back</Link></Button></div>;

  const categories = ['Web Development', 'Mobile Development', 'AI / ML', 'Data Science', 'DevOps', 'Design', 'Content Writing', 'Marketing', 'Other'];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <div><div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700"><Sparkles className="h-3.5 w-3.5" />Edit Project</div><h1 className="mt-4 text-3xl font-semibold">{title || 'Untitled'}</h1></div>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline"><Link href={`/dashboard/company/my-projects/${projectId}`}><Eye className="mr-2 h-4 w-4" />View</Link></Button>
          <Button variant="destructive" onClick={handleDeleteProject}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{isSaving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>
      {saveError && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2"><AlertCircle className="h-4 w-4" />{saveError}</div>}
      {saveSuccess && <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{saveSuccess}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Basic Information</CardTitle></CardHeader><CardContent className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Title *</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" /></div>
            <div><label className="text-sm font-medium mb-1 block">Category *</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border p-2"><option value="">Select</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="text-sm font-medium mb-1 block">Summary</label><Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary" /></div>
            <div><label className="text-sm font-medium mb-1 block">Description *</label><Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description" /></div>
            <div><label className="text-sm font-medium mb-1 block">Status</label><select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border p-2"><option value="open">Open</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Skills</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex gap-2"><Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add skill" onKeyDown={(e) => { if (e.key === 'Enter' && skillInput.trim()) { e.preventDefault(); setSkills((prev) => [...prev, skillInput.trim()]); setSkillInput(''); } }} /><Button onClick={() => { if (!skillInput.trim()) return; setSkills((prev) => [...prev, skillInput.trim()]); setSkillInput(''); }}>Add</Button></div><div className="flex flex-wrap gap-2">{skills.map((skill) => (<Badge key={skill} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}>{skill} <X className="h-3 w-3" /></Badge>))}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>Budget & Duration</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><div><label className="text-sm font-medium mb-1 block">Min Budget (₹)</label><Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Min" /></div><div><label className="text-sm font-medium mb-1 block">Max Budget (₹)</label><Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Max" /></div><div><label className="text-sm font-medium mb-1 block">Duration (days)</label><Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Days" /></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Location</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex gap-3">{(['remote', 'onsite', 'hybrid'] as const).map((type) => (<button key={type} onClick={() => setLocationType(type)} className={`rounded-xl border px-4 py-2 text-sm capitalize ${locationType === type ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-gray-200'}`}>{type}</button>))}</div>{locationType !== 'remote' && <Input value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="Location" />}</CardContent></Card>
          <Card><CardHeader><CardTitle>Requirements</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex gap-2"><Input value={reqInput} onChange={(e) => setReqInput(e.target.value)} placeholder="Add requirement" onKeyDown={(e) => { if (e.key === 'Enter' && reqInput.trim()) { e.preventDefault(); setRequirements((prev) => [...prev, reqInput.trim()]); setReqInput(''); } }} /><Button onClick={() => { if (!reqInput.trim()) return; setRequirements((prev) => [...prev, reqInput.trim()]); setReqInput(''); }}>Add</Button></div>{requirements.map((req, i) => (<div key={i} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 bg-primary-600 rounded-full" />{req}<button onClick={() => setRequirements((prev) => prev.filter((_, idx) => idx !== i))} className="ml-auto text-red-500"><X className="h-3 w-3" /></button></div>))}</CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Milestones</CardTitle><Button size="sm" variant="outline" onClick={() => setMilestones((prev) => [...prev, { title: '', amount: '', deadline: '', deliverables: '' }])}><Plus className="mr-2 h-4 w-4" />Add</Button></CardHeader><CardContent className="space-y-3">{milestones.map((m, index) => (<div key={index} className="rounded-xl border bg-gray-50 p-4 space-y-3"><div className="flex items-center justify-between"><span className="text-sm font-medium">Milestone {index + 1}</span><Button variant="ghost" size="icon" onClick={() => handleDeleteMilestone(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div><Input value={m.title} onChange={(e) => setMilestones((prev) => prev.map((item, i) => i === index ? { ...item, title: e.target.value } : item))} placeholder="Title" /><div className="grid grid-cols-2 gap-3"><Input type="number" value={m.amount} onChange={(e) => setMilestones((prev) => prev.map((item, i) => i === index ? { ...item, amount: e.target.value } : item))} placeholder="Amount (₹)" /><Input type="number" value={m.deadline} onChange={(e) => setMilestones((prev) => prev.map((item, i) => i === index ? { ...item, deadline: e.target.value } : item))} placeholder="Deadline day" /></div><Input value={m.deliverables || ''} onChange={(e) => setMilestones((prev) => prev.map((item, i) => i === index ? { ...item, deliverables: e.target.value } : item))} placeholder="Deliverables" /></div>))}{milestones.length === 0 && <p className="text-center text-gray-500 py-4 text-sm">No milestones added</p>}{milestones.length > 0 && <div className="flex justify-between text-sm pt-2 border-t"><span className="text-gray-500">Total:</span><span className="font-medium">₹{milestoneTotal.toLocaleString()}</span></div>}</CardContent></Card>
        </div>
      </div>
    </div>
  );
}