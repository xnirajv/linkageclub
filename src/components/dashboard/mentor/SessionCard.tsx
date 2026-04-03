'use client';

import React from 'react';
import { MentorSession } from '@/types/mentor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Video, IndianRupee, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SessionCardProps {
  session: MentorSession;
  onCancel?: (id: string) => void;
}

const STATUS_VARIANTS: Record<string, any> = {
  scheduled: 'success',
  completed: 'outline',
  cancelled: 'error',
  'no-show': 'warning',
}; 

export function SessionCard({ session, onCancel }: SessionCardProps) {
  const isPast = new Date(session.date) < new Date();

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={session.student?.avatar} />
            <AvatarFallback>{session.student?.name?.[0] ?? 'S'}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{session.student?.name}</p>
                <p className="text-sm text-muted-foreground">{session.topic}</p>
              </div>
              <Badge variant={STATUS_VARIANTS[session.status] || 'outline'} size="sm" className="capitalize">
                {session.status}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(session.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {session.duration} min
              </span>
              <span className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                {session.amount.toLocaleString()}
              </span>
            </div>

            {session.studentFeedback && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < session.studentFeedback!.rating ? 'fill-yellow-400 text-yellow-400' : 'text-charcoal-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{session.studentFeedback.comment}</p>
              </div>
            )}

            {!isPast && session.status === 'scheduled' && (
              <div className="flex gap-2 mt-3">
                {session.meetingLink && (
                  <Button size="sm" asChild className="gap-1">
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4" />
                      Join Meeting
                    </a>
                  </Button>
                )}
                {onCancel && (
                  <Button size="sm" variant="outline" onClick={() => onCancel(session._id)} className="text-error-600">
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}