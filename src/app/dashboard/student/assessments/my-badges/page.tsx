'use client';

import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import DashboardLayout from '@/app/dashboard/layout';
import { BadgeDisplay } from '@/components/dashboard/student/BadgeDisplay';
import { Loader2, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function StudentMyBadgesPage() {
  const { badges, isLoading } = useProfile();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">My Badges</h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Badges you have earned by completing skill assessments
          </p>
        </div>

        {badges.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-charcoal-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No badges yet</h3>
              <p className="text-charcoal-500 max-w-md">
                Complete skill assessments to earn badges and showcase your expertise.
              </p>
            </div>
          </Card>
        ) : (
          <BadgeDisplay badges={badges} />
        )}
      </div>
    </DashboardLayout>
  );
}