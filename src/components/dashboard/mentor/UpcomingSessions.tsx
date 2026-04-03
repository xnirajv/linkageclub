'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useMentor } from '@/hooks/useMentors';
import { useAuth } from '@/hooks/useAuth';
import { SessionCard } from './SessionCard';

interface UpcomingSessionsProps {
  limit?: number;
  showViewAll?: boolean;
}

interface Session {
  _id: string;
  student?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  topic: string;
  date: string | Date;
  duration: number;
  amount: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  meetingLink?: string;
  studentFeedback?: {
    rating: number;
    comment: string;
  };
}

export function UpcomingSessions({ limit = 3, showViewAll = true }: UpcomingSessionsProps) {
  const { user } = useAuth() as { user: { id: string } | null };
  const { mentor, isLoading } = useMentor(user?.id || '');

  // Get upcoming sessions (scheduled and future date)
  const upcomingSessions = mentor?.sessions
    ?.filter((session: Session) => {
      const sessionDate = new Date(session.date);
      return session.status === 'scheduled' && sessionDate > new Date();
    })
    ?.sort((a: Session, b: Session) => new Date(a.date).getTime() - new Date(b.date).getTime())
    ?.slice(0, limit) || [];

  // Calculate next session time
  const getNextSessionTime = () => {
    if (upcomingSessions.length === 0) return null;
    const nextSession = upcomingSessions[0];
    const sessionDate = new Date(nextSession.date);
    const now = new Date();
    const diffMs = sessionDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return 'today';
  };

  const handleCancelSession = (sessionId: string) => {
    if (confirm('Are you sure you want to cancel this session?')) {
      console.log('Cancel session:', sessionId);
      // API call to cancel session
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-600" />
          <div>
            <CardTitle>Upcoming Sessions</CardTitle>
            {upcomingSessions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Next session {getNextSessionTime()}
              </p>
            )}
          </div>
        </div>
        {showViewAll && upcomingSessions.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/mentor/sessions">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex p-3 bg-primary-50 rounded-full mb-3">
              <Calendar className="h-6 w-6 text-primary-500" />
            </div>
            <h3 className="font-medium mb-1">No upcoming sessions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your scheduled sessions will appear here
            </p>
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <Button size="sm" asChild>
                <Link href="/dashboard/mentor/availability">Set Availability</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/mentor/students">View Students</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map((session: Session) => (
              <SessionCard 
                key={session._id} 
                session={session as any}
                onCancel={handleCancelSession}
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {upcomingSessions.length > 0 && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{upcomingSessions.length}</p>
              <p className="text-xs text-muted-foreground">Total Upcoming</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ₹{upcomingSessions.reduce((sum, s) => sum + (s.amount || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Expected Earnings</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
