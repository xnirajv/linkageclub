'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewForm } from '@/components/mentors/ReviewForm';
import { Calendar, Clock, Video, IndianRupee, Star, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';
import DashboardLayout from '@/app/dashboard/layout';

// Types based on MentorSession from your types
interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Mentor {
  _id: string;
  user?: User;
}

interface StudentFeedback {
  rating: number;
  comment: string;
  submittedAt: string;
}

interface Session {
  _id: string;
  mentorId: string;
  mentor?: Mentor;
  topic: string;
  description?: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  amount?: number;
  meetingLink?: string;
  studentFeedback?: StudentFeedback;
}

interface ApiResponse {
  session?: Session;
  error?: string;
}

export default function StudentMentorSessionDetailPage() {
  const params = useParams();
  const sessionId = params?.id as string;
  
  const { data, error, isLoading } = useSWR<ApiResponse>(
    sessionId ? `/api/mentors/sessions/${sessionId}` : null,
    fetcher
  );
  
  const session = data?.session;

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-10">
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-medium mb-2">Session Not Found</h3>
            <p className="text-charcoal-500 max-w-md">
              The session you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const isPast = new Date(session.date) < new Date();

  // Get status badge variant
  const getStatusVariant = () => {
    switch (session.status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">Session Details</h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">View your mentoring session information</p>
        </div>

        {/* Session Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session.mentor?.user?.avatar} />
                <AvatarFallback className="text-xl">
                  {session.mentor?.user?.name?.[0] || 'M'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{session.mentor?.user?.name || 'Mentor'}</h2>
                    <p className="text-sm text-muted-foreground">{session.topic}</p>
                  </div>
                  <Badge variant={getStatusVariant()}>
                    {session.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(session.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {session.duration} min
                  </span>
                  {session.amount && (
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {session.amount.toLocaleString()}
                    </span>
                  )}
                </div>

                {!isPast && session.status === 'scheduled' && session.meetingLink && (
                  <Button className="mt-4 gap-2" asChild>
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4" />
                      Join Meeting
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Description */}
        {session.description && (
          <Card>
            <CardHeader>
              <CardTitle>Session Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-charcoal-700 dark:text-charcoal-300">{session.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Leave Review - for completed sessions without feedback */}
        {session.status === 'completed' && !session.studentFeedback && (
          <Card>
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewForm
                sessionId={session._id}
                mentorId={session.mentorId}
              />
            </CardContent>
          </Card>
        )}

        {/* Show existing review */}
        {session.studentFeedback && (
          <Card>
            <CardHeader>
              <CardTitle>Your Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${
                      i < session.studentFeedback!.rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-charcoal-200'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-sm text-charcoal-700 dark:text-charcoal-300">{session.studentFeedback.comment}</p>
              <p className="text-xs text-charcoal-500 mt-2">
                Submitted on {new Date(session.studentFeedback.submittedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}