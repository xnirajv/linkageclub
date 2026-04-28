'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { X, Plus, Briefcase, DollarSign, Tag, Send } from 'lucide-react';
import { useProjectActions } from '@/hooks/useProjects';

const categories = ['Web Development', 'Mobile Development', 'AI / ML', 'Data Science', 'DevOps', 'Design', 'Content Writing', 'Marketing', 'Other'];

export function ProjectPostForm() {
  const router = useRouter();
  const { createProject } = useProjectActions();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', experienceLevel: 'intermediate',
    budgetMin: '', budgetMax: '', duration: '',
    requirements: [] as string[], skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    await createProject({
      title: form.title, description: form.description, category: form.category,
      skills: form.skills.map(name => ({ name, level: form.experienceLevel, mandatory: false })),
      budget: { min: Number(form.budgetMin), max: Number(form.budgetMax), type: 'fixed', currency: 'INR' },
      duration: Number(form.duration), requirements: form.requirements,
      experienceLevel: form.experienceLevel, visibility: 'public',
    });
    setSubmitting(false);
    router.push('/dashboard/company/my-projects');
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Project title" className="rounded-xl" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Description *</label>
          <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your project..." rows={4} className="rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="">Select</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Experience</label>
            <select value={form.experienceLevel} onChange={e => setForm({ ...form, experienceLevel: e.target.value })} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input type="number" value={form.budgetMin} onChange={e => setForm({ ...form, budgetMin: e.target.value })} placeholder="Min budget" className="rounded-xl" />
          <Input type="number" value={form.budgetMax} onChange={e => setForm({ ...form, budgetMax: e.target.value })} placeholder="Max budget" className="rounded-xl" />
          <Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="Duration (days)" className="rounded-xl" />
        </div>
        <div className="flex gap-2">
          <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add skill" className="rounded-xl" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (skillInput.trim()) { setForm({ ...form, skills: [...form.skills, skillInput.trim()] }); setSkillInput(''); } } }} />
          <Button variant="outline" size="sm" onClick={() => { if (skillInput.trim()) { setForm({ ...form, skills: [...form.skills, skillInput.trim()] }); setSkillInput(''); } }}><Plus className="h-4 w-4" /></Button>
        </div>
        {form.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setForm({ ...form, skills: form.skills.filter(s => s !== skill) })}>{skill} <X className="h-3 w-3" /></Badge>
            ))}
          </div>
        )}
        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? 'Posting...' : <><Send className="h-4 w-4 mr-2" />Post Project</>}
        </Button>
      </CardContent>
    </Card>
  );
}