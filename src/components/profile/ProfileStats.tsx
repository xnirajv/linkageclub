'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Briefcase, Award, Users, Star } from 'lucide-react';

interface ProfileStatsProps {
  user: any;
  mentorData?: any;
}

export function ProfileStats({ user, mentorData }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 text-center">
        <Briefcase className="h-5 w-5 mx-auto mb-2 text-primary-600" />
        <p className="text-2xl font-bold">{user.stats?.projectsCompleted || 0}</p>
        <p className="text-xs text-charcoal-500">Projects</p>
      </Card>
      <Card className="p-4 text-center">
        <Award className="h-5 w-5 mx-auto mb-2 text-green-600" />
        <p className="text-2xl font-bold">{user.skills?.length || 0}</p>
        <p className="text-xs text-charcoal-500">Skills</p>
      </Card>
      <Card className="p-4 text-center">
        <Users className="h-5 w-5 mx-auto mb-2 text-purple-600" />
        <p className="text-2xl font-bold">{mentorData?.stats?.completedSessions || 0}</p>
        <p className="text-xs text-charcoal-500">Sessions</p>
      </Card>
      <Card className="p-4 text-center">
        <Star className="h-5 w-5 mx-auto mb-2 text-yellow-600" />
        <p className="text-2xl font-bold">{user.trustScore || 0}%</p>
        <p className="text-xs text-charcoal-500">Trust Score</p>
      </Card>
    </div>
  );
}