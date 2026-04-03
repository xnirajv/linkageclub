'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { X, Plus, Briefcase, DollarSign, Clock, Tag, Sparkles, ChevronDown, ChevronUp, Rocket, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Web Development', 'Mobile', 'Data Science', 'AI/ML', 'DevOps', 'Design', 'Other'];
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'];

export function ProjectPostForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    experienceLevel: 'intermediate',
    budgetMin: '',
    budgetMax: '',
    budgetType: 'fixed',
    duration: '',
    requirements: [] as string[],
    skills: [] as string[],
    tags: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    budget: true,
    skills: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const addReq = () => {
    if (reqInput.trim()) {
      setForm({ ...form, requirements: [...form.requirements, reqInput.trim()] });
      setReqInput('');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          budget: {
            min: Number(form.budgetMin),
            max: Number(form.budgetMax),
            type: form.budgetType,
            currency: 'INR',
          },
          duration: Number(form.duration),
          skills: form.skills.map((s) => ({ name: s, level: 'intermediate', mandatory: false })),
        }),
      });
      if (response.ok) {
        router.push('/dashboard/company/my-projects');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = form.title && form.description && form.category;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-charcoal-950 to-charcoal-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Post New Project
        </h1>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1 flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          Create a project and find the right talent
        </p>
      </div>

      {/* Project Details Section */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('details')}
          className="w-full p-5 flex items-center justify-between hover:bg-charcoal-100/50 dark:hover:bg-charcoal-800/50 transition-colors"
        >
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <Briefcase className="h-4 w-4 text-primary-600" />
            </div>
            Project Details
          </CardTitle>
          {expandedSections.details ? (
            <ChevronUp className="h-5 w-5 text-charcoal-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-charcoal-400" />
          )}
        </button>
        
        {expandedSections.details && (
          <CardContent className="p-5 pt-0 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Project Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., E-commerce Website Development"
                className="rounded-xl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your project in detail..."
                rows={6}
                className="resize-none rounded-xl"
              />
              <p className="text-xs text-charcoal-400 mt-1">
                {form.description.length}/2000 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-card dark:bg-charcoal-800 px-4 py-2.5 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Experience Level</label>
                <select
                  className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-card dark:bg-charcoal-800 px-4 py-2.5 text-sm capitalize"
                  value={form.experienceLevel}
                  onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                >
                  {EXPERIENCE_LEVELS.map((l) => <option key={l} className="capitalize">{l}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Budget & Duration Section */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('budget')}
          className="w-full p-5 flex items-center justify-between hover:bg-charcoal-100/50 dark:hover:bg-charcoal-800/50 transition-colors"
        >
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <DollarSign className="h-4 w-4 text-primary-600" />
            </div>
            Budget & Duration
          </CardTitle>
          {expandedSections.budget ? (
            <ChevronUp className="h-5 w-5 text-charcoal-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-charcoal-400" />
          )}
        </button>
        
        {expandedSections.budget && (
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Budget Type</label>
                <select
                  className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-card dark:bg-charcoal-800 px-3 py-2 text-sm"
                  value={form.budgetType}
                  onChange={(e) => setForm({ ...form, budgetType: e.target.value })}
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="milestone">Milestone Based</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Min Budget (₹)</label>
                <Input
                  type="number"
                  value={form.budgetMin}
                  onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                  placeholder="5000"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Max Budget (₹)</label>
                <Input
                  type="number"
                  value={form.budgetMax}
                  onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                  placeholder="10000"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Duration (days)</label>
              <Input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="30"
                className="rounded-xl"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Skills Required Section */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('skills')}
          className="w-full p-5 flex items-center justify-between hover:bg-charcoal-100/50 dark:hover:bg-charcoal-800/50 transition-colors"
        >
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <Tag className="h-4 w-4 text-primary-600" />
            </div>
            Skills & Requirements
          </CardTitle>
          {expandedSections.skills ? (
            <ChevronUp className="h-5 w-5 text-charcoal-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-charcoal-400" />
          )}
        </button>
        
        {expandedSections.skills && (
          <CardContent className="p-5 pt-0 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">Skills Required</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python)"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="rounded-xl"
                />
                <Button variant="outline" size="sm" onClick={addSkill} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <Badge key={skill} variant="skill" className="gap-1.5 py-1.5">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => setForm({ ...form, skills: form.skills.filter((s) => s !== skill) })}
                    />
                  </Badge>
                ))}
                {form.skills.length === 0 && (
                  <p className="text-sm text-charcoal-400">No skills added yet</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Requirements</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  placeholder="Add a requirement"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReq())}
                  className="rounded-xl"
                />
                <Button variant="outline" size="sm" onClick={addReq} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="space-y-1">
                {form.requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 bg-charcoal-100/50 dark:bg-charcoal-800 rounded-lg">
                    <span className="flex-1">{req}</span>
                    <X
                      className="h-3 w-3 cursor-pointer text-charcoal-400 hover:text-red-500"
                      onClick={() => setForm({ ...form, requirements: form.requirements.filter((_, idx) => idx !== i) })}
                    />
                  </div>
                ))}
                {form.requirements.length === 0 && (
                  <p className="text-sm text-charcoal-400">No requirements added yet</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Tags (Optional)</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="rounded-xl"
                />
                <Button variant="outline" size="sm" onClick={addTag} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1.5">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pro Tip Banner */}
      <Card className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20 border border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-primary-800 dark:text-primary-300">
              <strong>Pro tip:</strong> Adding more skills and clear requirements helps you attract better quality applicants.
            </p>
          </div>
        </div>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-3 justify-end sticky bottom-4 bg-card dark:bg-charcoal-900 p-4 rounded-xl border shadow-lg">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !isValid}
          className="gap-2 bg-primary-600 hover:bg-primary-700"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Post Project
            </>
          )}
        </Button>
      </div>
    </div>
  );
}