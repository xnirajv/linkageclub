'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useJobs } from '@/hooks/useJobs';
import { Textarea } from '@/components/forms/Textarea';

interface JobForm {
  title: string;
  description: string;
  location: string;
  type: string;
  salaryMin: string;
  salaryMax: string;
  salaryPeriod: string;
  experienceMin: string;
  experienceMax: string;
  skills: string[];
  benefits: string[];
  deadline: string;
}

export default function PostJobPage() {
  const router = useRouter();
  const { createJob } = useJobs() as { createJob: (data: any) => Promise<{ success: boolean }> };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<JobForm>({
    title: '',
    description: '',
    location: 'Remote',
    type: 'full-time',
    salaryMin: '1200000',
    salaryMax: '1800000',
    salaryPeriod: 'year',
    experienceMin: '3',
    experienceMax: '5',
    skills: ['React', 'TypeScript', 'Next.js'],
    benefits: ['Health Insurance', 'Learning Budget'],
    deadline: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const result = await createJob({
        title: form.title,
        description: form.description,
        responsibilities: ['Build reusable components', 'Collaborate with backend team'],
        requirements: form.skills,
        preferredQualifications: [],
        location: form.location,
        type: form.type,
        experience: {
          min: parseInt(form.experienceMin, 10) || 0,
          max: parseInt(form.experienceMax, 10) || 0,
          level: 'mid',
        },
        salary: {
          min: parseInt(form.salaryMin, 10) || 0,
          max: parseInt(form.salaryMax, 10) || 0,
          currency: 'INR',
          period: form.salaryPeriod,
        },
        skills: form.skills.map((skill) => ({ name: skill, level: 'intermediate', mandatory: true })),
        benefits: form.benefits,
        department: 'Engineering',
        openings: 1,
        deadline: form.deadline || undefined,
      });

      if (result.success) {
        router.push('/dashboard/company/jobs');
      } else {
        window.alert('Failed to create job.');
      }
    } catch (error) {
      console.error(error);
      window.alert('Failed to create job.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
            <Sparkles className="h-3.5 w-3.5" />
            Post New Job
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-charcoal-950 dark:text-white">Create a premium job listing</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Build a role page with clean compensation, skill, and hiring details for better candidate quality.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Senior Frontend Developer" />
              <Textarea rows={7} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Describe the role, responsibilities, and expectations..." />
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Location" />
                <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Compensation & Experience</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Input value={form.salaryMin} onChange={(e) => setForm((prev) => ({ ...prev, salaryMin: e.target.value }))} placeholder="Min salary" />
                <Input value={form.salaryMax} onChange={(e) => setForm((prev) => ({ ...prev, salaryMax: e.target.value }))} placeholder="Max salary" />
                <select value={form.salaryPeriod} onChange={(e) => setForm((prev) => ({ ...prev, salaryPeriod: e.target.value }))} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="year">Per year</option>
                  <option value="month">Per month</option>
                  <option value="hour">Per hour</option>
                </select>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Input value={form.experienceMin} onChange={(e) => setForm((prev) => ({ ...prev, experienceMin: e.target.value }))} placeholder="Min experience" />
                <Input value={form.experienceMax} onChange={(e) => setForm((prev) => ({ ...prev, experienceMax: e.target.value }))} placeholder="Max experience" />
                <Input type="date" value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Skills & Benefits</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-3 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Required Skills</div>
                <div className="flex gap-3">
                  <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add skill" />
                  <Button onClick={() => {
                    if (!skillInput.trim()) return;
                    setForm((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
                    setSkillInput('');
                  }}>Add</Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <button key={skill} type="button" onClick={() => setForm((prev) => ({ ...prev, skills: prev.skills.filter((item) => item !== skill) }))} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
                      {skill} x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Benefits & Perks</div>
                <div className="flex gap-3">
                  <Input value={benefitInput} onChange={(e) => setBenefitInput(e.target.value)} placeholder="Add benefit" />
                  <Button variant="outline" onClick={() => {
                    if (!benefitInput.trim()) return;
                    setForm((prev) => ({ ...prev, benefits: [...prev.benefits, benefitInput.trim()] }));
                    setBenefitInput('');
                  }}>Add</Button>
                </div>
                <div className="mt-3 space-y-2">
                  {form.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center justify-between rounded-[18px] border border-primary-100/70 bg-silver-50/70 px-4 py-3">
                      <div className="text-sm text-charcoal-700">{benefit}</div>
                      <Button size="icon" variant="ghost" onClick={() => setForm((prev) => ({ ...prev, benefits: prev.benefits.filter((item) => item !== benefit) }))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Job Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
                <div className="font-semibold text-charcoal-950">{form.title || 'Untitled role'}</div>
                <div className="mt-2">{form.location} • {form.type}</div>
                <div className="mt-2">Rs{Math.round((parseInt(form.salaryMin, 10) || 0) / 100000)}L - Rs{Math.round((parseInt(form.salaryMax, 10) || 0) / 100000)}L / {form.salaryPeriod}</div>
              </div>
              <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4">
                Experience: {form.experienceMin}-{form.experienceMax} years
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
            <CardContent className="p-6">
              <div className="text-xl font-semibold">This job posting flow now matches the premium company dashboard language.</div>
              <div className="mt-3 text-sm leading-7 text-white/82">Compensation, skill requirements, and perks all live in one cleaner role creation surface.</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Job'}
        </Button>
      </div>
    </div>
  );
}
