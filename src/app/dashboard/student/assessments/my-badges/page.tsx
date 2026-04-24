'use client';

import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { BadgeDisplay } from '@/components/assessments/BadgeDisplay';
import { Loader2, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyBadgesPage() {
  const { badges, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
            My Badges
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Badges you have earned by completing skill assessments
          </p>
        </div>
        <Link href="/dashboard/student/assessments">
          <Button variant="outline">Browse Assessments</Button>
        </Link>
      </div>

      {!badges || badges.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No badges yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Complete skill assessments to earn badges and showcase your
              expertise. Each badge verifies your skills and increases your
              trust score.
            </p>
            <Link
              href="/dashboard/student/assessments"
              className="mt-4"
            >
              <Button>Start an Assessment</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Total Badges: {badges.length}
              </span>
            </div>
          </div>
          <BadgeDisplay badges={badges} size="lg" />
        </>
      )}
    </div>
  );
}