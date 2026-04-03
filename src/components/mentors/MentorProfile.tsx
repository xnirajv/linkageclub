'use client';

import React, { useState } from 'react';
import { Mentor } from '@/types/mentor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookingModal } from './BookingModal';
import { Star, Clock, Users, CheckCircle, IndianRupee, Calendar } from 'lucide-react';

interface MentorProfileProps {
  mentor: Mentor;
}

export function MentorProfile({ mentor }: MentorProfileProps) {
  const [showBooking, setShowBooking] = useState(false);
  const user = mentor.user || (mentor.userId as any);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-2xl">{user?.name?.[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    {mentor.isVerified && <Badge variant="verified">Verified</Badge>}
                  </div>
                  <p className="text-muted-foreground mt-1">{user?.bio}</p>
                </div>
                <Button onClick={() => setShowBooking(true)}>Book a Session</Button>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{mentor.stats?.averageRating?.toFixed(1) || '—'}</span>
                  <span className="text-muted-foreground">({mentor.stats?.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {mentor.stats?.totalSessions} sessions completed
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {mentor.stats?.repeatStudents} repeat students
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <IndianRupee className="h-4 w-4" />
                  {mentor.hourlyRate?.toLocaleString()}/hr
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expertise */}
      {mentor.expertise?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Expertise</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mentor.expertise.map((e) => (
                <div key={e.skill} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {e.verified && <CheckCircle className="h-4 w-4 text-success-600" />}
                    <span className="font-medium">{e.skill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="skill" size="sm">{e.level}</Badge>
                    <span className="text-sm text-muted-foreground">{e.yearsOfExperience} yrs</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability */}
      <Card>
        <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{mentor.availability?.type}</span>
            <span className="text-muted-foreground">· {mentor.availability?.timezone}</span>
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      {mentor.reviews?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mentor.reviews.slice(0, 5).map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.student?.avatar} />
                        <AvatarFallback>{review.student?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{review.student?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-charcoal-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <BookingModal mentor={mentor} isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </div>
  );
}
