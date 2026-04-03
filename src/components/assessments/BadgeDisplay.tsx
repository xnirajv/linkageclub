'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Award, Star, Trophy, Medal, Zap, Shield, Crown, Target } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  earnedAt?: Date;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  category?: string;
}

interface BadgeDisplayProps {
  badges: Badge[];
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  maxDisplay?: number;
  onBadgeClick?: (badge: Badge) => void;
}

const getIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'award':
      return Award;
    case 'star':
      return Star;
    case 'trophy':
      return Trophy;
    case 'medal':
      return Medal;
    case 'zap':
      return Zap;
    case 'shield':
      return Shield;
    case 'crown':
      return Crown;
    case 'target':
      return Target;
    default:
      return Award;
  }
};

const getRarityColor = (rarity?: string) => {
  switch (rarity) {
    case 'common':
      return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
    case 'rare':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'epic':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'legendary':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse';
    default:
      return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
  }
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function BadgeDisplay({ 
  badges, 
  size = 'md', 
  showTooltip = true,
  maxDisplay,
  onBadgeClick 
}: BadgeDisplayProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay ? Math.max(0, badges.length - maxDisplay) : 0;

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {displayBadges.map((badge) => {
          const IconComponent = getIconComponent(badge.icon);
          const rarityColor = getRarityColor(badge.rarity);

          const badgeElement = (
            <div
              key={badge.id}
              onClick={() => onBadgeClick?.(badge)}
              className={`
                ${sizeClasses[size]} 
                rounded-full border-2 flex items-center justify-center
                ${rarityColor} cursor-pointer transition-transform hover:scale-110
              `}
            >
              <IconComponent className={`
                ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'}
              `} />
            </div>
          );

          if (showTooltip) {
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  {badgeElement}
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 max-w-xs">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-sm text-charcoal-500">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-xs text-charcoal-400">
                        Earned on {formatDate(badge.earnedAt)}
                      </p>
                    )}
                    {badge.rarity && (
                      <p className="text-xs capitalize text-charcoal-400">
                        Rarity: {badge.rarity}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return badgeElement;
        })}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`
                  ${sizeClasses[size]} 
                  rounded-full border-2 border-charcoal-200 bg-charcoal-100
                  flex items-center justify-center cursor-pointer
                  hover:bg-charcoal-100 transition-colors
                `}
              >
                <span className="text-xs font-medium text-charcoal-600">
                  +{remainingCount}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} more badges</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Category Badge Display
export function CategoryBadgeDisplay({ 
  badges,
  categories 
}: { 
  badges: Badge[];
  categories: string[];
}) {
  const groupedBadges = categories.reduce((acc, category) => {
    acc[category] = badges.filter(b => b.category === category);
    return acc;
  }, {} as Record<string, Badge[]>);

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-charcoal-500 mb-3">{category}</h4>
          <div className="flex flex-wrap gap-3">
            {groupedBadges[category]?.map((badge) => (
              <Card key={badge.id} className="p-3 text-center w-24">
                <div className="flex justify-center mb-2">
                  <BadgeDisplay badges={[badge]} showTooltip={false} />
                </div>
                <p className="text-xs font-medium truncate">{badge.name}</p>
                {badge.earnedAt && (
                  <p className="text-[10px] text-charcoal-400">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </Card>
            ))}
            {groupedBadges[category]?.length === 0 && (
              <p className="text-sm text-charcoal-400">No badges earned yet</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}