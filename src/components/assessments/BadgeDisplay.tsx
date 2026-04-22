'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Award, Star, Trophy, Medal, Zap, Shield, Crown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Badge {
  id?: string;
  name: string;
  description?: string;
  image?: string;
  earnedAt?: Date;
}

interface BadgeDisplayProps {
  badges: Badge[];
  size?: 'sm' | 'md' | 'lg';
}

const getIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('star')) return Star;
  if (lowerName.includes('trophy')) return Trophy;
  if (lowerName.includes('medal')) return Medal;
  if (lowerName.includes('zap')) return Zap;
  if (lowerName.includes('shield')) return Shield;
  if (lowerName.includes('crown')) return Crown;
  return Award;
};

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-16 h-16 text-lg',
  lg: 'w-24 h-24 text-2xl',
};

export function BadgeDisplay({ badges, size = 'md' }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No badges yet</h3>
        <p className="text-gray-500">Complete skill assessments to earn badges</p>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge, index) => {
          const Icon = getIcon(badge.name);
          return (
            <Tooltip key={badge.id || index}>
              <TooltipTrigger asChild>
                <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className={`${sizeClasses[size]} mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="h-1/2 w-1/2" />
                  </div>
                  <p className="font-medium mt-3 text-sm">{badge.name}</p>
                  {badge.earnedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{badge.description || `${badge.name} badge earned!`}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}