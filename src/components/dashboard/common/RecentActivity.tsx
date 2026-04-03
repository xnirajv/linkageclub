'use client';

import React from 'react';
import { Activity, User, ChevronRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface ActivityItem {
  id: string;
  user?: { name: string; avatar?: string };
  action: string;
  timestamp: Date;
  link?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  title?: string;
  viewAllLink?: string;
  isLoading?: boolean;
}

export function RecentActivity({ activities, title = 'Recent Activity', viewAllLink, isLoading = false }: RecentActivityProps) {
  const getInitials = (name: string) => name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-charcoal-100" />
                <div className="flex-1">
                  <div className="h-4 bg-charcoal-100 rounded w-3/4" />
                  <div className="h-3 bg-charcoal-100 rounded w-1/2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <Activity className="h-4 w-4 text-primary-600" />
            </div>
            {title}
          </CardTitle>
          {viewAllLink && activities.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href={viewAllLink}>
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center">
              <Activity className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1">Your recent actions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-3 ${activity.link ? 'cursor-pointer hover:bg-charcoal-100/50 dark:hover:bg-charcoal-800/50 rounded-lg p-1 -ml-1 transition-colors' : ''}`}
                onClick={() => activity.link && window.location.assign(activity.link)}
              >
                {activity.user ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                      {getInitials(activity.user.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center">
                    <User className="h-4 w-4 text-charcoal-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal-700 dark:text-charcoal-300">
                    {activity.user && <span className="font-medium">{activity.user.name} </span>}
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}