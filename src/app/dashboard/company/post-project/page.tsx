'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { ProjectFormStepper } from '@/components/projects/ProjectFormStepper';
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Eye, Send, Sparkles, X, Upload, FileText } from 'lucide-react';
import { useCreateProject } from '@/hooks/useCreateProjects';
import { toast } from 'sonner';

const steps = [
  { title: 'Basic Info', subtitle: 'Title & Category' },
  { title: 'Skills & Req.', subtitle: 'Skills & Location' },
  { title: 'Budget', subtitle: 'Budget & Timeline' },
  { title: 'Visibility', subtitle: 'Attachments' },
];

const CATEGORIES = [
  'Web Development', 'Mobile App Development', 'AI / Machine Learning',
  'Blockchain / Web3', 'UI/UX Design', 'Data Science & Analytics',
  'Cybersecurity', 'DevOps & Cloud', 'Game Development', 'IoT & Embedded', 'Other'
];

export default function PostProjectPage() {
  const router = useRouter();
  const store = useCreateProject();
  const { currentStep, formData, projectId, errors, isSubmitting, isSaving } = store;
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  // Reset states on mount
  useEffect(() => {
    store.setIsSubmitting(false);
    store.setIsSaving(false);
    store.clearErrors();
  }, []);

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const fd = store.formData;
      if (fd.title || fd.category || fd.description) {
        localStorage.setItem('internhub_draft_backup', JSON.stringify({
          formData: fd,
          currentStep: store.currentStep,
          projectId: store.projectId,
          timestamp: Date.now()
        }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title || formData.title.length < 5) e.title = 'Title must be at least 5 characters';
      if (!formData.category) e.category = 'Category is required';
      if (!formData.description || formData.description.length < 50) e.description = 'Description must be at least 50 characters';
    }
    if (step === 2) {
      if (formData.skills.every(s => !s.name.trim())) e.skills = 'At least 1 skill is required';
      if (!formData.experienceLevel) e.experienceLevel = 'Experience level is required';
      if (!formData.locationType) e.locationType = 'Location type is required';
    }
    if (step === 3) {
      if (!formData.budgetType) e.budgetType = 'Budget type is required';
      if (!formData.duration || Number(formData.duration) < 1) e.duration = 'Duration is required';
      if (formData.budgetType !== 'hourly') {
        if (!formData.budgetMin || Number(formData.budgetMin) < 5000) e.budgetMin = 'Minimum budget must be ₹5,000';
        if (!formData.budgetMax || Number(formData.budgetMax) <= Number(formData.budgetMin)) e.budgetMax = 'Maximum must be greater than minimum';
      }
    }
    if (step === 4) {
      if (!formData.termsAccepted) e.termsAccepted = 'You must accept the terms';
    }
    store.setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = (status: 'draft' | 'published') => {
    const validSkills = formData.skills
      .filter(s => s.name && s.name.trim().length > 0)
      .map(s => ({
        name: s.name.trim(),
        level: s.proficiency || 'intermediate',
        mandatory: true,
      }));

    // Ensure at least 1 skill
    if (validSkills.length === 0) {
      validSkills.push({ name: 'General', level: 'intermediate', mandatory: true });
    }

    const payload: any = {
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      skills: validSkills,
      budget: {
        type: formData.budgetType || 'fixed',
        min: Number(formData.budgetMin) || 5000,
        max: Number(formData.budgetMax) || 10000,
        currency: 'INR',
      },
      duration: Number(formData.duration) || 30,
      location: formData.locationType === 'remote'
        ? { type: 'remote' as const }
        : { type: (formData.locationType || 'onsite') as 'onsite' | 'hybrid', label: formData.location || '' },
      requirements: formData.requirements.filter(Boolean),
      experienceLevel: formData.experienceLevel || 'intermediate',
      visibility: formData.visibility === 'invite_only' ? 'invite' : (formData.visibility || 'public'),
      attachments: formData.attachments.map(a => a.fileUrl).filter(Boolean),
      isFeatured: formData.isFeatured || false,
    };

    if (formData.summary?.trim()) payload.summary = formData.summary.trim();
    if (formData.milestones.length > 0) {
      payload.milestones = formData.milestones
        .filter(m => m.title.trim() && m.amount > 0)
        .map(m => ({
          title: m.title.trim(),
          description: m.deliverables || m.title,
          amount: m.amount,
          deadline: m.deadlineDay || 1,
        }));
    }

    return payload;
  };

  const submitProject = async (status: 'draft' | 'published') => {
    if (status === 'published') {
      store.setIsSubmitting(true);
    } else {
      store.setIsSaving(true);
    }

    try {
      const pid = store.projectId;
      const endpoint = pid ? `/api/projects/${pid}` : '/api/projects';
      const method = pid ? 'PATCH' : 'POST';
      const payload = buildPayload(status);

      // For new project POST: send full payload
      // For existing PATCH: send full payload with updated status
      const body = {
        ...payload,
        status: status === 'published' ? 'open' : 'draft',
      };

      console.log('🚀 Sending to:', endpoint);
      console.log('📦 Method:', method);
      console.log('📋 Body:', JSON.stringify(body, null, 2));

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      console.log('✅ Response:', data);

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      const newId = data?.project?._id || data?.data?.project?._id || data?._id;
      if (newId) store.setProjectId(newId);

      return { success: true, data };
    } catch (err: any) {
      console.error('❌ Error:', err);
      return { success: false, error: err.message };
    } finally {
      store.setIsSubmitting(false);
      store.setIsSaving(false);
    }
  };
  const handleSaveDraft = async () => {
    const result = await submitProject('draft');
    if (result.success) {
      toast.success('Draft saved successfully!');
      localStorage.removeItem('internhub_draft_backup');
      router.push('/dashboard/company/projects?tab=drafts');
    } else {
      toast.error(result.error || 'Failed to save draft');
    }
  };

  const handlePublish = async () => {
    if (!validateStep(4)) return;

    const result = await submitProject('published');
    if (result.success) {
      toast.success('Project published successfully!');
      localStorage.removeItem('internhub_draft_backup');
      store.reset();
      router.push('/dashboard/company/projects?tab=active');
    } else {
      toast.error(result.error || 'Failed to publish');
      // Auto-save as draft on failure
      submitProject('draft');
    }
  };

  const handleFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      // ✅ Use existing upload API
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      if (store.projectId) formDataUpload.append('projectId', store.projectId);

      try {
        const res = await fetch('/api/uploads/document', {  // ✅ Existing endpoint
          method: 'POST',
          body: formDataUpload,
        });

        const data = await res.json();

        if (res.ok) {
          store.addAttachment({
            id: data.id || data.attachmentId || Date.now().toString(),
            fileName: file.name,
            fileSize: file.size,
            fileUrl: data.url || data.fileUrl || '',
            mimeType: file.type,
          });
          toast.success(`${file.name} uploaded`);
        } else {
          toast.error(data.error || `Failed to upload ${file.name}`);
        }
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      store.setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      store.setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-gray-500 mb-3">
          <Sparkles className="h-3 w-3" />Post New Project
        </div>
        <h1 className="text-2xl font-bold">Create a Project</h1>
        <p className="text-gray-500 mt-1">Fill in the details to find the right talent</p>
      </div>

      {/* Stepper */}
      <ProjectFormStepper
        currentStep={currentStep}
        totalSteps={4}
        steps={steps}
        onStepClick={(s) => s < currentStep && store.setCurrentStep(s)}
        errors={errors}
      />

      {/* Step Content */}
      <Card className="border shadow-sm">
        <CardContent className="p-6 min-h-[400px]">
          {currentStep === 1 && <StepBasicInfo />}
          {currentStep === 2 && <StepSkills />}
          {currentStep === 3 && <StepBudget />}
          {currentStep === 4 && <StepVisibility fileInputRef={fileInputRef} onFileSelect={handleFileUpload} />}
        </CardContent>
      </Card>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm sticky bottom-4">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
          )}
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isSubmitting}>
            {isSaving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />Save Draft</>}
          </Button>
        </div>
        <div className="flex gap-3">
          {currentStep < 4 ? (
            <Button onClick={goNext}>Continue <ArrowRight className="h-4 w-4 ml-2" /></Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />Preview
              </Button>
              <Button onClick={handlePublish} disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : <><Send className="h-4 w-4 mr-2" />Publish Project</>}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Project Preview</h2>
              <Button variant="ghost" size="icon" onClick={() => setPreviewOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{formData.title || 'Untitled'}</h3>
              <p className="text-sm text-gray-500">
                {formData.category} • {formData.locationType || 'Remote'} •
                {formData.budgetType === 'hourly' ? ` ₹${formData.hourlyRate}/hr` : ` ₹${Number(formData.budgetMin).toLocaleString() || 0} - ₹${Number(formData.budgetMax).toLocaleString() || 0}`}
                {' • '}{formData.duration} {formData.durationUnit}
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.skills.filter(s => s.name).map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs">{s.name} ({s.proficiency})</span>
                ))}
              </div>
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: formData.description }} />
              {formData.milestones.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Milestones:</p>
                  {formData.milestones.filter(m => m.title).map(m => (
                    <div key={m.id} className="text-sm text-gray-600">• {m.title} - ₹{m.amount.toLocaleString()} (Day {m.deadlineDay})</div>
                  ))}
                </div>
              )}
              {formData.attachments.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Attachments: {formData.attachments.length} files</p>
                  {formData.attachments.map(a => (
                    <div key={a.id} className="text-sm text-gray-600 flex items-center gap-2">
                      <FileText className="h-4 w-4" />{a.fileName} ({(a.fileSize / 1024 / 1024).toFixed(1)} MB)
                    </div>
                  ))}
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

// Step 1: Basic Info
function StepBasicInfo() {
  const { formData, errors, updateField } = useCreateProject();
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Project Title *</label>
        <Input value={formData.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g., MERN E-commerce Platform" maxLength={100} className="rounded-xl" />
        <p className="text-xs text-gray-400 mt-1 text-right">{formData.title.length}/100</p>
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Category *</label>
        <select value={formData.category} onChange={e => updateField('category', e.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-sm bg-white">
          <option value="">Select project category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Description *</label>
        <Textarea value={formData.description} onChange={e => {
          updateField('description', e.target.value);
          updateField('descriptionPlain', e.target.value.replace(/<[^>]*>/g, ''));
        }} placeholder="Describe your project in detail...&#10;• What are the goals?&#10;• What features are needed?&#10;• Any specific requirements?" rows={8} className="rounded-xl resize-none" />
        <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/5000 (min 50)</p>
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Summary (Optional)</label>
        <Input value={formData.summary} onChange={e => updateField('summary', e.target.value)} placeholder="A short summary shown in project cards..." maxLength={200} className="rounded-xl" />
        <p className="text-xs text-gray-400 mt-1 text-right">{formData.summary.length}/200</p>
        <p className="text-xs text-gray-400 mt-1">This appears in search results and cards</p>
      </div>
    </div>
  );
}

// Step 2: Skills & Requirements
function StepSkills() {
  const { formData, errors, updateField, addSkill, removeSkill, updateSkill } = useCreateProject();
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Skills Required *</label>
        {formData.skills.map((skill, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input value={skill.name} onChange={e => updateSkill(i, { name: e.target.value })} placeholder="e.g., React.js, Python" className="rounded-xl flex-1" />
            <select value={skill.proficiency} onChange={e => updateSkill(i, { proficiency: e.target.value as any })} className="rounded-xl border px-3 py-2 text-sm bg-white">
              <option value="beginner">Beginner (0-1 yr)</option>
              <option value="intermediate">Intermediate (1-3 yr)</option>
              <option value="advanced">Advanced (3+ yr)</option>
            </select>
            <Button variant="ghost" size="icon" onClick={() => removeSkill(i)} disabled={formData.skills.length <= 1}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
        {formData.skills.length < 10 && (
          <Button variant="outline" size="sm" onClick={() => addSkill({ name: '', proficiency: 'intermediate' })}>
            <Plus className="h-4 w-4 mr-1" />Add Another Skill
          </Button>
        )}
        {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Experience Level *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'beginner', label: 'Beginner', sub: '0-1 year' },
            { value: 'intermediate', label: 'Intermediate', sub: '1-3 years' },
            { value: 'advanced', label: 'Advanced', sub: '3+ years' },
            { value: 'any', label: 'Any Level', sub: 'Open to all' },
          ].map(level => (
            <button key={level.value} type="button" onClick={() => updateField('experienceLevel', level.value)}
              className={`p-3 rounded-xl border text-sm transition-all ${formData.experienceLevel === level.value ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-300'
                }`}>
              <div className="font-medium">{level.label}</div>
              <div className="text-xs text-gray-500">{level.sub}</div>
            </button>
          ))}
        </div>
        {errors.experienceLevel && <p className="text-xs text-red-500 mt-1">{errors.experienceLevel}</p>}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Additional Requirements</label>
        <div className="space-y-2">
          {['Portfolio website required', 'GitHub profile required', 'Previous similar project experience', 'Communication in English required'].map(req => (
            <label key={req} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.requirements.includes(req)} onChange={e => {
                if (e.target.checked) updateField('requirements', [...formData.requirements, req]);
                else updateField('requirements', formData.requirements.filter(r => r !== req));
              }} className="rounded" />
              <span className="text-sm">{req}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Location Preference *</label>
        <div className="flex gap-3">
          {['remote', 'onsite', 'hybrid'].map(type => (
            <button key={type} type="button" onClick={() => updateField('locationType', type)}
              className={`flex-1 p-3 rounded-xl border text-sm capitalize transition-all ${formData.locationType === type ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-gray-300'
                }`}>{type}</button>
          ))}
        </div>
        {(formData.locationType === 'onsite' || formData.locationType === 'hybrid') && (
          <Input value={formData.location} onChange={e => updateField('location', e.target.value)} placeholder="City, Country" className="rounded-xl mt-3" />
        )}
        {errors.locationType && <p className="text-xs text-red-500 mt-1">{errors.locationType}</p>}
      </div>
    </div>
  );
}

// Step 3: Budget & Timeline
function StepBudget() {
  const { formData, errors, updateField, addMilestone, removeMilestone, updateMilestone } = useCreateProject();
  const totalMilestone = formData.milestones.reduce((s, m) => s + (m.amount || 0), 0);
  const budgetMax = Number(formData.budgetMax) || 0;

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Budget Type *</label>
        <div className="flex gap-3">
          {[
            { value: 'fixed', label: 'Fixed Price', desc: 'Best for defined projects' },
            { value: 'hourly', label: 'Hourly Rate', desc: 'Best for ongoing work' },
            { value: 'milestone', label: 'Milestone-Based', desc: 'Best for large projects' },
          ].map(t => (
            <button key={t.value} type="button" onClick={() => updateField('budgetType', t.value)}
              className={`flex-1 p-4 rounded-xl border text-sm transition-all ${formData.budgetType === t.value ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-gray-300'
                }`}>
              <div className="font-medium">{t.label}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </button>
          ))}
        </div>
        {errors.budgetType && <p className="text-xs text-red-500 mt-1">{errors.budgetType}</p>}
      </div>

      {formData.budgetType === 'hourly' ? (
        <div>
          <label className="text-sm font-medium mb-1.5 block">Hourly Rate (₹) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <Input type="number" value={formData.hourlyRate} onChange={e => updateField('hourlyRate', e.target.value)} placeholder="1500" className="rounded-xl pl-8" />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Minimum Budget (₹) *</label>
            <Input type="number" value={formData.budgetMin} onChange={e => updateField('budgetMin', e.target.value)} placeholder="50000" className="rounded-xl" min={5000} step={1000} />
            {errors.budgetMin && <p className="text-xs text-red-500 mt-1">{errors.budgetMin}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Maximum Budget (₹) *</label>
            <Input type="number" value={formData.budgetMax} onChange={e => updateField('budgetMax', e.target.value)} placeholder="70000" className="rounded-xl" min={Number(formData.budgetMin) + 5000} step={1000} />
            {errors.budgetMax && <p className="text-xs text-red-500 mt-1">{errors.budgetMax}</p>}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-1.5 block">Duration *</label>
        <div className="flex gap-2">
          <Input type="number" value={formData.duration} onChange={e => updateField('duration', e.target.value)} placeholder="30" className="rounded-xl flex-1" min={1} />
          <select value={formData.durationUnit} onChange={e => updateField('durationUnit', e.target.value as any)} className="rounded-xl border px-3 py-2 text-sm bg-white">
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>
        {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Milestones (Optional)</label>
          <Button variant="outline" size="sm" onClick={addMilestone}>
            <Plus className="h-4 w-4 mr-1" />Add Milestone
          </Button>
        </div>
        {formData.milestones.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
            💡 Milestones help break the project into phases. Payments are released per milestone completion.
          </div>
        )}
        {formData.milestones.map((m, idx) => (
          <div key={m.id} className="p-4 rounded-xl border mb-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Milestone {idx + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => removeMilestone(m.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
            <Input value={m.title} onChange={e => updateMilestone(m.id, { title: e.target.value })} placeholder="Title" className="rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <Input type="number" value={m.amount || ''} onChange={e => updateMilestone(m.id, { amount: Number(e.target.value) })} placeholder="Amount" className="rounded-xl pl-8" />
              </div>
              <Input type="number" value={m.deadlineDay || ''} onChange={e => updateMilestone(m.id, { deadlineDay: Number(e.target.value) })} placeholder={`Day (1-${formData.duration || 30})`} className="rounded-xl" />
            </div>
            <Textarea value={m.deliverables} onChange={e => updateMilestone(m.id, { deliverables: e.target.value })} placeholder="Deliverables" rows={2} className="rounded-xl" />
          </div>
        ))}
        {formData.milestones.length > 0 && (
          <div className={`text-sm p-3 rounded-xl ${budgetMax > 0 && totalMilestone === budgetMax ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            Total Milestone Amount: ₹{totalMilestone.toLocaleString()} {budgetMax > 0 && totalMilestone === budgetMax ? '✓ Matches budget' : budgetMax > 0 ? `⚠ Budget max: ₹${budgetMax.toLocaleString()}` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// Step 4: Visibility & Attachments 
function StepVisibility({ fileInputRef, onFileSelect }: {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (files: FileList) => void
}) {
  const { formData, errors, updateField, removeAttachment } = useCreateProject();

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Visibility *</label>
        {[
          { value: 'public', label: 'Public', icon: '🌐', desc: 'Anyone can view and apply. Appears in search results.' },
          { value: 'private', label: 'Private', icon: '🔒', desc: 'Only invited candidates. Does NOT appear in search.' },
          { value: 'invite_only', label: 'Invite Only', icon: '✉️', desc: 'Only specific candidates you invite.' },
        ].map(opt => (
          <button key={opt.value} type="button" onClick={() => updateField('visibility', opt.value as any)}
            className={`w-full text-left p-4 rounded-xl border mb-2 transition-all ${formData.visibility === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
            <p className="font-medium text-sm">{opt.icon} {opt.label}</p>
            <p className="text-xs text-gray-500">{opt.desc}</p>
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Attachments (Optional)</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) onFileSelect(e.dataTransfer.files); }}
        >
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-medium">Drag & drop files here</p>
          <p className="text-xs text-gray-500 mt-1">or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">Supported: PDF, DOC, DOCX, JPG, PNG, ZIP • Max 10 files, 50MB total</p>
          <input ref={fileInputRef} type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.jpg,.png,.zip,.fig" onChange={e => e.target.files && onFileSelect(e.target.files)} />
        </div>
        {formData.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {formData.attachments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 border rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{a.fileName}</p>
                    <p className="text-xs text-gray-500">{(a.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAttachment(a.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <button type="button" onClick={() => updateField('isFeatured', !formData.isFeatured)}
          className={`w-full text-left p-4 rounded-xl border transition-all ${formData.isFeatured ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isFeatured} readOnly className="rounded" />
            <span className="text-sm font-medium">Feature this project</span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">+₹500</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 ml-6">
            📈 Featured projects appear at top of search results • Get 3x more applications
          </div>
        </button>
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={formData.termsAccepted} onChange={() => updateField('termsAccepted', !formData.termsAccepted)} className="rounded mt-1" />
          <span className="text-sm">I confirm that this is a genuine project and agree to InternHub's Terms of Service</span>
        </label>
        {errors.termsAccepted && <p className="text-xs text-red-500">{errors.termsAccepted}</p>}
      </div>
    </div>
  );
}