'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // ✅ Fixed import path
import { Button } from '@/components/ui/button'; // ✅ Fixed import path
import { Badge } from '@/components/ui/badge'; // ✅ Fixed import path
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Building, Globe, Users, Target, X, Save } from 'lucide-react';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  startupName?: string;
  startupDescription?: string;
  industry?: string;
  stage?: string;
  website?: string;
  lookingFor?: string[];
}

interface ProfileForm {
  startupName: string;
  startupDescription: string;
  industry: string;
  stage: string;
  website: string;
  lookingFor: string[];
}

export function StartupProfile() {
  const { user } = useAuth() as { user: User | null };
  const { updateProfile, isUpdating } = useProfile();
  
  const [form, setForm] = useState<ProfileForm>({
    startupName: user?.startupName || '',
    startupDescription: user?.startupDescription || '',
    industry: user?.industry || '',
    stage: user?.stage || 'idea',
    website: user?.website || '',
    lookingFor: user?.lookingFor || [],
  });
  
  const [lookingInput, setLookingInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setForm({
        startupName: user.startupName || '',
        startupDescription: user.startupDescription || '',
        industry: user.industry || '',
        stage: user.stage || 'idea',
        website: user.website || '',
        lookingFor: user.lookingFor || [],
      });
    }
  }, [user]);

  const STAGES = ['idea', 'mvp', 'early-stage', 'growth', 'scaling'];
  const INDUSTRIES = ['Fintech', 'Edtech', 'Healthtech', 'SaaS', 'E-commerce', 'AI/ML', 'Other'];

  const addLooking = () => {
    const trimmed = lookingInput.trim();
    if (trimmed && !form.lookingFor.includes(trimmed)) {
      setForm({ ...form, lookingFor: [...form.lookingFor, trimmed] });
      setLookingInput('');
    }
  };

  const removeLooking = (item: string) => {
    setForm({ ...form, lookingFor: form.lookingFor.filter(l => l !== item) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLooking();
    }
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    try {
      await updateProfile(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary-600" />
            <CardTitle>Startup Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="startupName" className="block text-sm font-medium mb-1">
              Startup Name
            </label>
            <input
              id="startupName"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={form.startupName}
              onChange={(e) => setForm({ ...form, startupName: e.target.value })}
              placeholder="Your startup name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="What problem does your startup solve? What's your solution?"
              value={form.startupDescription}
              onChange={(e) => setForm({ ...form, startupDescription: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium mb-1">
                Industry
              </label>
              <select
                id="industry"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="stage" className="block text-sm font-medium mb-1">
                Stage
              </label>
              <select
                id="stage"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background capitalize focus:ring-2 focus:ring-primary-500"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-1 flex items-center gap-1">
              <Globe className="h-4 w-4" /> Website
            </label>
            <input
              id="website"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500"
              placeholder="https://www.yourstartup.com"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600" />
            <CardTitle>Looking For</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            What kind of co-founder or team member are you looking for?
          </p>
          
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. CTO, Designer, Marketing Lead"
              value={lookingInput}
              onChange={(e) => setLookingInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button variant="outline" size="sm" onClick={addLooking}>
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-1 mt-3">
            {form.lookingFor.map((item) => (
              <Badge key={item} variant="skill" className="gap-1 py-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeLooking(item)}
                />
              </Badge>
            ))}
            {form.lookingFor.length === 0 && (
              <p className="text-sm text-charcoal-400 italic">No preferences added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={isUpdating} className="gap-2">
          <Save className="h-4 w-4" />
          {isUpdating ? 'Saving...' : 'Save Startup Profile'}
        </Button>
        {saveSuccess && (
          <span className="text-sm text-green-600 animate-fade-in">
            ✓ Profile saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}