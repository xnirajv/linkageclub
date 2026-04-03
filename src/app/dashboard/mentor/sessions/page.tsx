'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, MapPin, Star, Loader2 } from 'lucide-react';
import { useMentor } from '@/hooks/useMentors'; // ✅ Fix: use useMentor, not useMentors
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../layout';
import { Mentor, MentorSession } from '@/types/mentor';
import { User } from '@/types/user';

// Types
interface SessionWithStudent extends MentorSession {
  student?: User;
}

export default function MentorSessionsPage() {
  const { user } = useAuth() as { user: { id: string; name: string; email: string } | null };
  const router = useRouter();
  
  // ✅ Fix: use useMentor hook
  const { 
    mentor, 
    isLoading,
    isError 
  } = useMentor(user?.id || '');
  
  const typedMentor = mentor as Mentor | null;
  const sessions = (typedMentor?.sessions || []) as SessionWithStudent[];

  // Filter sessions
  const upcomingSessions = sessions.filter(
    (s: SessionWithStudent) => s.status === 'scheduled' && new Date(s.date) > new Date()
  );

  const pastSessions = sessions.filter(
    (s: SessionWithStudent) => s.status === 'completed' || new Date(s.date) < new Date()
  );

  const cancelledSessions = sessions.filter((s: SessionWithStudent) => s.status === 'cancelled');

  // Helper to get student name
  const getStudentName = (session: SessionWithStudent): string => {
    if (session.student?.name) return session.student.name;
    return 'Student';
  };

  // Helper to get student avatar
  const getStudentAvatar = (session: SessionWithStudent): string | undefined => {
    return session.student?.avatar;
  };

  // Helper to get student initials
  const getStudentInitials = (session: SessionWithStudent): string => {
    const name = getStudentName(session);
    return name[0] || 'S';
  };

  const getSessionIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  // Handle join meeting
  const handleJoinMeeting = (meetingLink?: string) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  // Handle reschedule
  const handleReschedule = (sessionId: string) => {
    router.push(`/dashboard/mentor/sessions/${sessionId}/reschedule`);
  };

  // Handle cancel
  const handleCancel = (sessionId: string) => {
    if (confirm('Are you sure you want to cancel this session?')) {
      console.log('Cancel session:', sessionId);
      // API call to cancel session
    }
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
            My Sessions
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Manage your mentoring sessions
          </p>
        </div>

        {/* Sessions Tabs */}
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastSessions.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledSessions.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Sessions */}
          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingSessions.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                <p className="text-charcoal-500">You don't have any scheduled sessions at the moment.</p>
              </Card>
            ) : (
              upcomingSessions.map((session: SessionWithStudent) => (
                <Card key={session._id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getStudentAvatar(session)} />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {getStudentInitials(session)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{getStudentName(session)}</h3>
                          <p className="text-sm text-charcoal-600">{session.topic}</p>
                        </div>
                        <Badge variant="success">Confirmed</Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(session.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} ({session.duration} min)
                        </span>
                        <span className="flex items-center gap-1">
                          {getSessionIcon(session.meetingLink ? 'video' : undefined)}
                          {session.meetingLink ? 'Video Call' : 'In Person'}
                        </span>
                      </div>

                      {session.description && (
                        <p className="mt-2 text-sm text-charcoal-600 bg-charcoal-100/50 p-3 rounded">
                          {session.description}
                        </p>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleReschedule(session._id)}
                        >
                          Reschedule
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleCancel(session._id)}
                        >
                          Cancel
                        </Button>
                        {session.meetingLink && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleJoinMeeting(session.meetingLink)}
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Join Meeting
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Past Sessions */}
          <TabsContent value="past" className="space-y-4 mt-6">
            {pastSessions.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No past sessions</h3>
                <p className="text-charcoal-500">Your completed sessions will appear here.</p>
              </Card>
            ) : (
              pastSessions.map((session: SessionWithStudent) => (
                <Card key={session._id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getStudentAvatar(session)} />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {getStudentInitials(session)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{getStudentName(session)}</h3>
                          <p className="text-sm text-charcoal-600">{session.topic}</p>
                        </div>
                        {session.studentFeedback ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{session.studentFeedback.rating}</span>
                          </div>
                        ) : (
                          <Badge variant="warning">Awaiting Review</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.duration} min
                        </span>
                      </div>

                      {session.studentFeedback && (
                        <div className="mt-3 p-3 bg-charcoal-100/50 rounded-lg">
                          <p className="text-sm font-medium mb-1">Student Feedback:</p>
                          <p className="text-sm text-charcoal-600">{session.studentFeedback.comment}</p>
                          <p className="text-xs text-charcoal-500 mt-1">
                            {new Date(session.studentFeedback.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {!session.mentorFeedback && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" asChild>
                            <Link href={`/dashboard/mentor/sessions/${session._id}/feedback`}>
                              Leave Feedback
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Cancelled Sessions */}
          <TabsContent value="cancelled" className="space-y-4 mt-6">
            {cancelledSessions.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No cancelled sessions</h3>
                <p className="text-charcoal-500">Cancelled sessions will appear here.</p>
              </Card>
            ) : (
              cancelledSessions.map((session: SessionWithStudent) => (
                <Card key={session._id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getStudentAvatar(session)} />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {getStudentInitials(session)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{getStudentName(session)}</h3>
                          <p className="text-sm text-charcoal-600">{session.topic}</p>
                        </div>
                        <Badge variant="error">Cancelled</Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.duration} min
                        </span>
                      </div>

                      {session.notes && (
                        <p className="mt-2 text-sm text-charcoal-600 bg-red-50 p-3 rounded">
                          <span className="font-medium">Note:</span> {session.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}