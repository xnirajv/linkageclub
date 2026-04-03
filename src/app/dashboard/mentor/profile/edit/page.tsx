'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvailabilityCalendar } from '@/components/dashboard/mentor/AvailabilityCalendar';
import { useAuth } from '@/hooks/useAuth';
import { useMentor } from '@/hooks/useMentors';
import { useRouter } from 'next/navigation';
import { X, Plus, Save, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';
import { IMentor } from '@/lib/db/models/mentor';


type ExpertiseLevel = 'intermediate' | 'advanced' | 'expert';
type AvailabilityType = 'weekdays' | 'evenings' | 'weekends' | 'flexible';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

const AVAILABILITY_TYPES: AvailabilityType[] = ['weekdays', 'evenings', 'weekends', 'flexible'];
const TIMEZONES = [
  'Asia/Kolkata', 
  'UTC', 
  'America/New_York', 
  'Europe/London', 
  'Australia/Sydney', 
  'Asia/Dubai', 
  'Asia/Singapore',
  'Asia/Tokyo',
  'America/Los_Angeles'
];

const EXPERTISE_LEVELS: ExpertiseLevel[] = ['intermediate', 'advanced', 'expert'];

export default function MentorEditProfilePage() {
  const { user } = useAuth();
  const { 
    mentor, 
    isLoading, 
    mutate 
  } = useMentor(user?.id || '');
  
  const router = useRouter();

  // Form state
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [currency, setCurrency] = useState<string>('INR');
  const [availabilityType, setAvailabilityType] = useState<AvailabilityType>('flexible');
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata');
  const [expertiseInput, setExpertiseInput] = useState<string>('');
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>('intermediate');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('1');
  const [expertise, setExpertise] = useState<IMentor['expertise']>([]);
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load mentor data when available
  useEffect(() => {
    if (mentor) {
      setHourlyRate(mentor.hourlyRate?.toString() || '');
      setCurrency(mentor.currency || 'INR');
      setAvailabilityType(mentor.availability?.type || 'flexible');
      setTimezone(mentor.availability?.timezone || 'Asia/Kolkata');
      setExpertise(mentor.expertise || []);
      setSchedule(mentor.availability?.schedule || {});
    }
  }, [mentor]);

  const addExpertise = () => {
    if (expertiseInput.trim()) {
      const newExpertise = {
        skill: expertiseInput.trim(),
        level: expertiseLevel,
        yearsOfExperience: parseInt(yearsOfExperience) || 1,
        verified: false
      };
      setExpertise([...expertise, newExpertise]);
      setExpertiseInput('');
      setYearsOfExperience('1');
    }
  };

  const removeExpertise = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!hourlyRate || Number(hourlyRate) < 100) {
      setSaveError('Hourly rate must be at least ₹100');
      return false;
    }
    if (expertise.length === 0) {
      setSaveError('Please add at least one expertise');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!mentor?._id) {
      setSaveError('Mentor profile not found');
      return;
    }

    if (!validateForm()) return;

    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      // Prepare update data matching IMentor structure
      const updateData = {
        hourlyRate: Number(hourlyRate),
        currency,
        expertise,
        availability: {
          type: availabilityType,
          timezone,
          schedule
        }
      };

      const response = await fetch(`/api/mentors/${mentor._id.toString()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      // Refresh mentor data
      await mutate();
      
      setSuccessMessage('Profile updated successfully!');
      
      // Redirect after delay
      setTimeout(() => {
        router.push('/dashboard/mentor/profile');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">Edit Mentor Profile</h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">Update your expertise, rates, and availability</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <div className="p-1 bg-green-100 rounded-full">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {saveError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{saveError}</p>
          </div>
        )}

        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium mb-1">
                  Hourly Rate (₹)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-charcoal-500">₹</span>
                  <input
                    id="hourlyRate"
                    type="number"
                    className="flex-1 border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="500"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    min="100"
                    step="50"
                    required
                  />
                </div>
                <p className="text-xs text-charcoal-500 mt-1">Minimum: ₹100</p>
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expertise Card */}
        <Card>
          <CardHeader>
            <CardTitle>Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add Expertise Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500"
                    placeholder="Skill (e.g., React, Python, UI/UX)"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                  />
                </div>
                <div>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500"
                    value={expertiseLevel}
                    onChange={(e) => setExpertiseLevel(e.target.value as ExpertiseLevel)}
                  >
                    {EXPERTISE_LEVELS.map((level) => (
                      <option key={level} value={level} className="capitalize">
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="flex-1 border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500"
                    placeholder="Years"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    min="0"
                    max="50"
                  />
                  <Button variant="outline" size="sm" onClick={addExpertise}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {expertise.map((item, i) => (
                  <Badge key={i} variant="skill" className="gap-1 py-1">
                    <span className="font-medium">{item.skill}</span>
                    <span className="text-xs opacity-75">({item.level})</span>
                    <span className="text-xs opacity-75 ml-1">{item.yearsOfExperience}y</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive ml-1" 
                      onClick={() => removeExpertise(i)} 
                    />
                  </Badge>
                ))}
                {expertise.length === 0 && (
                  <p className="text-sm text-charcoal-400 italic">No expertise added yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Availability Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Availability Type</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_TYPES.map((type) => (
                  <Badge
                    key={type}
                    variant={availabilityType === type ? 'default' : 'outline'}
                    className="cursor-pointer capitalize py-2 px-4 text-sm"
                    onClick={() => setAvailabilityType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium mb-1">
                Timezone
              </label>
              <select
                id="timezone"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary-500"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule Calendar */}
        <AvailabilityCalendar 
          schedule={schedule} 
          onChange={setSchedule} 
        />

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}