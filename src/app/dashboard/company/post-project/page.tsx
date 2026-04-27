'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, Paperclip, Plus, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/hooks/useProjects';
import { Textarea } from '@/components/forms/Textarea';
import { Badge } from '@/components/ui/badge';
import { SkillInput } from '@/components/forms/SkillInput';

type Step = 1 | 2 | 3 | 4;
type Visibility = 'public' | 'private' | 'invite';
type LocationPreference = 'remote' | 'onsite' | 'hybrid';

interface Milestone {
  title: string;
  amount: number;
  deadline: number;
  deliverables?: string;
}

interface FormState {
  title: string;
  category: string;
  description: string;
  summary: string;
  skills: string[];
  _skillObjects?: Array<{ name: string; level: 'beginner' | 'intermediate' | 'advanced'; mandatory: boolean }>;
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
  confirmGenuine: boolean;
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

const skillSuggestions = [
  'React', 'Node.js', 'MongoDB', 'Next.js', 'AWS', 'Figma', 'Python',
  'TypeScript', 'Flutter', 'Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL',
];

const initialState: FormState = {
  title: '',
  category: '',
  description: '',
  summary: '',
  skills: [],
  _skillObjects: [],
  experienceLevel: 'intermediate',
  requirements: [],
  locationPreference: 'remote',
  locationText: '',
  budgetType: 'fixed',
  budgetMin: '',
  budgetMax: '',
  duration: '',
  milestones: [],
  visibility: 'public',
  featured: false,
  attachments: [],
  confirmGenuine: false,
  confirmTerms: false,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
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

  // Restore draft
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedDraft = window.localStorage.getItem('company-project-draft');
    if (!savedDraft) return;
    try {
      const parsed = JSON.parse(savedDraft) as FormState;
      setForm((prev) => ({ ...prev, ...parsed }));
      setSubmitSuccess('Saved draft restored.');
    } catch {
      window.localStorage.removeItem('company-project-draft');
    }
  }, []);

  const milestoneTotal = useMemo(
    () => form.milestones.reduce((sum, item) => sum + (item.amount || 0), 0),
    [form.milestones]
  );

  const budgetMax = parseInt(form.budgetMax, 10) || 0;
  const milestoneMatchesBudget = milestoneTotal === budgetMax;

  const canPublish = useMemo(() => {
    return Boolean(
      form.confirmGenuine &&
      form.confirmTerms &&
      form.title.trim().length >= 5 &&
      form.description.trim().length >= 50 &&
      form.category &&
      form.skills.length > 0 &&
      form.budgetMin &&
      form.budgetMax &&
      parseInt(form.budgetMax) >= parseInt(form.budgetMin) &&
      form.duration &&
      parseInt(form.duration) >= 1
    );
  }, [form]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Requirements
  function updateRequirement(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.map((item, i) => (i === index ? value : item)),
    }));
  }

  function addRequirement() {
    setForm((prev) => ({ ...prev, requirements: [...prev.requirements, ''] }));
  }

  function removeRequirement(index: number) {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  }

  // Milestones
  function updateMilestone(index: number, key: keyof Milestone, value: string | number) {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function addMilestone() {
    setForm((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { title: '', amount: 0, deadline: 0, deliverables: '' },
      ],
    }));
  }

  function removeMilestone(index: number) {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  }

  function saveDraft() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('company-project-draft', JSON.stringify(form));
      setSubmitError(null);
      setSubmitSuccess('Draft saved locally. You can continue later.');
    }
  }

  async function publishProject() {
    if (isSubmitting) return;
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await createProject({
        title: form.title,
        summary: form.summary.trim() || undefined,
        description: form.description,
        category: form.category,
        skills: (form._skillObjects || form.skills.map((name) => ({
          name,
          level: form.experienceLevel === 'any' ? 'intermediate' : form.experienceLevel,
          mandatory: true,
        }))).map((s: any) => ({
          name: s.name || s,
          level: s.level || 'intermediate',
          mandatory: s.mandatory ?? true,
        })),
        budget: {
          type: form.budgetType as 'fixed' | 'hourly' | 'milestone',
          min: parseInt(form.budgetMin, 10) || 0,
          max: parseInt(form.budgetMax, 10) || 0,
          currency: 'INR',
        },
        duration: parseInt(form.duration, 10) || 0,
        location: {
          type: form.locationPreference,
          label: form.locationPreference === 'remote' ? 'Remote' : form.locationText.trim() || undefined,
        },
        requirements: form.requirements.filter(Boolean),
        experienceLevel: form.experienceLevel,
        visibility: form.visibility as 'public' | 'private' | 'invite',
        attachments: form.attachments.filter(Boolean),
        isFeatured: form.featured,
        milestones: form.milestones
          .filter((item) => item.title && item.amount > 0)
          .map((item) => ({
            title: item.title,
            description: item.deliverables || item.title,
            amount: item.amount,
            deadline: item.deadline,
          })),
      });

      if (result.success) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('company-project-draft');
        }
        setSubmitSuccess('Project published successfully!');
        setTimeout(() => router.push('/dashboard/company/my-projects'), 1000);
      } else {
        setSubmitError(result.error || 'Failed to publish project.');
      }
    } catch (error) {
      console.error(error);
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            Company Project Flow
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-charcoal-950 dark:text-white">
            Post New Project
          </h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">
            A premium 4-step publishing flow for stronger hiring outcomes.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Status Messages */}
      {(submitError || submitSuccess) && (
        <div
          className={`rounded-2xl border p-4 text-sm ${submitError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
            }`}
        >
          {submitError || submitSuccess}
        </div>
      )}

      {/* Step Indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        {['Basic Information', 'Skills & Requirements', 'Budget & Timeline', 'Visibility'].map(
          (label, index) => {
            const current = (index + 1) as Step;
            const active = step === current;
            const done = step > current;
            return (
              <button
                key={label}
                onClick={() => setStep(current)}
                className="w-full"
              >
                <Card className="border-none bg-card/80 dark:bg-charcoal-900/72 hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${done
                          ? 'bg-green-600 text-white'
                          : active
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : current}
                    </div>
                    <div className="text-sm font-medium text-left">{label}</div>
                  </CardContent>
                </Card>
              </button>
            );
          }
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Form Card */}
        <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-xl">Step {step} of 4</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* ========== STEP 1: BASIC INFO ========== */}
            {step === 1 && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Project Title *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    placeholder="MERN E-commerce Platform"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">{form.title.length}/100 characters (min 5)</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Project Description *</label>
                  <Textarea
                    rows={7}
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Describe the project scope, features, deliverables, and expectations..."
                  />
                  <p className="text-xs text-gray-500">{form.description.length} characters (min 50)</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Project Summary (Brief overview)</label>
                  <Input
                    value={form.summary}
                    onChange={(e) => setField('summary', e.target.value.slice(0, 200))}
                    placeholder="Build a modern e-commerce platform with React and Node.js"
                  />
                  <p className="text-xs text-gray-500">{form.summary.length}/200 characters</p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={saveDraft}>
                    Save as Draft
                  </Button>
                  <Button onClick={() => setStep(2)}>Continue to Step 2 →</Button>
                </div>
              </>
            )}

            {/* ========== STEP 2: SKILLS & REQUIREMENTS ========== */}
            {step === 2 && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Skills Required *</label>
                  <SkillInput
                    value={form._skillObjects && form._skillObjects.length > 0
                      ? form._skillObjects
                      : form.skills.map((name) => ({
                        name,
                        level: 'intermediate' as const,
                        mandatory: true,
                      }))
                    }
                    onChange={(skills) => {
                      setForm((prev) => ({
                        ...prev,
                        skills: skills.map((s) => s.name),
                        _skillObjects: skills,
                      }));
                    }}
                    suggestions={skillSuggestions}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Experience Level *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['beginner', 'Beginner (0-1 year)'],
                      ['intermediate', 'Intermediate (1-3 years)'],
                      ['advanced', 'Advanced (3+ years)'],
                      ['any', 'Any'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setField('experienceLevel', value)}
                        className={`rounded-xl border px-4 py-3 text-sm text-left transition-colors ${form.experienceLevel === value
                            ? 'border-primary-600 bg-primary-50 text-primary-800'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Location Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['remote', 'onsite', 'hybrid'] as LocationPreference[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setField('locationPreference', type)}
                        className={`rounded-xl border px-4 py-3 text-sm capitalize transition-colors ${form.locationPreference === type
                            ? 'border-primary-600 bg-primary-50 text-primary-800'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {form.locationPreference !== 'remote' && (
                    <Input
                      value={form.locationText}
                      onChange={(e) => setField('locationText', e.target.value)}
                      placeholder="Bangalore, India"
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Requirements</label>
                  {form.requirements.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder="e.g., Portfolio required"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeRequirement(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addRequirement}>
                    <Plus className="mr-2 h-4 w-4" />Add Requirement
                  </Button>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                  <Button onClick={() => setStep(3)}>Continue to Step 3 →</Button>
                </div>
              </>
            )}

            {/* ========== STEP 3: BUDGET & TIMELINE ========== */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget Type *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ['fixed', 'Fixed Price'],
                      ['hourly', 'Hourly Rate'],
                      ['milestone', 'Milestone-based'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setField('budgetType', value)}
                        className={`rounded-xl border px-4 py-3 text-sm transition-colors ${form.budgetType === value
                            ? 'border-primary-600 bg-primary-50 text-primary-800'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Minimum Budget (₹) *</label>
                    <Input
                      type="number"
                      value={form.budgetMin}
                      onChange={(e) => setField('budgetMin', e.target.value)}
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Maximum Budget (₹) *</label>
                    <Input
                      type="number"
                      value={form.budgetMax}
                      onChange={(e) => setField('budgetMax', e.target.value)}
                      placeholder="70000"
                      min="0"
                    />
                  </div>
                </div>

                {parseInt(form.budgetMax) > 0 && parseInt(form.budgetMin) > parseInt(form.budgetMax) && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Max budget must be greater than or equal to min budget
                  </p>
                )}

                <div className="rounded-xl border bg-gray-50 p-4 text-sm">
                  Budget Range: {formatCurrency(parseInt(form.budgetMin, 10) || 0)} - {formatCurrency(parseInt(form.budgetMax, 10) || 0)}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Duration (days) *</label>
                  <Input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setField('duration', e.target.value)}
                    placeholder="30"
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-gray-500">Minimum 1 day, Maximum 365 days</p>
                </div>

                {/* Milestones */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Milestones (Optional)</label>
                  {form.milestones.map((item, index) => (
                    <div key={index} className="rounded-xl border bg-gray-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Milestone {index + 1}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeMilestone(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <Input
                        value={item.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        placeholder="UI Development"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          value={item.amount || ''}
                          onChange={(e) => updateMilestone(index, 'amount', parseInt(e.target.value, 10) || 0)}
                          placeholder="Amount (₹)"
                        />
                        <Input
                          type="number"
                          value={item.deadline || ''}
                          onChange={(e) => updateMilestone(index, 'deadline', parseInt(e.target.value, 10) || 0)}
                          placeholder="Deadline (Day)"
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={item.deliverables || ''}
                        onChange={(e) => updateMilestone(index, 'deliverables', e.target.value)}
                        placeholder="Deliverables: Figma designs, HTML/CSS"
                      />
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={addMilestone}>
                      <Plus className="mr-2 h-4 w-4" />Add Milestone
                    </Button>
                    <div className="text-sm">
                      <span className="font-medium">Total: {formatCurrency(milestoneTotal)}</span>
                      {budgetMax > 0 && (
                        <span className={`ml-2 ${milestoneMatchesBudget ? 'text-green-600' : 'text-yellow-600'}`}>
                          {milestoneMatchesBudget ? '(Matches budget ✓)' : `(Budget: ${formatCurrency(budgetMax)})`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                  <Button onClick={() => setStep(4)}>Continue to Step 4 →</Button>
                </div>
              </>
            )}

            {/* ========== STEP 4: VISIBILITY ========== */}
            {step === 4 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <div className="space-y-2">
                    {[
                      ['public', 'Public', 'Anyone can view and apply'],
                      ['private', 'Private', 'Only invited candidates can apply'],
                      ['invite', 'Invite Only', 'Only specific candidates you invite'],
                    ].map(([value, label, desc]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setField('visibility', value as Visibility)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${form.visibility === value
                            ? 'border-primary-600 bg-primary-50 text-primary-800'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                      >
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attachments (Optional)</label>
                  {form.attachments.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Paperclip className="h-4 w-4 text-primary-600" />
                        {item}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setField(
                            'attachments',
                            form.attachments.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={attachmentInput}
                      onChange={(e) => setAttachmentInput(e.target.value)}
                      placeholder="File name or URL"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!attachmentInput.trim()) return;
                        if (form.attachments.length >= 10) return;
                        setField('attachments', [...form.attachments, attachmentInput.trim()]);
                        setAttachmentInput('');
                      }}
                      disabled={form.attachments.length >= 10}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {form.attachments.length}/10 files • Max 50MB total
                  </p>
                </div>

                {/* Featured */}
                <label className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50/50 p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setField('featured', e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">Feature this project (₹500 extra)</p>
                    <p className="text-xs text-gray-500">Featured projects appear at top and get 3x more applications</p>
                  </div>
                </label>

                {/* Terms */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 rounded-xl border bg-gray-50 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.confirmGenuine}
                      onChange={(e) => setField('confirmGenuine', e.target.checked)}
                      className="h-4 w-4 rounded mt-0.5"
                    />
                    <p className="text-sm">I confirm that this is a genuine project requirement</p>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border bg-gray-50 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.confirmTerms}
                      onChange={(e) => setField('confirmTerms', e.target.checked)}
                      className="h-4 w-4 rounded mt-0.5"
                    />
                    <p className="text-sm">I agree to InternHub's terms and conditions</p>
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(3)}>← Back</Button>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                      <Eye className="mr-2 h-4 w-4" />Preview
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

        {/* Sidebar Summary */}
        <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72 h-fit sticky top-24">
          <CardHeader>
            <CardTitle className="text-xl">Listing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-gray-50 p-4">
              <div className="font-semibold">{form.title || 'Untitled project'}</div>
              <div className="mt-2 text-sm text-gray-500">{form.category || 'No category'}</div>
              <div className="mt-3 text-sm">{form.summary || 'Short summary will appear here.'}</div>
            </div>
            <div className="space-y-2">
              <div className="rounded-xl border bg-gray-50 p-4 text-sm">
                Budget: {formatCurrency(parseInt(form.budgetMin, 10) || 0)} - {formatCurrency(parseInt(form.budgetMax, 10) || 0)}
              </div>
              <div className="rounded-xl border bg-gray-50 p-4 text-sm">
                Duration: {form.duration || 0} days
              </div>
            </div>
            {form.skills.length > 0 && (
              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="mb-2 text-sm font-medium">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="rounded-full">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {!canPublish && (
              <div className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Complete all required fields to publish
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{form.title || 'Project Preview'}</DialogTitle>
            <DialogDescription>This is how candidates will see your project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 rounded-xl border bg-gray-50 p-5">
            <h3 className="text-lg font-bold">{form.title || 'Untitled'}</h3>
            <p className="text-sm text-gray-500">
              Budget: {formatCurrency(parseInt(form.budgetMin, 10) || 0)} - {formatCurrency(parseInt(form.budgetMax, 10) || 0)} • Duration: {form.duration || 0} days
            </p>
            <div className="flex flex-wrap gap-2">
              {(form._skillObjects || []).map((s: any) => (
                <Badge key={s.name} variant="secondary" className="rounded-full text-xs">
                  {s.name} ({s.level})
                </Badge>
              ))}
              {form._skillObjects?.length === 0 && form.skills.map((s) => (
                <Badge key={s} variant="secondary" className="rounded-full text-xs">{s}</Badge>
              ))}
            </div>
            <p className="text-sm leading-7">{form.description || 'Project description preview.'}</p>
            {form.milestones.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Milestones:</p>
                {form.milestones.map((m, i) => (
                  <div key={i} className="text-xs text-gray-600">
                    {i + 1}. {m.title} - {formatCurrency(m.amount)} (Day {m.deadline})
                    {m.deliverables && <span className="block ml-4">Deliverables: {m.deliverables}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={publishProject} disabled={isSubmitting || !canPublish}>
              {isSubmitting ? 'Publishing...' : 'Publish Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}