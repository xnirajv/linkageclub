'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectFormStepper } from '@/components/projects/ProjectFormStepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, Save, ArrowLeft, ArrowRight, Eye, Send,
  Upload, X, Check, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useCreateProject } from '@/hooks/useCreateProjects';

const steps = [
  { title: 'Basic Info', subtitle: 'Title & Category' },
  { title: 'Skills & Req.', subtitle: 'Skills & Location' },
  { title: 'Budget', subtitle: 'Budget & Timeline' },
  { title: 'Visibility', subtitle: 'Attachments' },
];

export default function PostProjectPage() {
  const router = useRouter();
  const {
    currentStep, formData, errors, isSubmitting,
    setCurrentStep, updateField, addSkill, removeSkill, updateSkill,
    addMilestone, removeMilestone, updateMilestone,
    addAttachment, removeAttachment,
    setErrors, clearErrors, setIsSubmitting, setProjectId, setStatus, reset,
  } = useCreateProject();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title || formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
      if (!formData.category) newErrors.category = 'Please select a category';
      if (!formData.description || formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
    }
    if (step === 2) {
      if (formData.skills.every(s => !s.name.trim())) newErrors.skills = 'At least 1 skill is required';
      if (!formData.experienceLevel) newErrors.experienceLevel = 'Please select experience level';
      if (!formData.locationType) newErrors.locationType = 'Please select location type';
    }
    if (step === 3) {
      if (!formData.budgetType) newErrors.budgetType = 'Please select budget type';
      if (!formData.duration || Number(formData.duration) < 1) newErrors.duration = 'Duration must be at least 1 day';
      if (formData.budgetType !== 'hourly') {
        if (!formData.budgetMin || Number(formData.budgetMin) < 5000) newErrors.budgetMin = 'Min budget must be at least ₹5,000';
        if (!formData.budgetMax || Number(formData.budgetMax) <= Number(formData.budgetMin)) newErrors.budgetMax = 'Max budget must be greater than min';
      }
    }
    if (step === 4) {
      if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'draft' }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjectId(data.project?._id || data.data?.project?._id);
        setStatus('draft');
        router.push('/dashboard/company/my-projects?tab=draft');
      }
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    try {
      // ✅ FIX: Use store's projectId, not formData.projectId
      const projectId = useCreateProject.getState().projectId;
      const endpoint = projectId
        ? `/api/projects/${projectId}`
        : '/api/projects';
      const method = projectId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'open' }),
      });

      if (res.ok) {
        reset();
        router.push('/dashboard/company/my-projects?tab=active');
      }
    } catch (err) {
      console.error('Failed to publish:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const milestoneTotal = formData.milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const budgetMax = Number(formData.budgetMax) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-3 py-1 text-xs font-medium text-gray-500 mb-3">
          <Sparkles className="h-3 w-3" />Post New Project
        </div>
        <h1 className="text-2xl font-bold">Create a Project</h1>
        <p className="text-gray-500 mt-1">Fill in the details to find the right talent</p>
      </div>

      <ProjectFormStepper currentStep={currentStep} totalSteps={4} steps={steps} onStepClick={(s) => isCompleted(s) && setCurrentStep(s)} errors={errors} />

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-6 min-h-[400px]">
          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Project Title *</label>
                <Input value={formData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="e.g., MERN E-commerce Platform" maxLength={100} className="rounded-xl" />
                <p className="text-xs text-gray-400 mt-1">{formData.title.length}/100</p>
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category *</label>
                <select value={formData.category} onChange={(e) => updateField('category', e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm">
                  <option value="">Select category</option>
                  {['Web Development', 'Mobile App Development', 'AI / Machine Learning', 'Blockchain / Web3', 'UI/UX Design', 'Data Science', 'Cybersecurity', 'DevOps & Cloud', 'Game Development', 'IoT & Embedded', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description *</label>
                <Textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe your project in detail...&#10;• What are the goals?&#10;• What features are needed?&#10;• Any specific requirements?" rows={8} className="rounded-xl resize-none" />
                <p className="text-xs text-gray-400 mt-1">{formData.description.length}/5000 (min 50)</p>
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Summary</label>
                <Input value={formData.summary} onChange={(e) => updateField('summary', e.target.value)} placeholder="A short summary shown in project cards..." maxLength={200} className="rounded-xl" />
                <p className="text-xs text-gray-400 mt-1">{formData.summary.length}/200</p>
              </div>
            </div>
          )}

          {/* STEP 2: SKILLS & REQUIREMENTS */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Skills Required *</label>
                {formData.skills.map((skill, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={skill.name} onChange={(e) => updateSkill(i, { name: e.target.value })} placeholder="e.g., React.js" className="rounded-xl flex-1" />
                    <select value={skill.proficiency} onChange={(e) => updateSkill(i, { proficiency: e.target.value as any })} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                      <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                    </select>
                    <Button variant="ghost" size="icon" onClick={() => removeSkill(i)} disabled={formData.skills.length <= 1}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ))}
                {formData.skills.length < 10 && (
                  <Button variant="outline" size="sm" onClick={() => addSkill({ name: '', proficiency: 'intermediate' })}><Plus className="h-4 w-4 mr-1" />Add Skill</Button>
                )}
                {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Experience Level *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['beginner', 'intermediate', 'advanced', 'any'].map((level) => (
                    <button key={level} type="button" onClick={() => updateField('experienceLevel', level as any)}
                      className={`p-3 rounded-xl border text-sm capitalize transition-all ${formData.experienceLevel === level ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>
                      {level}
                    </button>
                  ))}
                </div>
                {errors.experienceLevel && <p className="text-xs text-red-500 mt-1">{errors.experienceLevel}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location Preference *</label>
                <div className="flex gap-3">
                  {['remote', 'onsite', 'hybrid'].map((type) => (
                    <button key={type} type="button" onClick={() => updateField('locationType', type as any)}
                      className={`flex-1 p-3 rounded-xl border text-sm capitalize transition-all ${formData.locationType === type ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                {(formData.locationType === 'onsite' || formData.locationType === 'hybrid') && (
                  <Input value={formData.location} onChange={(e) => updateField('location', e.target.value)} placeholder="City, Country" className="rounded-xl mt-3" />
                )}
                {errors.locationType && <p className="text-xs text-red-500 mt-1">{errors.locationType}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET & TIMELINE */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Budget Type *</label>
                <div className="flex gap-3">
                  {['fixed', 'hourly', 'milestone'].map((type) => (
                    <button key={type} type="button" onClick={() => updateField('budgetType', type as any)}
                      className={`flex-1 p-4 rounded-xl border text-sm capitalize transition-all ${formData.budgetType === type ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                {errors.budgetType && <p className="text-xs text-red-500 mt-1">{errors.budgetType}</p>}
              </div>
              {formData.budgetType === 'hourly' ? (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Hourly Rate (₹) *</label>
                  <Input type="number" value={formData.hourlyRate} onChange={(e) => updateField('hourlyRate', e.target.value)} placeholder="1500" className="rounded-xl" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div><label className="text-sm font-medium mb-1.5 block">Min Budget (₹) *</label><Input type="number" value={formData.budgetMin} onChange={(e) => updateField('budgetMin', e.target.value)} placeholder="50000" className="rounded-xl" />{errors.budgetMin && <p className="text-xs text-red-500 mt-1">{errors.budgetMin}</p>}</div>
                  <div><label className="text-sm font-medium mb-1.5 block">Max Budget (₹) *</label><Input type="number" value={formData.budgetMax} onChange={(e) => updateField('budgetMax', e.target.value)} placeholder="70000" className="rounded-xl" />{errors.budgetMax && <p className="text-xs text-red-500 mt-1">{errors.budgetMax}</p>}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Duration *</label>
                <div className="flex gap-2">
                  <Input type="number" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)} placeholder="30" className="rounded-xl flex-1" min="1" max="365" />
                  <select value={formData.durationUnit} onChange={(e) => updateField('durationUnit', e.target.value as any)} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                    <option value="days">Days</option><option value="weeks">Weeks</option><option value="months">Months</option>
                  </select>
                </div>
                {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Milestones (Optional)</label>
                  <Button variant="outline" size="sm" onClick={addMilestone}><Plus className="h-4 w-4 mr-1" />Add</Button>
                </div>
                {formData.milestones.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-3 space-y-3">
                    <div className="flex items-center justify-between"><span className="text-sm font-medium">Milestone</span><Button variant="ghost" size="icon" onClick={() => removeMilestone(m.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div>
                    <Input value={m.title} onChange={(e) => updateMilestone(m.id, { title: e.target.value })} placeholder="Title" className="rounded-xl" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="number" value={m.amount || ''} onChange={(e) => updateMilestone(m.id, { amount: Number(e.target.value) })} placeholder="Amount (₹)" className="rounded-xl" />
                      <Input type="number" value={m.deadlineDay || ''} onChange={(e) => updateMilestone(m.id, { deadlineDay: Number(e.target.value) })} placeholder="Deadline Day" className="rounded-xl" />
                    </div>
                    <Textarea value={m.deliverables} onChange={(e) => updateMilestone(m.id, { deliverables: e.target.value })} placeholder="Deliverables" rows={2} className="rounded-xl" />
                  </div>
                ))}
                {formData.milestones.length > 0 && (
                  <div className="text-sm text-gray-500 mt-2">
                    Total: ₹{milestoneTotal.toLocaleString()} {budgetMax > 0 && milestoneTotal !== budgetMax && <span className="text-yellow-600">(Budget: ₹{budgetMax.toLocaleString()})</span>}
                    {budgetMax > 0 && milestoneTotal === budgetMax && <span className="text-green-600">✓ Matches budget</span>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: VISIBILITY & ATTACHMENTS */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Visibility *</label>
                {[
                  { value: 'public', label: 'Public', desc: 'Anyone can view and apply' },
                  { value: 'private', label: 'Private', desc: 'Only invited candidates' },
                  { value: 'invite', label: 'Invite Only', desc: 'Specific candidates only' },
                ].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => updateField('visibility', opt.value as any)}
                    className={`w-full text-left p-4 rounded-xl border mb-2 transition-all ${formData.visibility === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <p className="font-medium text-sm">{opt.label}</p><p className="text-xs text-gray-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Featured Listing</label>
                <button type="button" onClick={() => updateField('isFeatured', !formData.isFeatured)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${formData.isFeatured ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className="font-medium text-sm flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} readOnly className="rounded" />Feature this project</p>
                  <p className="text-xs text-gray-500 mt-1">+₹500 • Get 3x more applications</p>
                </button>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Attachments</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Drag & drop files here, or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10 files, 50 MB total (PDF, DOC, JPG, PNG, ZIP)</p>
                </div>
              </div>
              <div>
                <button type="button" onClick={() => updateField('termsAccepted', !formData.termsAccepted)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${formData.termsAccepted ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className="text-sm flex items-center gap-2"><input type="checkbox" checked={formData.termsAccepted} readOnly className="rounded" />I confirm this is a genuine project and agree to InternHub's Terms of Service</p>
                </button>
                {errors.termsAccepted && <p className="text-xs text-red-500 mt-1">{errors.termsAccepted}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BOTTOM NAVIGATION */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          )}
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}><Save className="h-4 w-4 mr-2" />Save Draft</Button>
        </div>
        <div className="flex gap-3">
          {currentStep < 4 ? (
            <Button onClick={handleNext}>Continue <ArrowRight className="h-4 w-4 ml-2" /></Button>
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
    </div>
  );
}

function isCompleted(step: number): boolean {
  return step < (useCreateProject.getState?.()?.currentStep || 1);
}