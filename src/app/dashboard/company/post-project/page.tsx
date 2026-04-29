'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { ProjectFormStepper } from '@/components/projects/ProjectFormStepper';
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Eye, Send, Sparkles, X } from 'lucide-react';
import { useCreateProject } from '@/hooks/useCreateProjects';

const steps = [
  { title: 'Basic Info', subtitle: 'Title & Category' },
  { title: 'Skills & Req.', subtitle: 'Skills & Location' },
  { title: 'Budget', subtitle: 'Budget & Timeline' },
  { title: 'Visibility', subtitle: 'Attachments' },
];

export default function PostProjectPage() {
  const router = useRouter();
  const store = useCreateProject();
  const { currentStep, formData, projectId, errors, isSubmitting } = store;
  const [previewOpen, setPreviewOpen] = useState(false);

  // PERMANENT FIX: Safety net on every mount
  useEffect(() => {
    if (store.isSubmitting) {
      store.setIsSubmitting(false);
    }
    if (Object.keys(store.errors).length > 0) {
      store.clearErrors();
    }
  }, []);

  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title || formData.title.length < 5) e.title = 'Min 5 characters required';
      if (!formData.category) e.category = 'Category is required';
      if (!formData.description || formData.description.length < 50) e.description = 'Min 50 characters required';
    }
    if (step === 2) {
      if (formData.skills.every(s => !s.name.trim())) e.skills = 'At least 1 skill required';
      if (!formData.experienceLevel) e.experienceLevel = 'Experience level required';
      if (!formData.locationType) e.locationType = 'Location type required';
    }
    if (step === 3) {
      if (!formData.budgetType) e.budgetType = 'Budget type required';
      if (!formData.duration || Number(formData.duration) < 1) e.duration = 'Duration required';
      if (formData.budgetType !== 'hourly') {
        if (!formData.budgetMin || Number(formData.budgetMin) < 1) e.budgetMin = 'Min budget required';
        if (!formData.budgetMax || Number(formData.budgetMax) < Number(formData.budgetMin)) e.budgetMax = 'Max must be > min';
      }
    }
    if (step === 4) {
      if (!formData.termsAccepted) e.termsAccepted = 'You must accept terms';
    }
    store.setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    title: formData.title,
    category: formData.category,
    description: formData.description,
    summary: formData.summary || undefined,
    skills: formData.skills.filter(s => s.name.trim()).map(s => ({
      name: s.name,
      level: s.proficiency as 'beginner' | 'intermediate' | 'advanced',
      mandatory: true,
    })),
    experienceLevel: formData.experienceLevel || 'intermediate',
    location: formData.locationType === 'remote'
      ? { type: 'remote' as const }
      : { type: formData.locationType as 'onsite' | 'hybrid', label: formData.location },
    budget: formData.budgetType === 'hourly'
      ? { type: 'hourly' as const, min: Number(formData.hourlyRate) || 0, max: Number(formData.hourlyRate) || 0, currency: 'INR' }
      : { type: (formData.budgetType || 'fixed') as 'fixed' | 'milestone', min: Number(formData.budgetMin) || 0, max: Number(formData.budgetMax) || 0, currency: 'INR' },
    duration: Number(formData.duration) || 0,
    milestones: formData.milestones.filter(m => m.title && m.amount > 0).map(m => ({
      title: m.title,
      description: m.deliverables || m.title,
      amount: m.amount,
      deadline: m.deadlineDay,
    })),
    requirements: formData.requirements.filter(Boolean),
    visibility: formData.visibility || 'public',
    attachments: formData.attachments.map(a => a.fileUrl).filter(Boolean),
    isFeatured: formData.isFeatured,
  });

  const submitProject = async (status: 'draft' | 'open') => {
    store.setIsSubmitting(true);
    try {
      const pid = store.projectId;
      const method = pid ? 'PATCH' : 'POST';
      const endpoint = pid ? `/api/projects/${pid}` : '/api/projects';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildPayload(), status }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      
      const newId = data?.project?._id || data?.data?.project?._id || data?._id;
      if (newId) store.setProjectId(newId);
      return { success: true };
    } catch (err: any) {
      console.error('Submit error:', err);
      return { success: false, error: err.message || 'Something went wrong' };
    } finally {
      store.setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const result = await submitProject('draft');
    if (result.success) {
      store.setStatus('draft');
      router.push('/dashboard/company/my-projects?tab=draft');
    } else {
      alert(result.error || 'Failed to save');
    }
  };

  const handlePublish = async () => {
    if (!validateStep(4)) return;
    const result = await submitProject('open');
    if (result.success) {
      store.reset();
      router.push('/dashboard/company/my-projects');
    } else {
      alert(result.error || 'Failed to publish');
    }
  };

  const goNext = () => { if (validateStep(currentStep)) { store.setCurrentStep(currentStep + 1); window.scrollTo(0, 0); } };
  const goBack = () => { if (currentStep > 1) { store.setCurrentStep(currentStep - 1); window.scrollTo(0, 0); } };

  const milestoneTotal = formData.milestones.reduce((s, m) => s + (m.amount || 0), 0);
  const budgetMax = Number(formData.budgetMax) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-3 py-1 text-xs font-medium text-gray-500 mb-3">
          <Sparkles className="h-3 w-3" />Post New Project
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create a Project</h1>
        <p className="text-gray-500 mt-1">Fill in the details to find the right talent</p>
      </div>

      <ProjectFormStepper currentStep={currentStep} totalSteps={4} steps={steps} onStepClick={(s) => s < currentStep && store.setCurrentStep(s)} errors={errors} />

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-6 min-h-[400px]">
          {currentStep === 1 && <StepBasicInfo />}
          {currentStep === 2 && <StepSkills />}
          {currentStep === 3 && <StepBudget />}
          {currentStep === 4 && <StepVisibility />}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm sticky bottom-4">
        <div className="flex gap-3">
          {currentStep > 1 && <Button variant="outline" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>}
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />Save Draft</>}
          </Button>
        </div>
        <div className="flex gap-3">
          {currentStep < 4 ? (
            <Button onClick={goNext}>Continue <ArrowRight className="h-4 w-4 ml-2" /></Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setPreviewOpen(true)}><Eye className="h-4 w-4 mr-2" />Preview</Button>
              <Button onClick={handlePublish} disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : <><Send className="h-4 w-4 mr-2" />Publish Project</>}
              </Button>
            </>
          )}
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Project Preview</h2>
              <Button variant="ghost" size="icon" onClick={() => setPreviewOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{formData.title || 'Untitled'}</h3>
              <p className="text-sm text-gray-500">{formData.category} • {formData.locationType} • {formData.budgetType === 'hourly' ? `₹${formData.hourlyRate}/hr` : `₹${Number(formData.budgetMin).toLocaleString() || 0} - ₹${Number(formData.budgetMax).toLocaleString() || 0}`} • {formData.duration} {formData.durationUnit}</p>
              <div className="flex flex-wrap gap-2">{formData.skills.filter(s => s.name).map((s, i) => (<span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">{s.name} ({s.proficiency})</span>))}</div>
              <p className="text-sm whitespace-pre-wrap">{formData.description}</p>
              {formData.milestones.length > 0 && (
                <div><p className="font-medium text-sm mb-2">Milestones:</p>
                  {formData.milestones.filter(m => m.title).map((m) => (<div key={m.id} className="text-sm text-gray-600">• {m.title} - ₹{m.amount.toLocaleString()} (Day {m.deadlineDay})</div>))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
              <Button onClick={() => { setPreviewOpen(false); handlePublish(); }} disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBasicInfo() {
  const { formData, errors, updateField } = useCreateProject();
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Project Title *</label>
        <Input value={formData.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g., MERN E-commerce Platform" maxLength={100} className="rounded-xl" />
        <p className="text-xs text-gray-400 mt-1">{formData.title.length}/100</p>
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Category *</label>
        <select value={formData.category} onChange={e => updateField('category', e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm">
          <option value="">Select category</option>
          {['Web Development', 'Mobile App', 'AI / ML', 'Blockchain', 'UI/UX Design', 'Data Science', 'Cybersecurity', 'DevOps', 'Game Dev', 'IoT', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Description *</label>
        <Textarea value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Describe your project in detail..." rows={8} className="rounded-xl resize-none" />
        <p className="text-xs text-gray-400 mt-1">{formData.description.length}/5000 (min 50)</p>
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Summary (Optional)</label>
        <Input value={formData.summary} onChange={e => updateField('summary', e.target.value)} placeholder="Brief overview shown in cards..." maxLength={200} className="rounded-xl" />
        <p className="text-xs text-gray-400 mt-1">{formData.summary.length}/200</p>
      </div>
    </div>
  );
}

function StepSkills() {
  const { formData, errors, updateField, addSkill, removeSkill, updateSkill } = useCreateProject();
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium mb-2 block">Skills Required *</label>
        {formData.skills.map((skill, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input value={skill.name} onChange={e => updateSkill(i, { name: e.target.value })} placeholder="e.g., React.js" className="rounded-xl flex-1" />
            <select value={skill.proficiency} onChange={e => updateSkill(i, { proficiency: e.target.value as any })} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
            </select>
            <Button variant="ghost" size="icon" onClick={() => removeSkill(i)} disabled={formData.skills.length <= 1}><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </div>
        ))}
        {formData.skills.length < 10 && <Button variant="outline" size="sm" onClick={() => addSkill({ name: '', proficiency: 'intermediate' })}><Plus className="h-4 w-4 mr-1" />Add Skill</Button>}
        {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Experience Level *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['beginner', 'intermediate', 'advanced', 'any'].map(level => (
            <button key={level} type="button" onClick={() => updateField('experienceLevel', level)} className={`p-3 rounded-xl border text-sm capitalize transition-all ${formData.experienceLevel === level ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>{level}</button>
          ))}
        </div>
        {errors.experienceLevel && <p className="text-xs text-red-500">{errors.experienceLevel}</p>}
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Location *</label>
        <div className="flex gap-3">
          {['remote', 'onsite', 'hybrid'].map(type => (
            <button key={type} type="button" onClick={() => updateField('locationType', type)} className={`flex-1 p-3 rounded-xl border text-sm capitalize transition-all ${formData.locationType === type ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>{type}</button>
          ))}
        </div>
        {(formData.locationType === 'onsite' || formData.locationType === 'hybrid') && <Input value={formData.location} onChange={e => updateField('location', e.target.value)} placeholder="City, Country" className="rounded-xl mt-3" />}
        {errors.locationType && <p className="text-xs text-red-500">{errors.locationType}</p>}
      </div>
    </div>
  );
}

function StepBudget() {
  const { formData, errors, updateField, addMilestone, removeMilestone, updateMilestone } = useCreateProject();
  const total = formData.milestones.reduce((s, m) => s + (m.amount || 0), 0);
  const max = Number(formData.budgetMax) || 0;

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium mb-2 block">Budget Type *</label>
        <div className="flex gap-3">
          {[
            { value: 'fixed', label: 'Fixed Price' },
            { value: 'hourly', label: 'Hourly' },
            { value: 'milestone', label: 'Milestone' },
          ].map(t => (
            <button key={t.value} type="button" onClick={() => updateField('budgetType', t.value)} className={`flex-1 p-4 rounded-xl border text-sm capitalize transition-all ${formData.budgetType === t.value ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>{t.label}</button>
          ))}
        </div>
        {errors.budgetType && <p className="text-xs text-red-500">{errors.budgetType}</p>}
      </div>
      {formData.budgetType === 'hourly' ? (
        <div><label className="text-sm font-medium mb-1.5 block">Hourly Rate (₹) *</label><Input type="number" value={formData.hourlyRate} onChange={e => updateField('hourlyRate', e.target.value)} placeholder="1500" className="rounded-xl" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="text-sm font-medium mb-1.5 block">Min Budget (₹) *</label><Input type="number" value={formData.budgetMin} onChange={e => updateField('budgetMin', e.target.value)} placeholder="50000" className="rounded-xl" />{errors.budgetMin && <p className="text-xs text-red-500">{errors.budgetMin}</p>}</div>
          <div><label className="text-sm font-medium mb-1.5 block">Max Budget (₹) *</label><Input type="number" value={formData.budgetMax} onChange={e => updateField('budgetMax', e.target.value)} placeholder="70000" className="rounded-xl" />{errors.budgetMax && <p className="text-xs text-red-500">{errors.budgetMax}</p>}</div>
        </div>
      )}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Duration *</label>
        <div className="flex gap-2">
          <Input type="number" value={formData.duration} onChange={e => updateField('duration', e.target.value)} placeholder="30" className="rounded-xl flex-1" min="1" />
          <select value={formData.durationUnit} onChange={e => updateField('durationUnit', e.target.value as any)} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"><option value="days">Days</option><option value="weeks">Weeks</option></select>
        </div>
        {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Milestones</label><Button variant="outline" size="sm" onClick={addMilestone}><Plus className="h-4 w-4 mr-1" />Add</Button></div>
        {formData.milestones.map(m => (
          <div key={m.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-3 space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Milestone</span><Button variant="ghost" size="icon" onClick={() => removeMilestone(m.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>
            <Input value={m.title} onChange={e => updateMilestone(m.id, { title: e.target.value })} placeholder="Title" className="rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" value={m.amount || ''} onChange={e => updateMilestone(m.id, { amount: Number(e.target.value) })} placeholder="Amount (₹)" className="rounded-xl" />
              <Input type="number" value={m.deadlineDay || ''} onChange={e => updateMilestone(m.id, { deadlineDay: Number(e.target.value) })} placeholder="Deadline Day" className="rounded-xl" />
            </div>
            <Textarea value={m.deliverables} onChange={e => updateMilestone(m.id, { deliverables: e.target.value })} placeholder="Deliverables" rows={2} className="rounded-xl" />
          </div>
        ))}
        {formData.milestones.length > 0 && <div className="text-sm text-gray-500 mt-2">Total: ₹{total.toLocaleString()} {max > 0 && total === max && <span className="text-green-600">✓ Matches budget</span>}</div>}
      </div>
    </div>
  );
}

function StepVisibility() {
  const { formData, errors, updateField } = useCreateProject();
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium mb-2 block">Visibility *</label>
        {[
          { value: 'public', label: 'Public', desc: 'Anyone can view and apply' },
          { value: 'private', label: 'Private', desc: 'Only invited candidates' },
          { value: 'invite', label: 'Invite Only', desc: 'Specific candidates only' },
        ].map(opt => (
          <button key={opt.value} type="button" onClick={() => updateField('visibility', opt.value as any)} className={`w-full text-left p-4 rounded-xl border mb-2 transition-all ${formData.visibility === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}><p className="font-medium text-sm">{opt.label}</p><p className="text-xs text-gray-500">{opt.desc}</p></button>
        ))}
      </div>
      <button type="button" onClick={() => updateField('isFeatured', !formData.isFeatured)} className={`w-full text-left p-4 rounded-xl border transition-all ${formData.isFeatured ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}><p className="text-sm flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} readOnly className="rounded" />Feature this project</p><p className="text-xs text-gray-500 mt-1">+₹500 • Get 3x more applications</p></button>
      <button type="button" onClick={() => updateField('termsAccepted', !formData.termsAccepted)} className={`w-full text-left p-4 rounded-xl border transition-all ${formData.termsAccepted ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}><p className="text-sm flex items-center gap-2"><input type="checkbox" checked={formData.termsAccepted} readOnly className="rounded" />I confirm this is a genuine project and agree to InternHub's Terms of Service</p></button>
      {errors.termsAccepted && <p className="text-xs text-red-500 mt-1">{errors.termsAccepted}</p>}
    </div>
  );
}