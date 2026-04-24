'use client';

import React from 'react';
import { Assessment } from '@/types/assessment';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Users, IndianRupee, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface AssessmentCardProps {
  assessment: Assessment;
  recommended?: boolean;
  matchScore?: number;
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
  expert: 'default',
};

export function AssessmentCard({ assessment, recommended, matchScore }: AssessmentCardProps) {
  const hasAttempted = !!assessment.userAttempt;
  const passed = assessment.userAttempt?.passed;

  return (
    <Card className="card-hover relative">
      {recommended && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-primary-600 text-white flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Recommended
          </Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-2 flex-1">{assessment.title}</CardTitle>
          <Badge
            variant={LEVEL_COLORS[assessment.level] as any || 'outline'}
            size="sm"
            className="capitalize flex-shrink-0"
          >
            {assessment.level}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{assessment.skillName}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {assessment.description}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {assessment.duration} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {(assessment.totalAttempts || 0).toLocaleString()} attempts
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {assessment.passRate || 0}% pass rate
          </span>
          {assessment.price > 0 && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <IndianRupee className="h-4 w-4" />
              {assessment.price}
            </span>
          )}
        </div>
        {matchScore !== undefined && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Match Score:</span>
            <span className="font-medium text-primary-600">{matchScore}%</span>
            <div className="flex-1 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full"
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>
        )}
        {hasAttempted && (
          <div
            className={`mt-3 p-2 rounded-md text-sm font-medium text-center ${
              passed
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {passed
              ? `Passed · ${assessment.userAttempt!.score}%`
              : `Failed · ${assessment.userAttempt!.score}%`}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <Link href={`/dashboard/student/assessments/${assessment._id}`}>
            Details
          </Link>
        </Button>
        <Button size="sm" asChild className="flex-1">
          <Link href={`/dashboard/student/assessments/${assessment._id}/take`}>
            {hasAttempted ? 'Retake' : 'Start'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}