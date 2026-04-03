'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // ✅ Fixed import path (lowercase)
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // ✅ Fixed import path
import { Badge } from '@/components/ui/badge'; // ✅ Fixed import path
import { Button } from '@/components/ui/button'; // ✅ Fixed import path
import { EmptyState } from '@/components/shared/EmptyState';
import { Users, X, Heart, MessageCircle } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';

// Define types
interface User {
  _id: string;
  name: string;
  avatar?: string;
  location?: string;
  bio?: string;
  skills?: Array<{ name: string; level?: string }>;
}

interface Match {
  _id: string;
  user?: User;
  score?: number;
  matchedAt?: string;
}

export function CoFounderMatch() {
  const { data, isLoading, mutate } = useSWR<any>('/api/ai/match', fetcher);
  const matches: Match[] = data?.matches || [];

  const handleAction = async (userId: string, action: 'connect' | 'skip') => {
    try {
      await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      mutate();
    } catch (error) {
      console.error('Error handling match action:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5">
              <div className="flex gap-4">
                <div className="h-16 w-16 bg-charcoal-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-charcoal-100 rounded w-3/4" />
                  <div className="h-3 bg-charcoal-100 rounded w-1/2" />
                  <div className="h-3 bg-charcoal-100 rounded w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!matches.length) {
    return (
      <EmptyState
        icon={Users}
        title="No co-founder matches yet"
        description="Complete your startup profile to get matched with potential co-founders"
        actionLabel="Complete Profile"
        onAction={() => window.location.href = '/dashboard/founder/startup/edit'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {matches.map((match) => (
        <Card key={match._id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary-100">
                <AvatarImage src={match.user?.avatar} />
                <AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
                  {match.user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{match.user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{match.user?.location || 'Location not specified'}</p>
                  </div>
                  {match.score && (
                    <Badge variant="success" size="sm" className="ml-2">
                      {match.score}% match
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {match.user?.bio || 'No bio provided'}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {match.user?.skills?.slice(0, 4).map((skill) => (
                    <Badge key={skill.name} variant="skill" size="sm">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-5 py-3 border-t bg-charcoal-100/60 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAction(match._id, 'skip')} 
              className="gap-1 flex-1"
            >
              <X className="h-4 w-4" /> Skip
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleAction(match._id, 'connect')} 
              className="flex-1 gap-1 bg-primary-600 hover:bg-primary-700"
            >
              <Heart className="h-4 w-4" /> Connect
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
