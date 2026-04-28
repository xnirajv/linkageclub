'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight, Target, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PipelineStage {
  name: string;
  status: string;
  count: number;
  color: string;
}

interface HiringPipelineProps {
  stages?: PipelineStage[];
  isLoading?: boolean;
}

const defaultStages: PipelineStage[] = [
  { name: 'Applied', status: 'pending', count: 0, color: 'bg-yellow-500' },
  { name: 'Reviewed', status: 'reviewed', count: 0, color: 'bg-blue-500' },
  { name: 'Shortlisted', status: 'shortlisted', count: 0, color: 'bg-green-500' },
  { name: 'Hired', status: 'accepted', count: 0, color: 'bg-purple-500' },
];

export function HiringPipeline({ stages = defaultStages, isLoading }: HiringPipelineProps) {
  if (isLoading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-5">
          <Skeleton className="h-32 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const total = stages.reduce((s, st) => s + st.count, 0);
  const hired = stages.find(s => s.status === 'accepted')?.count || 0;

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
            <Target className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-sm">Hiring Pipeline</h3>
        </div>
        <span className="text-xs text-gray-500">{total} total</span>
      </div>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          {stages.map((stage, i) => (
            <React.Fragment key={stage.status}>
              <div className="flex flex-col items-center gap-1 flex-1">
                <Badge variant="secondary" className="text-xs">{stage.count}</Badge>
                <p className="text-[10px] text-gray-500 text-center">{stage.name}</p>
                <div className={`w-full h-1 rounded-full ${stage.color}`} />
              </div>
              {i < stages.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
        {hired > 0 && total > 0 && (
          <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            {Math.round((hired / total) * 100)}% conversion
          </div>
        )}
      </CardContent>
    </Card>
  );
}