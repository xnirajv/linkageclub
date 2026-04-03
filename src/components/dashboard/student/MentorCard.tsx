'use client';

import React from 'react';
import { Mentor } from '@/types/mentor';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, IndianRupee, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';

interface MentorCardProps {
  mentor: Mentor;
  compact?: boolean;
}

export function MentorCard({ mentor, compact = false }: MentorCardProps) {
  const user = mentor.user || (mentor.userId as any);
  const isAvailable = mentor.availability?.isAvailable ?? true;
  const nextAvailable = typeof mentor.availability?.nextAvailable === 'string'
    ? mentor.availability.nextAvailable
    : undefined;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>{user?.name?.[0] ?? 'M'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-sm truncate">{user?.name}</p>
            {mentor.isVerified && <Badge variant="verified" size="sm">✓</Badge>}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {mentor.stats?.averageRating?.toFixed(1) || '—'}
            </span>
            <span>{mentor.hourlyRate?.toLocaleString()}/hr</span>
          </div>
        </div>
        <Button size="xs" asChild>
          <Link href={`/dashboard/student/mentors/${mentor._id}`}>Book</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.[0] ?? 'M'}</AvatarFallback>
            </Avatar>
            {isAvailable && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full ring-2 ring-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{user?.name}</h3>
              {mentor.isVerified && <Badge variant="verified" size="sm">Verified</Badge>}
              {!isAvailable && (
                <Badge variant="outline" size="sm" className="text-charcoal-500">Away</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{user?.bio}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {mentor.stats?.averageRating?.toFixed(1) || '—'} ({mentor.stats?.totalReviews || 0} reviews)
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {mentor.stats?.totalSessions || 0} sessions
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            {mentor.stats?.responseRate || 95}% response
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {mentor.expertise?.slice(0, 3).map((e) => (
            <Badge key={e.skill} variant="skill" size="sm">{e.skill}</Badge>
          ))}
          {(mentor.expertise?.length || 0) > 3 && (
            <Badge variant="outline" size="sm">+{mentor.expertise!.length - 3}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-semibold">
            <IndianRupee className="h-4 w-4" />
            {mentor.hourlyRate?.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/hr</span>
          </div>
          {nextAvailable && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Next: {new Date(nextAvailable).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t">
        <Button size="sm" asChild className="w-full" disabled={!isAvailable}>
          <Link href={`/dashboard/student/mentors/${mentor._id}`}>
            {isAvailable ? 'Book Session' : 'Check Availability'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
