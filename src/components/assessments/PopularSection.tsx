'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, Clock, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export function PopularSection({ assessments }: { assessments: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assessments.map((assessment) => (
        <Card key={assessment.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{assessment.title}</h3>
              <div className="flex items-center gap-2 mb-2"><div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-medium">{assessment.rating}</span><span className="text-sm text-gray-500">({formatNumber(assessment.ratingCount)} ratings)</span></div><div className="flex items-center gap-1 text-gray-500"><Users className="h-3 w-3" /><span className="text-sm">{formatNumber(assessment.takenCount)} taken</span></div></div>
              <div className="flex items-center gap-3 text-sm text-gray-500"><span className="capitalize">{assessment.level}</span><div className="flex items-center gap-1"><Clock className="h-3 w-3" />{assessment.duration} mins</div><div className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}</div></div>
            </div>
            <Button asChild variant="outline" size="sm"><Link href={`/dashboard/student/assessments/${assessment.id}`}>View Bundle</Link></Button>
          </div>
        </Card>
      ))}
    </div>
  );
}