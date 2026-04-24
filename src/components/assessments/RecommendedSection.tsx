'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, TrendingUp, Award } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

export function RecommendedSection({ assessments }: { assessments: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {assessments.map((assessment) => (
        <Card key={assessment.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2"><h3 className="font-semibold text-lg">{assessment.title}</h3><Badge variant="success" className="bg-green-100 text-green-700">{assessment.matchScore}% Match</Badge></div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-2"><div className="flex items-center gap-1"><Clock className="h-3 w-3" />{assessment.duration} mins</div><div className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}</div><div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{assessment.passRate}% pass</div></div>
              <div className="flex items-center gap-3 text-sm">{assessment.badgeName && <div className="flex items-center gap-1 text-yellow-600"><Award className="h-4 w-4" /><span>Badge: {assessment.badgeName}</span></div>}{assessment.trustBoost > 0 && <div className="flex items-center gap-1 text-green-600"><TrendingUp className="h-4 w-4" /><span>Trust Score +{assessment.trustBoost}</span></div>}</div>
            </div>
            <Button asChild size="sm"><Link href={`/dashboard/student/assessments/${assessment.id}`}>Take Test</Link></Button>
          </div>
        </Card>
      ))}
    </div>
  );
}