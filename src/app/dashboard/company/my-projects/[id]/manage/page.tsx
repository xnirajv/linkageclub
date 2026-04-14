'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { useProject } from '@/hooks/useProjects';

interface Milestone {
  title: string;
  amount: string;
  deadline: string;
}

export default function ManageProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, isLoading, errorMessage, updateProject } = useProject(projectId);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [duration, setDuration] = useState('');
  const [locationType, setLocationType] = useState<'remote' | 'onsite' | 'hybrid'>('remote');
  const [locationLabel, setLocationLabel] = useState('');
  const [featured, setFeatured] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentInput, setAttachmentInput] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    setTitle(project.title || '');
    setSummary(project.summary || '');
    setDescription(project.description || '');
    setSkills((project.skills || []).map((skill) => skill.name));
    setBudgetMin(String(project.budget?.min ?? ''));
    setBudgetMax(String(project.budget?.max ?? ''));
    setDuration(String(project.duration ?? ''));
    setLocationType(project.location?.type || 'remote');
    setLocationLabel(project.location?.label || '');
    setFeatured(Boolean(project.isFeatured));
    setAttachments(project.attachments || []);
    setMilestones(
      (project.milestones || []).map((milestone) => ({
        title: milestone.title || '',
        amount: String(milestone.amount ?? ''),
        deadline: String(milestone.deadline ?? ''),
      }))
    );
  }, [project]);

  const canSave = useMemo(() => {
    return Boolean(title.trim() && description.trim() && budgetMin && budgetMax && duration);
  }, [title, description, budgetMin, budgetMax, duration]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const result = await updateProject({
      title: title.trim(),
      summary: summary.trim() || undefined,
      description: description.trim(),
      requirements: project?.requirements || [],
      skills: skills
        .filter(Boolean)
        .map((name) => ({ name, level: 'intermediate', mandatory: true })),
      budget: {
        type: project?.budget?.type || 'fixed',
        min: Number(budgetMin),
        max: Number(budgetMax),
        currency: project?.budget?.currency || 'INR',
      },
      duration: Number(duration),
      location: {
        type: locationType,
        label: locationType === 'remote' ? 'Remote' : locationLabel.trim() || undefined,
      },
      attachments,
      isFeatured: featured,
      milestones: milestones
        .filter((milestone) => milestone.title && milestone.amount && milestone.deadline)
        .map((milestone) => ({
          title: milestone.title,
          description: milestone.title,
          amount: Number(milestone.amount),
          deadline: Number(milestone.deadline),
          status: 'pending',
        })),
    });

    if (!result.success) {
      setSaveError(result.error || 'Failed to save changes.');
    } else {
      setSaveSuccess('Project updated successfully.');
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
              <Sparkles className="h-3.5 w-3.5" />
              Manage Project
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-charcoal-950 dark:text-white">Refine Project Details</h1>
            <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Update project positioning, budget clarity, required skills, and milestone structure from the premium company workspace.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!canSave || isSaving || isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      {saveError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {saveSuccess}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Project Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" />
              <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" />
              <Textarea rows={7} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project description" />
              <div className="grid gap-4 md:grid-cols-2">
                <select value={locationType} onChange={(e) => setLocationType(e.target.value as 'remote' | 'onsite' | 'hybrid')} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                {locationType === 'remote' ? (
                  <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">Remote project</div>
                ) : (
                  <Input value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)} placeholder="Location label" />
                )}
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-primary-100/70 bg-silver-50/70 px-4 py-3 text-sm text-charcoal-700 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-300">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                Feature this project in listings
              </label>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Skills & Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add skill" />
                <Button onClick={() => {
                  if (!skillInput.trim()) return;
                  setSkills((prev) => [...prev, skillInput.trim()]);
                  setSkillInput('');
                }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSkills((prev) => prev.filter((item) => item !== skill))}
                    className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800"
                  >
                    {skill} x
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Budget & Duration</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Minimum budget" />
              <Input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Maximum budget" />
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (days)" />
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Attachments</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input value={attachmentInput} onChange={(e) => setAttachmentInput(e.target.value)} placeholder="Add attachment name" />
                <Button onClick={() => {
                  if (!attachmentInput.trim()) return;
                  setAttachments((prev) => [...prev, attachmentInput.trim()]);
                  setAttachmentInput('');
                }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <button
                    key={attachment}
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((item) => item !== attachment))}
                    className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800"
                  >
                    {attachment} x
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-charcoal-950 dark:text-white">Milestones</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setMilestones((prev) => [...prev, { title: '', amount: '', deadline: '' }])}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.map((milestone, index) => (
                <div key={`${milestone.title}-${index}`} className="space-y-3 rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                  <Input value={milestone.title} onChange={(e) => setMilestones((prev) => prev.map((item, i) => i === index ? { ...item, title: e.target.value } : item))} placeholder="Milestone title" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input value={milestone.amount} onChange={(e) => setMilestones((prev) => prev.map((item, i) => i === index ? { ...item, amount: e.target.value } : item))} placeholder="Amount" />
                    <Input value={milestone.deadline} onChange={(e) => setMilestones((prev) => prev.map((item, i) => i === index ? { ...item, deadline: e.target.value } : item))} placeholder="Deadline day" />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setMilestones((prev) => prev.filter((_, i) => i !== index))}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
            <CardContent className="p-6">
              <div className="text-xl font-semibold">This project management page now matches the premium company dashboard language.</div>
              <div className="mt-3 text-sm leading-7 text-white/82">Project editing, budget updates, skills, and milestones now live in one cleaner control surface.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
