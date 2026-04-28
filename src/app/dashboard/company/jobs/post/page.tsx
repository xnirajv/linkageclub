'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Send } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';

export default function PostJobPage() {
  const router = useRouter();
  const { createJob } = useJobs() as any;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', location: 'Remote', type: 'full-time',
    salaryMin: '', salaryMax: '', experienceMin: '', experienceMax: '',
    skills: [] as string[], benefits: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    await createJob({
      title: form.title, description: form.description, location: form.location, type: form.type,
      salary: { min: Number(form.salaryMin), max: Number(form.salaryMax), currency: 'INR', period: 'year' },
      experience: { min: Number(form.experienceMin), max: Number(form.experienceMax), level: 'mid' },
      skills: form.skills.map(s => ({ name: s, level: 'intermediate', mandatory: true })),
      benefits: form.benefits, openings: 1,
    });
    setSubmitting(false);
    router.push('/dashboard/company/jobs');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/company/jobs"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div><h1 className="text-2xl font-bold">Post Job</h1><p className="text-gray-500">Create a new job listing</p></div>
      </div>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Title *</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Senior Developer" className="rounded-xl" /></div>
          <div><label className="text-sm font-medium mb-1 block">Description *</label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Job description..." rows={4} className="rounded-xl" /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-xl" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input type="number" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} placeholder="Min salary" className="rounded-xl" />
            <Input type="number" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} placeholder="Max salary" className="rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add skill" className="rounded-xl" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (skillInput.trim()) { setForm({ ...form, skills: [...form.skills, skillInput.trim()] }); setSkillInput(''); } } }} />
            <Button variant="outline" size="sm" onClick={() => { if (skillInput.trim()) { setForm({ ...form, skills: [...form.skills, skillInput.trim()] }); setSkillInput(''); } }}><Plus className="h-4 w-4" /></Button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills.map(s => <Badge key={s} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setForm({ ...form, skills: form.skills.filter(x => x !== s) })}>{s} <X className="h-3 w-3" /></Badge>)}
            </div>
          )}
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? 'Posting...' : <><Send className="h-4 w-4 mr-2" />Post Job</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}