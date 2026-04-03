import React from 'react';
import { Badge as BadgeType } from '@/types/user';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Award } from 'lucide-react';

interface ProfileBadgesProps {
  badges: BadgeType[];
}

export function ProfileBadges({ badges }: ProfileBadgesProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No badges earned yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <Card key={badge.name} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <img
                  src={badge.image}
                  alt={badge.name}
                  className="w-12 h-12"
                />
              </div>
              <h3 className="font-semibold mb-1">{badge.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {badge.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Earned {format(new Date(badge.earnedAt), 'MMM d, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
