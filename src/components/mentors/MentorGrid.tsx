'use client';

import React from 'react';
import { Mentor } from '@/types/mentor';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, IndianRupee, Clock } from 'lucide-react';
import Link from 'next/link';

interface MentorGridProps {
  mentors: Mentor[];
  isLoading?: boolean;
  emptyMessage?: string;
}

function MentorCard({ mentor }: { mentor: Mentor }) {
  const user = mentor.user || (mentor.userId as any);
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.[0] ?? 'M'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{user?.name}</h3>
              {mentor.isVerified && <Badge variant="verified" size="sm">Verified</Badge>}
            </div>
            <p className="text-sm text-muted-foreground truncate">{user?.bio}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{mentor.stats?.averageRating?.toFixed(1) || '—'}</span>
            <span className="text-muted-foreground">({mentor.stats?.totalReviews || 0})</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {mentor.stats?.totalSessions || 0} sessions
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {mentor.expertise?.slice(0, 3).map((e) => (
            <Badge key={e.skill} variant="skill" size="sm">{e.skill}</Badge>
          ))}
          {(mentor.expertise?.length || 0) > 3 && (
            <Badge variant="outline" size="sm">+{mentor.expertise!.length - 3}</Badge>
          )}
        </div>

        <div className="flex items-center gap-1 font-semibold">
          <IndianRupee className="h-4 w-4" />
          {mentor.hourlyRate?.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/hr</span>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t flex gap-2">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <Link href={`/dashboard/student/mentors/${mentor._id}`}>View Profile</Link>
        </Button>
        <Button size="sm" asChild className="flex-1">
          <Link href={`/dashboard/student/mentors/${mentor._id}?book=true`}>Book Session</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function MentorGrid({ mentors, isLoading, emptyMessage = 'No mentors found' }: MentorGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!mentors.length) {
    return <EmptyState icon={Users} title={emptyMessage} description="Try adjusting your search filters" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mentors.map((mentor) => (
        <MentorCard key={mentor._id} mentor={mentor} />
      ))}
    </div>
  );
}
