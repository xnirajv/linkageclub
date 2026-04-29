'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { ProjectFormStepper } from '@/components/projects/ProjectFormStepper';
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Eye, Send, Sparkles } from 'lucide-react';
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

  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title || formData.title.length < 5) e.title = 'Min 5 characters';
      if (!formData.category) e.category = 'Required';
      if (!formData.description || formData.description.length < 50) e.description = 'Min 50 characters';
    }
    if (step === 2) {
      if (formData.skills.every(s => !s.name.trim())) e.skills = 'Required';
      if (!formData.experienceLevel) e.experienceLevel = 'Required';
      if (!formData.locationType) e.locationType = 'Required';
    }
    if (step === 3) {
      if (!formData.budgetType) e.budgetType = 'Required';
      if (!formData.duration || Number(formData.duration) < 1) e.duration = 'Required';
    }
    if (step === 4) {
      if (!formData.termsAccepted) e.termsAccepted = 'Required';
    }
    store.setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatPayload = () => ({
    title: formData.title,
    category: formData.category,
    description: formData.description,
    summary: formData.summary,
    skills: formData.skills.filter(s => s.name.trim()).map(s => ({ name: s.name, level: s.proficiency, mandatory: true })),
    experienceLevel: formData.experienceLevel,
    location: { type: formData.locationType, label: formData.locationType === 'remote' ? 'Remote' : formData.location },
    budget: formData.budgetType === 'hourly' 
      ? { type: 'hourly', min: Number(formData.hourlyRate), max: Number(formData.hourlyRate), currency: 'INR' }
      : { type: formData.budgetType, min: Number(formData.budgetMin), max: Number(formData.budgetMax), currency: 'INR' },
    duration: Number(formData.duration),
    milestones: formData.milestones.filter(m => m.title).map(m => ({ title: m.title, amount: m.amount, deadline: m.deadlineDay, description: m.deliverables })),
    requirements: formData.requirements,
    visibility: formData.visibility,
    isFeatured: formData.isFeatured,
    attachments: formData.attachments.map(a => a.fileUrl),
  });

  const apiCall = async (status: string) => {
    store.setIsSubmitting(true);
    try {
      const pid = projectId || store.projectId;
      const method = pid ? 'PATCH' : 'POST';
      const endpoint = pid ? `/api/projects/${pid}` : '/api/projects';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formatPayload(), status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const newId = data.project?._id || data.data?.project?._id;
      if (newId) store.setProjectId(newId);
      return { success: true, id: newId };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      store.setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const result = await apiCall('draft');
    if (result.success) {
      store.setStatus('draft');
      router.push('/dashboard/company/my-projects');
    } else {
      alert(result.error);
    }
  };

  const handlePublish = async () => {
    if (!validateStep(4)) return;
    const result = await apiCall('open');
    if (result.success) {
      store.reset();
      router.push('/dashboard/company/my-projects');
    } else {
      alert(result.error);
    }
  };

  const milestoneTotal = formData.milestones.reduce((s, m) => s + (m.amount || 0), 0);
  const budgetMax = Number(formData.budgetMax) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-500 mb-3"><Sparkles className="h-3 w-3" />Post New Project</div>
        <h1 className="text-2xl font-bold">Create a Project</h1>
        <p className="text-gray-500 mt-1">Fill in the details to find the right talent</p>
      </div>

      <ProjectFormStepper currentStep={currentStep} totalSteps={4} steps={steps} onStepClick={(s) => s < currentStep && store.setCurrentStep(s)} errors={errors} />

      <Card className="border shadow-sm">
        <CardContent className="p-6 min-h-[400px]">
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && <Step3 />}
          {currentStep === 4 && <Step4 />}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border shadow-sm sticky bottom-4">
        <div className="flex gap-3">
          {currentStep > 1 && <Button variant="outline" onClick={() => { store.setCurrentStep(currentStep - 1); window.scrollTo(0,0); }}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>}
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />Save Draft</>}</Button>
        </div>
        <div className="flex gap-3">
          {currentStep < 4 ? (
            <Button onClick={() => { if(validateStep(currentStep)) { store.setCurrentStep(currentStep+1); window.scrollTo(0,0); } }}>Continue <ArrowRight className="h-4 w-4 ml-2" /></Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setPreviewOpen(true)}><Eye className="h-4 w-4 mr-2" />Preview</Button>
              <Button onClick={handlePublish} disabled={isSubmitting}>{isSubmitting ? 'Publishing...' : <><Send className="h-4 w-4 mr-2" />Publish</>}</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Step components (use store directly)
function Step1() { const { formData, errors, updateField } = useCreateProject(); return (
  <div className="space-y-5">
    <div><label className="text-sm font-medium mb-1.5 block">Project Title *</label><Input value={formData.title} onChange={e => updateField('title', e.target.value)} placeholder="MERN E-commerce Platform" maxLength={100} className="rounded-xl" /><p className="text-xs text-gray-400 mt-1">{formData.title.length}/100</p>{errors.title && <p className="text-xs text-red-500">{errors.title}</p>}</div>
    <div><label className="text-sm font-medium mb-1.5 block">Category *</label><select value={formData.category} onChange={e => updateField('category', e.target.value)} className="w-full rounded-xl border p-2.5 text-sm"><option value="">Select</option>{['Web','Mobile','AI/ML','Blockchain','Design','Data Science','DevOps','Other'].map(c=><option key={c}>{c}</option>)}</select>{errors.category && <p className="text-xs text-red-500">{errors.category}</p>}</div>
    <div><label className="text-sm font-medium mb-1.5 block">Description *</label><Textarea value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Describe your project..." rows={8} className="rounded-xl" /><p className="text-xs text-gray-400 mt-1">{formData.description.length}/5000</p>{errors.description && <p className="text-xs text-red-500">{errors.description}</p>}</div>
    <div><label className="text-sm font-medium mb-1.5 block">Summary</label><Input value={formData.summary} onChange={e => updateField('summary', e.target.value)} placeholder="Brief overview" maxLength={200} className="rounded-xl" /><p className="text-xs text-gray-400 mt-1">{formData.summary.length}/200</p></div>
  </div>
);}

function Step2() { const { formData, errors, updateField, addSkill, removeSkill, updateSkill } = useCreateProject(); return (
  <div className="space-y-5">
    <div><label className="text-sm font-medium mb-2 block">Skills *</label>{formData.skills.map((s,i)=>(<div key={i} className="flex gap-2 mb-2"><Input value={s.name} onChange={e=>updateSkill(i,{name:e.target.value})} placeholder="React.js" className="rounded-xl flex-1" /><select value={s.proficiency} onChange={e=>updateSkill(i,{proficiency:e.target.value as any})} className="rounded-xl border p-2 text-sm"><option>beginner</option><option>intermediate</option><option>advanced</option></select><Button variant="ghost" size="icon" onClick={()=>removeSkill(i)} disabled={formData.skills.length<=1}><Trash2 className="h-4 w-4 text-red-500"/></Button></div>))}{formData.skills.length<10&&<Button variant="outline" size="sm" onClick={()=>addSkill({name:'',proficiency:'intermediate'})}><Plus className="h-4 w-4 mr-1"/>Add Skill</Button>}{errors.skills&&<p className="text-xs text-red-500">{errors.skills}</p>}</div>
    <div><label className="text-sm font-medium mb-2 block">Experience *</label><div className="grid grid-cols-4 gap-3">{['beginner','intermediate','advanced','any'].map(l=>(<button key={l} onClick={()=>updateField('experienceLevel',l as any)} className={`p-3 rounded-xl border text-sm capitalize ${formData.experienceLevel===l?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200'}`}>{l}</button>))}</div></div>
    <div><label className="text-sm font-medium mb-2 block">Location *</label><div className="flex gap-3">{['remote','onsite','hybrid'].map(t=>(<button key={t} onClick={()=>updateField('locationType',t as any)} className={`flex-1 p-3 rounded-xl border text-sm capitalize ${formData.locationType===t?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200'}`}>{t}</button>))}</div>{(formData.locationType==='onsite'||formData.locationType==='hybrid')&&<Input value={formData.location} onChange={e=>updateField('location',e.target.value)} placeholder="City" className="rounded-xl mt-3"/>}</div>
  </div>
);}

function Step3() { const { formData, updateField, addMilestone, removeMilestone, updateMilestone } = useCreateProject(); const total = formData.milestones.reduce((s,m)=>s+(m.amount||0),0); const max = Number(formData.budgetMax)||0; return (
  <div className="space-y-5">
    <div><label className="text-sm font-medium mb-2 block">Budget Type *</label><div className="flex gap-3">{['fixed','hourly','milestone'].map(t=>(<button key={t} onClick={()=>updateField('budgetType',t as any)} className={`flex-1 p-4 rounded-xl border text-sm capitalize ${formData.budgetType===t?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200'}`}>{t}</button>))}</div></div>
    {formData.budgetType==='hourly'?<div><label className="text-sm font-medium mb-1.5 block">Hourly Rate (₹)</label><Input type="number" value={formData.hourlyRate} onChange={e=>updateField('hourlyRate',e.target.value)} placeholder="1500" className="rounded-xl"/></div>:<div className="grid grid-cols-2 gap-4"><Input type="number" value={formData.budgetMin} onChange={e=>updateField('budgetMin',e.target.value)} placeholder="Min ₹" className="rounded-xl"/><Input type="number" value={formData.budgetMax} onChange={e=>updateField('budgetMax',e.target.value)} placeholder="Max ₹" className="rounded-xl"/></div>}
    <div className="flex gap-2"><Input type="number" value={formData.duration} onChange={e=>updateField('duration',e.target.value)} placeholder="30" className="rounded-xl flex-1" min="1"/><select value={formData.durationUnit} onChange={e=>updateField('durationUnit',e.target.value as any)} className="rounded-xl border p-2 text-sm"><option value="days">Days</option><option value="weeks">Weeks</option></select></div>
    <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Milestones</label><Button variant="outline" size="sm" onClick={addMilestone}><Plus className="h-4 w-4 mr-1"/>Add</Button></div>{formData.milestones.map(m=>(<div key={m.id} className="p-4 rounded-xl border mb-3 space-y-3"><div className="flex justify-between"><span className="text-sm font-medium">Milestone</span><Button variant="ghost" size="icon" onClick={()=>removeMilestone(m.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button></div><Input value={m.title} onChange={e=>updateMilestone(m.id,{title:e.target.value})} placeholder="Title" className="rounded-xl"/><div className="grid grid-cols-2 gap-3"><Input type="number" value={m.amount||''} onChange={e=>updateMilestone(m.id,{amount:Number(e.target.value)})} placeholder="Amount ₹" className="rounded-xl"/><Input type="number" value={m.deadlineDay||''} onChange={e=>updateMilestone(m.id,{deadlineDay:Number(e.target.value)})} placeholder="Day" className="rounded-xl"/></div><Textarea value={m.deliverables} onChange={e=>updateMilestone(m.id,{deliverables:e.target.value})} placeholder="Deliverables" rows={2} className="rounded-xl"/></div>))}{formData.milestones.length>0&&<div className="text-sm text-gray-500">Total: ₹{total.toLocaleString()} {max>0&&total===max&&<span className="text-green-600">✓</span>}</div>}</div>
  </div>
);}

function Step4() { const { formData, updateField, errors } = useCreateProject(); return (
  <div className="space-y-5">
    <div><label className="text-sm font-medium mb-2 block">Visibility *</label>{[{value:'public',label:'Public',desc:'Anyone can view and apply'},{value:'private',label:'Private',desc:'Only invited candidates'},{value:'invite',label:'Invite Only',desc:'Specific candidates only'}].map(o=>(<button key={o.value} onClick={()=>updateField('visibility',o.value as any)} className={`w-full text-left p-4 rounded-xl border mb-2 ${formData.visibility===o.value?'border-blue-500 bg-blue-50':'border-gray-200'}`}><p className="font-medium text-sm">{o.label}</p><p className="text-xs text-gray-500">{o.desc}</p></button>))}</div>
    <button onClick={()=>updateField('isFeatured',!formData.isFeatured)} className={`w-full text-left p-4 rounded-xl border ${formData.isFeatured?'border-blue-500 bg-blue-50':'border-gray-200'}`}><p className="text-sm flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} readOnly className="rounded"/>Feature this project (+₹500)</p></button>
    <button onClick={()=>updateField('termsAccepted',!formData.termsAccepted)} className={`w-full text-left p-4 rounded-xl border ${formData.termsAccepted?'border-blue-500 bg-blue-50':'border-gray-200'}`}><p className="text-sm flex items-center gap-2"><input type="checkbox" checked={formData.termsAccepted} readOnly className="rounded"/>I agree to Terms of Service</p></button>
    {errors.termsAccepted&&<p className="text-xs text-red-500">{errors.termsAccepted}</p>}
  </div>
);}