'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Talent {
  _id: string;
  name: string;
  skills: string[];
  trustScore: number;
  hourlyRate?: number;
  location?: string;
  availability?: string;
}

interface RecommendedTalentProps {
  talents?: Talent[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onTalentClick?: (id: string) => void;
}

const defaultTalents: Talent[] = [
  { _id: '1', name: 'Riya Sharma', skills: ['React', 'Node.js', 'TypeScript'], trustScore: 95, hourlyRate: 1500, location: 'Mumbai', availability: 'Available now' },
  { _id: '2', name: 'Amit Kumar', skills: ['Python', 'Django', 'PostgreSQL'], trustScore: 88, hourlyRate: 1200, location: 'Bangalore', availability: 'Available in 2 weeks' },
  { _id: '3', name: 'Priya Patel', skills: ['UI/UX', 'Figma', 'Adobe XD'], trustScore: 92, hourlyRate: 1800, location: 'Pune', availability: 'Available now' },
];

export function RecommendedTalent({ talents = defaultTalents, isLoading, onViewAll, onTalentClick }: RecommendedTalentProps) {
  if (isLoading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-5 space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-sm">Recommended Talent</h3>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="space-y-3">
          {talents.map((talent) => (
            <button
              key={talent._id}
              className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
              onClick={() => onTalentClick?.(talent._id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium">
                    {talent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{talent.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {talent.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{talent.location}</span>}
                      {talent.availability && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{talent.availability}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="font-medium">{talent.trustScore}%</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">₹{talent.hourlyRate}/hr</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}