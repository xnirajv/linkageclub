'use client';

import React from 'react';
import { SessionCard } from '@/components/dashboard/mentor/SessionCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { useMentor } from '@/hooks/useMentors';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Loader2, Star, DollarSign } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';
import { Mentor, MentorSession } from '@/types/mentor';
import { User } from '@/types/user';

export default function MentorPastSessionsPage() {
  const { user } = useAuth() as { user: { id: string; name: string; email: string } | null };
  
  const { 
    mentor, 
    isLoading,
    isError 
  } = useMentor(user?.id || '');
  
  const typedMentor = mentor as Mentor | null;
  const sessions = typedMentor?.sessions || [];

  // Filter past sessions (completed or past date)
  const pastSessions = sessions.filter((session: MentorSession) => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    return session.status === 'completed' || 
           (session.status !== 'scheduled' && sessionDate < now);
  }).sort((a: MentorSession, b: MentorSession) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate stats
  const totalEarnings = pastSessions.reduce(
    (sum, session) => sum + (session.amount || 0), 
    0
  );
  
  const sessionsWithRating = pastSessions.filter(
    (s: MentorSession) => s.studentFeedback?.rating
  );
  
  const averageRating = sessionsWithRating.length > 0
    ? sessionsWithRating.reduce(
        (sum, s: MentorSession) => sum + (s.studentFeedback?.rating || 0), 
        0
      ) / sessionsWithRating.length
    : 0;

  // ✅ FIX: Create proper User object with all required fields
  const getStudentInfo = (session: MentorSession): User | undefined => {
    // If student is already populated (full User object)
    if (session.student && typeof session.student === 'object' && '_id' in session.student) {
      return session.student as User;
    }
    
    // If only studentId exists, create minimal User object with defaults
    if (session.studentId) {
      const now = new Date();
      return {
        _id: session.studentId,
        name: 'Student',
        email: '', // Required but can be empty
        role: 'student',
        avatar: undefined,
        bio: undefined,
        location: undefined,
        phone: undefined,
        emailVerified: false,
        trustScore: 0,
        skills: [],
        badges: [],
        socialLinks: {},
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          newsletter: false,
          theme: 'system',
        },
        verification: {
          email: false,
          phone: false,
          id: false,
          linkedin: false,
          github: false,
        },
        stats: {
          projectsCompleted: 0,
          totalEarnings: 0,
          averageRating: 0,
          reviewsCount: 0,
          sessionsAttended: 0,
          daysActive: 0,
        },
        lastActive: now,
        createdAt: now,
        updatedAt: now,
      };
    }
    
    return undefined;
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center max-w-md mx-auto mt-10">
          <p className="text-red-600 mb-4">Failed to load sessions</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary-600 hover:underline"
          >
            Try Again
          </button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            Past Sessions
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Review completed mentoring sessions
          </p>
        </div>

        {/* Stats Summary */}
        {pastSessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-charcoal-500">Total Sessions</p>
              <p className="text-2xl font-bold">{pastSessions.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-charcoal-500">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-charcoal-500">Total Earnings</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <p className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Sessions List or Empty State */}
        {pastSessions.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No past sessions"
            description="Your completed sessions will appear here"
            action={{
              label: "View Upcoming Sessions",
              onClick: () => window.location.href = '/dashboard/mentor/sessions/upcoming'
            }}
          />
        ) : (
          <div className="space-y-4">
            {pastSessions.map((session: MentorSession) => {
              const studentInfo = getStudentInfo(session);
              
              // ✅ Create session object with proper student type
              const sessionForCard = {
                ...session,
                student: studentInfo, // Now this is proper User type
              };
              
              return (
                <SessionCard 
                  key={session._id?.toString() || Math.random().toString()} 
                  session={sessionForCard}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}