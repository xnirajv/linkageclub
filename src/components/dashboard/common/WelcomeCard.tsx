'use client';

import React from 'react';
import { Sparkles, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface WelcomeCardProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
    role?: 'company' | 'founder' | 'student' | 'mentor';
  };
  unreadCount?: number;
}

export function WelcomeCard({ user, unreadCount = 0 }: WelcomeCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleGreeting = () => {
    switch (user.role) {
      case 'company': return 'manage your company dashboard';
      case 'founder': return 'track your startup growth';
      case 'mentor': return 'guide and inspire students';
      case 'student': return 'continue your learning journey';
      default: return 'welcome back to your dashboard';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary-700 via-info-600 to-secondary-500 text-white shadow-[0_28px_90px_-40px_rgba(52,74,134,0.78)]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/20 shadow-lg">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-card/15 text-white text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-secondary-200" />
                {getGreeting()}, {user.name}!
              </h2>
              <p className="mt-1 text-white/78">
                {getRoleGreeting()}
              </p>
              {user.email && (
                <p className="mt-1 text-sm text-white/65">{user.email}</p>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="relative rounded-2xl border border-white/15 bg-card/10 px-4 py-3 backdrop-blur-sm">
                <Bell className="h-5 w-5 text-white/80" />
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-secondary-500 p-0 text-xs text-charcoal-950">
                  {unreadCount}
                </Badge>
              </div>
            )}
            <div className="rounded-2xl border border-white/15 bg-card/10 px-4 py-3 text-center backdrop-blur-sm">
              <p className="text-sm text-white/65">Today's Date</p>
              <p className="font-semibold">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
