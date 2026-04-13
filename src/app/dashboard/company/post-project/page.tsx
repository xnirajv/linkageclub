'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, Paperclip, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/hooks/useProjects';
import { Textarea } from '@/components/forms/Textarea';
import { SimpleTagInput } from '@/components/forms/TagInput';

type Step = 1 | 2 | 3 | 4;
type Visibility = 'public' | 'private' | 'invite';
type LocationPreference = 'remote' | 'onsite' | 'hybrid';

interface Milestone {
  title: string;
  amount: number;
  deadline: number;
}

interface FormState {
  title: string;
  category: string;
  description: string;
  summary: string;
  skills: string[];
  experienceLevel: string;
  requirements: string[];
  locationPreference: LocationPreference;
  locationText: string;
  budgetType: string;
  budgetMin: string;
  budgetMax: string;
  duration: string;
  milestones: Milestone[];
  visibility: Visibility;
  featured: boolean;
  attachments: string[];
  confirmTerms: boolean;
}

const categories = [
  'Web Development',
  'Mobile Development',
  'AI / ML',
  'Data Science',
  'DevOps',
  'Design',
  'Content Writing',
  'Marketing',
  'Other',
];
const skillSuggestions = ['React', 'Node.js', 'MongoDB', 'Next.js', 'AWS', 'Figma', 'Python', 'TypeScript'];

