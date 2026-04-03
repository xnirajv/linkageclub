'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMentor } from '@/hooks/useMentors'; // Import useMentor instead of useMentors
import { useAuth } from '@/hooks/useAuth';
import { Save, Plus, X } from 'lucide-react';
import DashboardLayout from '../../layout';
import { Label } from '@/components/ui/lable';

// Define proper types
interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  [key: string]: TimeSlot[];
}

interface Availability {
  type: 'flexible' | 'weekdays' | 'evenings' | 'weekends';
  schedule: DaySchedule;
  timezone: string;
  exceptions?: Array<{
    date: string;
    available: boolean;
    slots?: TimeSlot[];
  }>;
}


// Days of the week
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_LOWER = DAYS.map(d => d.toLowerCase());

export default function MentorAvailabilityPage() {
  const { user } = useAuth();
  const { 
    mentor, 
    isLoading  } = useMentor(user?.id || ''); // useMentor hook for single mentor
  
  const [availability, setAvailability] = useState<Availability>({
    type: 'flexible',
    schedule: DAYS_LOWER.reduce((acc, day) => {
      acc[day] = [{ start: '09:00', end: '17:00' }];
      return acc;
    }, {} as DaySchedule),
    timezone: 'Asia/Kolkata',
    exceptions: [],
  });

  const [selectedDay, setSelectedDay] = useState('monday');
  const [exceptionStart, setExceptionStart] = useState('');
  const [exceptionEnd, setExceptionEnd] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update availability when mentor data loads
  useEffect(() => {
    if (mentor?.availability) {
      setAvailability(mentor.availability);
    }
  }, [mentor]);

  const handleAddTimeSlot = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: [...(prev.schedule[day] || []), { start: '09:00', end: '17:00' }],
      },
    }));
  };

  const handleRemoveTimeSlot = (day: string, index: number) => {
    setAvailability(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: prev.schedule[day].filter((_, i) => i !== index),
      },
    }));
  };

  const handleTimeSlotChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: prev.schedule[day].map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const handleAddException = () => {
    if (!exceptionStart || !exceptionEnd) return;

    setAvailability(prev => ({
      ...prev,
      exceptions: [
        ...(prev.exceptions || []),
        {
          date: exceptionStart,
          available: false,
          slots: [],
        },
      ],
    }));

    setExceptionStart('');
    setExceptionEnd('');
  };

  const handleRemoveException = (index: number) => {
    setAvailability(prev => ({
      ...prev,
      exceptions: prev.exceptions?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSave = async () => {
    if (!mentor?._id) {
      alert('Mentor profile not found');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // API call to update availability
      const response = await fetch(`/api/mentors/${mentor._id}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability),
      });

      if (!response.ok) throw new Error('Failed to update availability');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability. Please try again.');
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
              Manage Availability
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Set your weekly schedule and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-sm text-green-600 animate-fade-in">
                ✓ Saved successfully!
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Availability Type */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Availability Type</h2>
          <div className="space-y-3">
            {(['flexible', 'weekdays', 'evenings', 'weekends'] as const).map((type) => (
              <label key={type} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-charcoal-100/50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="availabilityType"
                  value={type}
                  checked={availability.type === type}
                  onChange={(e) => setAvailability({ ...availability, type: e.target.value as typeof type })}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium capitalize">{type}</span>
                  <p className="text-sm text-charcoal-500">
                    {type === 'flexible' && 'Available at flexible times, discuss with students'}
                    {type === 'weekdays' && 'Available on weekdays during working hours (Monday-Friday)'}
                    {type === 'evenings' && 'Available on weekday evenings (6 PM - 10 PM)'}
                    {type === 'weekends' && 'Available on weekends (Saturday-Sunday)'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Timezone */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Timezone</h2>
          <select
            value={availability.timezone}
            onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })}
            className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Asia/Kolkata">India Standard Time (IST)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">Greenwich Mean Time (GMT)</option>
            <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
            <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
            <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
            <option value="Asia/Singapore">Singapore Time (SGT)</option>
          </select>
          <p className="text-xs text-charcoal-500 mt-2">
            All times will be displayed in this timezone
          </p>
        </Card>

        {/* Weekly Schedule */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Schedule</h2>

          {/* Day selector */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {DAYS.map((day) => (
              <Button
                key={day}
                variant={selectedDay === day.toLowerCase() ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setSelectedDay(day.toLowerCase())}
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>

          {/* Time slots for selected day */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium capitalize">{selectedDay}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddTimeSlot(selectedDay)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Time Slot
              </Button>
            </div>

            {availability.schedule[selectedDay]?.map((slot, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-charcoal-100/50">
                <Input
                  type="time"
                  value={slot.start}
                  onChange={(e) => handleTimeSlotChange(selectedDay, index, 'start', e.target.value)}
                  className="w-32"
                />
                <span>to</span>
                <Input
                  type="time"
                  value={slot.end}
                  onChange={(e) => handleTimeSlotChange(selectedDay, index, 'end', e.target.value)}
                  className="w-32"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveTimeSlot(selectedDay, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {(!availability.schedule[selectedDay] || availability.schedule[selectedDay].length === 0) && (
              <p className="text-center text-charcoal-500 py-8 border-2 border-dashed rounded-lg">
                No time slots set for this day. Click "Add Time Slot" to add one.
              </p>
            )}
          </div>
        </Card>

        {/* Exceptions & Time Off */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Exceptions & Time Off</h2>
          
          <div className="space-y-4">
            {/* Add exception form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="exception-start">Start Date</Label>
                <Input
                  id="exception-start"
                  type="date"
                  value={exceptionStart}
                  onChange={(e) => setExceptionStart(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="exception-end">End Date</Label>
                <Input
                  id="exception-end"
                  type="date"
                  value={exceptionEnd}
                  onChange={(e) => setExceptionEnd(e.target.value)}
                  min={exceptionStart || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleAddException}
                  disabled={!exceptionStart || !exceptionEnd}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exception
                </Button>
              </div>
            </div>

            {/* Exceptions list */}
            <div className="mt-4 space-y-2">
              {availability.exceptions && availability.exceptions.length > 0 ? (
                availability.exceptions.map((exception, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">
                        {new Date(exception.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-yellow-600">Unavailable</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveException(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-charcoal-500 py-4">
                  No exceptions scheduled. Add dates when you're not available.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Preview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {DAYS.map((day) => {
              const dayLower = day.toLowerCase();
              const slots = availability.schedule[dayLower] || [];
              
              return (
                <div key={day} className="border rounded-lg p-3">
                  <p className="font-medium text-sm mb-2 text-center pb-2 border-b">
                    {day}
                  </p>
                  <div className="space-y-1 min-h-[80px]">
                    {slots.length > 0 ? (
                      slots.map((slot, i) => (
                        <div key={i} className="text-xs bg-primary-50 text-primary-700 p-1 rounded text-center">
                          {slot.start} - {slot.end}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-charcoal-400 text-center">No slots</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}