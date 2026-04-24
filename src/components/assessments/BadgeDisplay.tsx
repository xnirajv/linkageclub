'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Award } from 'lucide-react';

export function BadgeDisplay({ badges, size = 'md' }: { badges: any[]; size?: 'sm' | 'md' | 'lg' }) {
  if (!badges || badges.length === 0) {
    return <Card className="p-12 text-center"><Award className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium mb-2">No badges yet</h3><p className="text-gray-500">Complete skill assessments to earn badges</p></Card>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge, idx) => (
        <Card key={badge.id || idx} className="p-4 text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg"><Award className="h-8 w-8" /></div>
          <p className="font-medium mt-3 text-sm">{badge.name}</p>
          {badge.earnedAt && <p className="text-xs text-gray-400 mt-1">{new Date(badge.earnedAt).toLocaleDateString()}</p>}
        </Card>
      ))}
    </div>
  );
}