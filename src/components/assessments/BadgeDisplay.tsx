'use client';

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Award, Star, Trophy, Medal, Zap, Shield, Crown, Target } from 'lucide-react';

interface Badge {
  id?: string;
  name: string;
  description: string;
  icon?: string;
  image?: string;
  color?: string;
  earnedAt?: Date | string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  category?: string;
  requiredScore?: number;
  score?: number;
}

interface BadgeDisplayProps {
  badges: Badge[];
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  maxDisplay?: number;
  onBadgeClick?: (badge: Badge) => void;
}

const getIconComponent = (iconName?: string) => {
  const icons: Record<string, any> = {
    award: Award,
    star: Star,
    trophy: Trophy,
    medal: Medal,
    zap: Zap,
    shield: Shield,
    crown: Crown,
    target: Target,
  };
  return icons[iconName || ''] || Award;
};

const getRarityStyles = (rarity?: string) => {
  const styles = {
    common: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    rare: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
    epic: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
    legendary: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  };
  return styles[rarity as keyof typeof styles] || styles.common;
};

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
};

export function BadgeDisplay({
  badges,
  size = 'md',
  showTooltip = true,
  maxDisplay,
  onBadgeClick,
}: BadgeDisplayProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remainingCount = maxDisplay
    ? Math.max(0, badges.length - maxDisplay)
    : 0;

  const formatDate = (date?: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const badgeContent = (badge: Badge) => {
    const IconComponent = getIconComponent(badge.icon);
    const rarityStyles = getRarityStyles(badge.rarity);

    return (
      <div
        key={badge.id || badge.name}
        onClick={() => onBadgeClick?.(badge)}
        className={`
          ${sizeClasses[size]} 
          rounded-full border-2 flex items-center justify-center
          ${rarityStyles} cursor-pointer transition-all hover:scale-110 hover:shadow-lg
          ${badge.rarity === 'legendary' ? 'animate-pulse' : ''}
        `}
      >
        {badge.image ? (
          <img
            src={badge.image}
            alt={badge.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <IconComponent className={iconSizes[size]} />
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-3">
        {displayBadges.map((badge) => {
          if (showTooltip) {
            return (
              <Tooltip key={badge.id || badge.name}>
                <TooltipTrigger asChild>
                  {badgeContent(badge)}
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1 max-w-xs p-2">
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {badge.description}
                    </p>
                    {badge.earnedAt && (
                      <p className="text-xs text-gray-400">
                        Earned: {formatDate(badge.earnedAt)}
                      </p>
                    )}
                    {badge.score && (
                      <p className="text-xs text-gray-400">
                        Score: {badge.score}%
                      </p>
                    )}
                    {badge.rarity && (
                      <p className="text-xs capitalize text-gray-400">
                        {badge.rarity}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }

          return badgeContent(badge);
        })}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`
                  ${sizeClasses[size]} 
                  rounded-full border-2 border-gray-200 dark:border-gray-600 
                  bg-gray-100 dark:bg-gray-800
                  flex items-center justify-center cursor-pointer
                  hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                `}
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
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