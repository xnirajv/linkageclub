'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useMentor } from '@/hooks/useMentors'; // ✅ Use useMentor, not useMentors
import {
  Plus,
  X,
  Save, // Renamed to avoid conflict
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar'; // ✅ Add Calendar component import
import DashboardLayout from '@/app/dashboard/layout';
import { Switch } from '@/components/ui/switch';

// Types
interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface CustomSlot {
  date: Date;
  slots: TimeSlot[];
}

export default function MentorAvailabilityPage() {
  const { user } = useAuth();
  
  // ✅ Use useMentor hook (singular)
  const { 
    updateAvailability, 
    isLoading 
  } = useMentor(user?.id || '') as unknown as { 
    mentor: any; 
    updateAvailability: (data: any) => Promise<void>;
    isLoading: boolean;
  };
  
  const [activeTab, setActiveTab] = useState<'weekly' | 'custom'>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [customSlots, setCustomSlots] = useState<CustomSlot[]>([]);
  
  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    tuesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    wednesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    thursday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    friday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  });

  const [bufferTime, setBufferTime] = useState(15); // minutes between sessions
  const [maxAdvanceBooking, setMaxAdvanceBooking] = useState(30); // days
  const [minNoticeTime, setMinNoticeTime] = useState(24); // hours

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const addTimeSlot = (day: keyof WeekSchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: '09:00', end: '17:00' }],
      },
    }));
  };

  const removeTimeSlot = (day: keyof WeekSchedule, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  const updateTimeSlot = (day: keyof WeekSchedule, index: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const toggleDay = (day: keyof WeekSchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const addCustomSlot = () => {
    if (!selectedDate) return;
    
    setCustomSlots(prev => [
      ...prev,
      { date: selectedDate, slots: [{ start: '09:00', end: '17:00' }] },
    ]);
    setSelectedDate(undefined);
  };

  const removeCustomSlot = (index: number) => {
    setCustomSlots(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomSlot = (index: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    setCustomSlots(prev => prev.map((item, i) => 
      i === index
        ? {
            ...item,
            slots: item.slots.map((slot, j) =>
              j === slotIndex ? { ...slot, [field]: value } : slot
            ),
          }
        : item
    ));
  };

  const addCustomTimeSlot = (index: number) => {
    setCustomSlots(prev => prev.map((item, i) =>
      i === index
        ? { ...item, slots: [...item.slots, { start: '09:00', end: '17:00' }] }
        : item
    ));
  };

  const removeCustomTimeSlot = (itemIndex: number, slotIndex: number) => {
    setCustomSlots(prev => prev.map((item, i) =>
      i === itemIndex
        ? { ...item, slots: item.slots.filter((_, j) => j !== slotIndex) }
        : item
    ));
  };

  const handleSave = async () => {
    try {
      await updateAvailability({
        weeklySchedule: schedule,
        bufferTime,
        maxAdvanceBooking,
        minNoticeTime,
        customSlots,
      });
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability. Please try again.');
    }
  };

  const applyTemplate = (template: 'standard' | 'extended' | 'minimal') => {
    let newSchedule = { ...schedule };
    
    switch (template) {
      case 'standard':
        newSchedule = {
          monday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
          tuesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
          wednesday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
          thursday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
          friday: { enabled: true, slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }] },
          saturday: { enabled: false, slots: [] },
          sunday: { enabled: false, slots: [] },
        };
        break;
      case 'extended':
        newSchedule = {
          monday: { enabled: true, slots: [{ start: '08:00', end: '20:00' }] },
          tuesday: { enabled: true, slots: [{ start: '08:00', end: '20:00' }] },
          wednesday: { enabled: true, slots: [{ start: '08:00', end: '20:00' }] },
          thursday: { enabled: true, slots: [{ start: '08:00', end: '20:00' }] },
          friday: { enabled: true, slots: [{ start: '08:00', end: '20:00' }] },
          saturday: { enabled: true, slots: [{ start: '10:00', end: '18:00' }] },
          sunday: { enabled: false, slots: [] },
        };
        break;
      case 'minimal':
        newSchedule = {
          monday: { enabled: true, slots: [{ start: '18:00', end: '21:00' }] },
          tuesday: { enabled: true, slots: [{ start: '18:00', end: '21:00' }] },
          wednesday: { enabled: true, slots: [{ start: '18:00', end: '21:00' }] },
          thursday: { enabled: true, slots: [{ start: '18:00', end: '21:00' }] },
          friday: { enabled: false, slots: [] },
          saturday: { enabled: true, slots: [{ start: '10:00', end: '18:00' }] },
          sunday: { enabled: true, slots: [{ start: '10:00', end: '18:00' }] },
        };
        break;
    }
    
    setSchedule(newSchedule);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Manage Availability</h1>
            <p className="text-charcoal-600">Set your weekly schedule and custom availability</p>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Templates */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Templates</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => applyTemplate('standard')}>
              Standard (9-5)
            </Button>
            <Button variant="outline" onClick={() => applyTemplate('extended')}>
              Extended Hours
            </Button>
            <Button variant="outline" onClick={() => applyTemplate('minimal')}>
              Evenings & Weekends
            </Button>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'weekly' | 'custom')}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="custom">Custom Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <Card className="p-6">
              <div className="space-y-6">
                {daysOfWeek.map(({ key, label }) => {
                  const dayKey = key as keyof WeekSchedule;
                  return (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={schedule[dayKey].enabled}
                            onCheckedChange={() => toggleDay(dayKey)}
                          />
                          <span className="font-medium">{label}</span>
                        </div>
                        {schedule[dayKey].enabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeSlot(dayKey)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Time Slot
                          </Button>
                        )}
                      </div>

                      {schedule[dayKey].enabled && (
                        <div className="space-y-3">
                          {schedule[dayKey].slots.map((slot, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <select
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(dayKey, index, 'start', e.target.value)}
                                className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
                              >
                                {timeSlots.map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                              <span>to</span>
                              <select
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(dayKey, index, 'end', e.target.value)}
                                className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
                              >
                                {timeSlots.map((time) => (
                                  <option key={time} value={time}>{time}</option>
                                ))}
                              </select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTimeSlot(dayKey, index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <div className="flex flex-wrap gap-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date: Date) => date < new Date()}
                      className="rounded-md border"
                    />
                    <Button onClick={addCustomSlot} disabled={!selectedDate} className="self-end">
                      Add Custom Date
                    </Button>
                  </div>
                </div>

                {customSlots.length === 0 ? (
                  <p className="text-center text-charcoal-500 py-8">No custom dates added yet.</p>
                ) : (
                  customSlots.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">
                          {item.date.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomSlot(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {item.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-3 mb-2">
                          <select
                            value={slot.start}
                            onChange={(e) => updateCustomSlot(index, slotIndex, 'start', e.target.value)}
                            className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span>to</span>
                          <select
                            value={slot.end}
                            onChange={(e) => updateCustomSlot(index, slotIndex, 'end', e.target.value)}
                            className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCustomTimeSlot(index, slotIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCustomTimeSlot(index)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Advanced Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Advanced Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Buffer Time Between Sessions</p>
                <p className="text-sm text-charcoal-500">Time needed to prepare for next session</p>
              </div>
              <select
                value={bufferTime}
                onChange={(e) => setBufferTime(Number(e.target.value))}
                className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
              >
                <option value="0">No buffer</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maximum Advance Booking</p>
                <p className="text-sm text-charcoal-500">How far in advance students can book</p>
              </div>
              <select
                value={maxAdvanceBooking}
                onChange={(e) => setMaxAdvanceBooking(Number(e.target.value))}
                className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
              >
                <option value="7">1 week</option>
                <option value="14">2 weeks</option>
                <option value="30">1 month</option>
                <option value="60">2 months</option>
                <option value="90">3 months</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Minimum Notice Time</p>
                <p className="text-sm text-charcoal-500">Minimum hours before session for booking</p>
              </div>
              <select
                value={minNoticeTime}
                onChange={(e) => setMinNoticeTime(Number(e.target.value))}
                className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map(({ key, label }) => {
              const dayKey = key as keyof WeekSchedule;
              return (
                <div key={key} className="text-center">
                  <p className="text-xs font-medium text-charcoal-500 mb-2">{label.slice(0, 3)}</p>
                  {schedule[dayKey].enabled ? (
                    <div className="space-y-1">
                      {schedule[dayKey].slots.map((slot, i) => (
                        <div key={i} className="text-xs bg-primary-50 text-primary-700 p-1 rounded">
                          {slot.start}-{slot.end}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-charcoal-400">Unavailable</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}