'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvailabilitySchedule } from '@/types/mentor';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface TimeSlot {
  start: string;
  end: string;
}

interface AvailabilityCalendarProps {
  schedule?: AvailabilitySchedule;
  onChange?: (schedule: AvailabilitySchedule) => void;
  readOnly?: boolean;
}

export function AvailabilityCalendar({ schedule = {}, onChange, readOnly = false }: AvailabilityCalendarProps) {
  const [localSchedule, setLocalSchedule] = useState<AvailabilitySchedule>(schedule);

  const addSlot = (day: typeof DAYS[number]) => {
    const slots = [...(localSchedule[day] || []), { start: '09:00', end: '10:00' }];
    const updated = { ...localSchedule, [day]: slots };
    setLocalSchedule(updated);
    onChange?.(updated);
  };

  const removeSlot = (day: typeof DAYS[number], index: number) => {
    const slots = (localSchedule[day] || []).filter((_, i) => i !== index);
    const updated = { ...localSchedule, [day]: slots };
    setLocalSchedule(updated);
    onChange?.(updated);
  };

  const updateSlot = (day: typeof DAYS[number], index: number, field: 'start' | 'end', value: string) => {
    const slots = [...(localSchedule[day] || [])];
    slots[index] = { ...slots[index], [field]: value };
    const updated = { ...localSchedule, [day]: slots };
    setLocalSchedule(updated);
    onChange?.(updated);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Weekly Availability</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS.map((day, i) => {
            const slots = localSchedule[day] || [];
            return (
              <div key={day} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{day}</span>
                  {!readOnly && (
                    <Button variant="outline" size="xs" onClick={() => addSlot(day)}>
                      + Add Slot
                    </Button>
                  )}
                </div>

                {slots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Not available</p>
                ) : (
                  <div className="space-y-2">
                    {slots.map((slot, j) => (
                      <div key={j} className="flex items-center gap-2">
                        {readOnly ? (
                          <Badge variant="outline" size="sm">{slot.start} – {slot.end}</Badge>
                        ) : (
                          <>
                            <input
                              type="time"
                              className="border rounded px-2 py-1 text-xs bg-background"
                              value={slot.start}
                              onChange={(e) => updateSlot(day, j, 'start', e.target.value)}
                            />
                            <span className="text-xs text-muted-foreground">to</span>
                            <input
                              type="time"
                              className="border rounded px-2 py-1 text-xs bg-background"
                              value={slot.end}
                              onChange={(e) => updateSlot(day, j, 'end', e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeSlot(day, j)}
                              className="text-error-600 h-6 w-6"
                            >
                              ×
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