const initialState: FormState = {
  title: '',
  category: '',
  description: '',
  summary: '',
  skills: ['React.js', 'Node.js'],
  experienceLevel: 'intermediate',
  requirements: ['Portfolio required', 'GitHub profile required'],
  locationPreference: 'remote',
  locationText: '',
  budgetType: 'fixed',
  budgetMin: '50000',
  budgetMax: '70000',
  duration: '30',
  milestones: [
    { title: 'UI Development', amount: 15000, deadline: 5 },
    { title: 'Backend API', amount: 20000, deadline: 15 },
  ],
  visibility: 'public',
  featured: false,
  attachments: ['Project-Brief.pdf', 'Requirements.docx'],
  confirmTerms: true,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

export default function PostProjectPage() {
  const router = useRouter();
  const { createProject } = useProjects();
  const [step, setStep] = useState<Step>(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [attachmentInput, setAttachmentInput] = useState('');
  const [form, setForm] = useState<FormState>(initialState);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedDraft = window.localStorage.getItem('company-project-draft');
    if (!savedDraft) {
      return;
    }

    try {
      const parsed = JSON.parse(savedDraft) as FormState;
      setForm((prev) => ({ ...prev, ...parsed }));
      setSubmitSuccess('Saved draft restored.');
    } catch {
      window.localStorage.removeItem('company-project-draft');
    }
  }, []);

  const milestoneTotal = useMemo(() => form.milestones.reduce((sum, item) => sum + item.amount, 0), [form.milestones]);
  const canPublish = useMemo(() => {
    return Boolean(
      form.confirmTerms &&
      form.title.trim() &&
      form.description.trim().length >= 50 &&
      form.category &&
      form.budgetMin &&
      form.budgetMax &&
      form.duration
    );
  }, [form]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateRequirement(index: number, value: string) {
    setForm((prev) => ({ ...prev, requirements: prev.requirements.map((item, i) => (i === index ? value : item)) }));
  }

  function addRequirement() {
    setForm((prev) => ({ ...prev, requirements: [...prev.requirements, ''] }));
  }

  function removeRequirement(index: number) {
    setForm((prev) => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }));
  }

  function updateMilestone(index: number, key: keyof Milestone, value: string | number) {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
  }

  function addMilestone() {
    setForm((prev) => ({ ...prev, milestones: [...prev.milestones, { title: '', amount: 0, deadline: 0 }] }));
  }

  function removeMilestone(index: number) {
    setForm((prev) => ({ ...prev, milestones: prev.milestones.filter((_, i) => i !== index) }));
  }

  function saveDraft() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company-project-draft', JSON.stringify(form));
      setSubmitError(null);
      setSubmitSuccess('Draft saved locally.');
    }
  }

  async function publishProject() {
    if (isSubmitting) {
      return;
    }
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);
  try {
      const visibilityValue = form.visibility === 'invite' ? 'private' : form.visibility;
      const result = await createProject({
      title: form.title,
      description: form.description,
      category: form.category,
      skills: form.skills.filter(Boolean).map((name) => ({ 
        name, 
        level: form.experienceLevel, 
        mandatory: true 
      })),
      budget: {
        type: form.budgetType,
        min: parseInt(form.budgetMin, 10) || 0,
        max: parseInt(form.budgetMax, 10) || 0,
        currency: 'INR',
      },
      duration: parseInt(form.duration, 10) || 0,
      requirements: form.requirements.filter(Boolean),
      experienceLevel: form.experienceLevel,
        visibility: visibilityValue,
      milestones: form.milestones.filter((item) => item.title && item.amount > 0).map((item) => ({
        title: item.title,
        description: item.title,
        amount: item.amount,
        deadline: item.deadline,
      })),
    });

    if (result.success) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('company-project-draft');
      }
      setSubmitSuccess('Project published successfully.');
      router.push('/dashboard/company/my-projects');
    } else {
      setSubmitError(result.error || 'Failed to publish project.');
    }
  } catch (error) {
    console.error(error);
    setSubmitError('Failed to publish project.');
  } finally {
    setIsSubmitting(false);
  }
}

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            Company Project Flow
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-charcoal-950 dark:text-white">Post New Project</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">A premium 4-step publishing flow for stronger hiring outcomes.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {(submitError || submitSuccess) && (
        <div className={`rounded-2xl border p-4 text-sm ${submitError ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {submitError || submitSuccess}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {['Basic Information', 'Skills & Requirements', 'Budget & Timeline', 'Visibility & Attachments'].map((label, index) => {
          const current = (index + 1) as Step;
          const active = step === current;
          const done = step > current;
          return (
            <Card key={label} className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${done ? 'bg-primary-700 text-white' : active ? 'bg-info-600 text-white' : 'bg-silver-100 text-charcoal-600'}`}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : current}
                </div>
                <div className="text-sm font-medium text-charcoal-900 dark:text-white">{label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Step {step} of 4</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {step === 1 && (
              <>
                <Input value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="MERN E-commerce Platform" />
                <select value={form.category} onChange={(e) => setField('category', e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <Textarea rows={7} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Describe the project scope, features, deliverables, and expectations..." />
                <div className="text-xs text-charcoal-500">Minimum 50 characters.</div>
                <Input
                  value={form.summary}
                  onChange={(e) => setField('summary', e.target.value.slice(0, 200))}
                  placeholder="Short summary for the listing card"
                />
                <div className="text-xs text-charcoal-500">{form.summary.length}/200 characters</div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={saveDraft}>Save as Draft</Button>
                  <Button onClick={() => setStep(2)}>Continue</Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <SimpleTagInput value={form.skills} onChange={(skills) => setField('skills', skills)} suggestions={skillSuggestions} placeholder="Add required skills" />
                <select value={form.experienceLevel} onChange={(e) => setField('experienceLevel', e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="any">Any</option>
                </select>
                <select value={form.locationPreference} onChange={(e) => setField('locationPreference', e.target.value as LocationPreference)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                {form.locationPreference !== 'remote' && <Input value={form.locationText} onChange={(e) => setField('locationText', e.target.value)} placeholder="Bangalore, India" />}
                <div className="space-y-3">
                  {form.requirements.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex gap-3">
                      <Input value={item} onChange={(e) => updateRequirement(index, e.target.value)} placeholder="Requirement" />
                      <Button variant="ghost" size="icon" onClick={() => removeRequirement(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => addRequirement()}>Add Requirement</Button>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={() => setStep(3)}>Continue</Button>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <button type="button" onClick={() => setField('budgetType', 'fixed')} className={`rounded-[20px] border px-4 py-3 text-sm ${form.budgetType === 'fixed' ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-silver-50/70'}`}>Fixed Price</button>
                  <button type="button" onClick={() => setField('budgetType', 'hourly')} className={`rounded-[20px] border px-4 py-3 text-sm ${form.budgetType === 'hourly' ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-silver-50/70'}`}>Hourly Rate</button>
                  <button type="button" onClick={() => setField('budgetType', 'milestone')} className={`rounded-[20px] border px-4 py-3 text-sm ${form.budgetType === 'milestone' ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-silver-50/70'}`}>Milestone-based</button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input type="number" value={form.budgetMin} onChange={(e) => setField('budgetMin', e.target.value)} placeholder="Minimum budget" />
                  <Input type="number" value={form.budgetMax} onChange={(e) => setField('budgetMax', e.target.value)} placeholder="Maximum budget" />
                </div>
                <div className="rounded-[20px] border border-primary-100/70 bg-silver-50/70 p-4 text-xs text-charcoal-600">
                  Budget Range: {formatCurrency(parseInt(form.budgetMin, 10) || 0)} - {formatCurrency(parseInt(form.budgetMax, 10) || 0)}
                </div>
                <div className="text-xs text-charcoal-500">Budget must be within the approved range and max should be greater than min.</div>
                <Input type="number" value={form.duration} onChange={(e) => setField('duration', e.target.value)} placeholder="Duration in days" />
                <div className="space-y-3">
                  {form.milestones.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="grid gap-3 rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
                      <Input value={item.title} onChange={(e) => updateMilestone(index, 'title', e.target.value)} placeholder="Milestone title" />
                      <Input type="number" value={item.amount} onChange={(e) => updateMilestone(index, 'amount', parseInt(e.target.value, 10) || 0)} placeholder="Amount" />
                      <Input type="number" value={item.deadline} onChange={(e) => updateMilestone(index, 'deadline', parseInt(e.target.value, 10) || 0)} placeholder="Deadline" />
                      <Button variant="ghost" size="icon" onClick={() => removeMilestone(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={addMilestone}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Milestone
                    </Button>
                    <div className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Total: {formatCurrency(milestoneTotal)}</div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={() => setStep(4)}>Continue</Button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="grid gap-3">
                  {[
                    ['public', 'Public listing'],
                    ['private', 'Private listing'],
                    ['invite', 'Invite only'],
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setField('visibility', value as Visibility)} className={`rounded-[20px] border px-4 py-4 text-left text-sm ${form.visibility === value ? 'border-primary-700 bg-primary-50 text-primary-800' : 'border-primary-100 bg-silver-50/70 text-charcoal-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 rounded-[20px] border border-info-200 bg-info-50/70 p-4 text-sm text-charcoal-700 dark:text-charcoal-300">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setField('featured', e.target.checked)} />
                  Feature this project for better visibility
                </label>
                <div className="space-y-3">
                  {form.attachments.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-center justify-between rounded-[20px] border border-primary-100/70 bg-silver-50/70 px-4 py-3">
                      <div className="flex items-center gap-3 text-sm text-charcoal-700">
                        <Paperclip className="h-4 w-4 text-primary-700" />
                        {item}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setField('attachments', form.attachments.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <Input value={attachmentInput} onChange={(e) => setAttachmentInput(e.target.value)} placeholder="Attachment name" />
                    <Button variant="outline" onClick={() => {
                      if (!attachmentInput.trim()) return;
                      setField('attachments', [...form.attachments, attachmentInput.trim()]);
                      setAttachmentInput('');
                    }}>Add</Button>
                  </div>
                  <div className="text-xs text-charcoal-500">Maximum 10 files, 50MB total.</div>
                </div>
                <label className="flex items-center gap-3 rounded-[20px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700 dark:text-charcoal-300">
                  <input type="checkbox" checked={form.confirmTerms} onChange={(e) => setField('confirmTerms', e.target.checked)} />
                  I confirm this is a genuine project and I agree to InternHub terms.
                </label>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button onClick={publishProject} disabled={isSubmitting || !canPublish}>
                      {isSubmitting ? 'Publishing...' : 'Publish Project'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Listing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
              <div className="font-semibold text-charcoal-950">{form.title || 'Untitled project'}</div>
              <div className="mt-2 text-sm text-charcoal-500">{form.category || 'No category selected'}</div>
              <div className="mt-3 text-sm text-charcoal-700">{form.summary || 'Short summary will appear here.'}</div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700">
                Budget: {formatCurrency(parseInt(form.budgetMin, 10) || 0)} - {formatCurrency(parseInt(form.budgetMax, 10) || 0)}
              </div>
              <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700">
                Duration: {form.duration || 0} days
              </div>
            </div>
            <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
              <div className="mb-2 text-sm font-medium text-charcoal-900">Skills</div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">{skill}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{form.title || 'Project Preview'}</DialogTitle>
            <DialogDescription>This is how candidates will see the project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-5">
            <div className="text-sm text-charcoal-500">Budget: {formatCurrency(parseInt(form.budgetMin, 10) || 0)} - {formatCurrency(parseInt(form.budgetMax, 10) || 0)} - Duration: {form.duration || 0} days</div>
            <div className="text-sm leading-7 text-charcoal-700">{form.description || 'Project description preview.'}</div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">{skill}</span>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={publishProject} disabled={isSubmitting || !canPublish}>{isSubmitting ? 'Publishing...' : 'Publish Project'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
