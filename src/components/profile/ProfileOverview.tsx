import React from 'react';
import { User } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Briefcase, GraduationCap } from 'lucide-react';

interface ProfileOverviewProps {
  user: User;
}

export function ProfileOverview({ user }: ProfileOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {user.bio || 'No bio available'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Projects Completed</span>
            <span className="font-semibold">{user.stats.projectsCompleted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Average Rating</span>
            <span className="font-semibold">{user.stats.averageRating.toFixed(1)} / 5.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Reviews</span>
            <span className="font-semibold">{user.stats.reviewsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Days Active</span>
            <span className="font-semibold">{user.stats.daysActive}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
