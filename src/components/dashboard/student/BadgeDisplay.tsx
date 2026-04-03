'use client';

import React from 'react';
import { Badge as BadgeType } from '@/types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Shield, Award, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface BadgeDisplayProps {
  badges: BadgeType[];
  compact?: boolean;
  nextBadge?: {
    name: string;
    pointsNeeded: number;
    currentPoints: number;
  };
}

export function BadgeDisplay({ badges, compact = false, nextBadge }: BadgeDisplayProps) {
  if (!badges?.length) {
    if (compact) {
      return (
        <div className="text-center py-4">
          <Shield className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No badges yet</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center py-8 text-center">
        <Award className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground font-medium">No badges earned yet</p>
        <p className="text-xs text-muted-foreground mt-1">Complete assessments and projects to earn badges</p>
        <Button size="sm" variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/student/assessments">
            Take Your First Assessment
          </Link>
        </Button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {badges.slice(0, 4).map((badge, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-primary-50 rounded-full" title={badge.description}>
              {badge.image ? (
                <Image src={badge.image} alt={badge.name} width={14} height={14} />
              ) : (
                <Shield className="h-3.5 w-3.5 text-primary-600" />
              )}
              <span className="text-xs font-medium text-primary-700">{badge.name}</span>
            </div>
          ))}
          {badges.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{badges.length - 4} more
            </Badge>
          )}
        </div>
        {nextBadge && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next: {nextBadge.name}</span>
              <span className="text-primary-600">{nextBadge.currentPoints}/{nextBadge.pointsNeeded} pts</span>
            </div>
            <div className="h-1.5 bg-charcoal-100 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-primary-600 rounded-full" 
                style={{ width: `${(nextBadge.currentPoints / nextBadge.pointsNeeded) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge, i) => (
        <Card key={i} className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-center mb-3">
              {badge.image ? (
                <Image src={badge.image} alt={badge.name} width={56} height={56} />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
              )}
            </div>
            <p className="font-semibold text-sm">{badge.name}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{badge.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(badge.earnedAt), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}