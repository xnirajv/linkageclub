'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  Award,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  PlayCircle,
  Zap,
  Flame,
  Star,
  Trophy,
  Medal,
  Gift,
  Lock,
  Unlock,
  Sparkles,
  Code,
  ChevronRight,
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  date?: Date;
  icon?: React.ReactNode;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  unlockedAt?: Date;
  progress?: number;
  total?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ProgressTrackerProps {
  title?: string;
  subtitle?: string;
  
  // Overall progress
  overallProgress: number;
  completedItems: number;
  totalItems: number;
  
  // Time tracking
  timeSpent: number; // in minutes
  estimatedTotalTime: number; // in minutes
  streak?: number;
  
  // Points/XP
  points?: number;
  totalPoints?: number;
  level?: number;
  nextLevelPoints?: number;
  
  // Milestones
  milestones?: Milestone[];
  
  // Achievements
  achievements?: Achievement[];
  
  // Weekly activity
  weeklyActivity?: {
    day: string;
    minutes: number;
  }[];
  
  // Skills progress
  skills?: {
    name: string;
    progress: number;
    level?: string;
  }[];
  
  // Next up
  nextItems?: {
    id: string;
    title: string;
    type: string;
    duration?: number;
  }[];
  
  variant?: 'default' | 'compact' | 'detailed';
  showAchievements?: boolean;
  showMilestones?: boolean;
  showWeekly?: boolean;
  showSkills?: boolean;
  showNext?: boolean;
  onItemClick?: (itemId: string) => void;
}

export function ProgressTracker({
  title = 'Your Progress',
  subtitle,
  overallProgress,
  completedItems,
  totalItems,
  timeSpent,
  estimatedTotalTime,
  streak = 0,
  points,
  totalPoints,
  level,
  nextLevelPoints,
  milestones = [],
  achievements = [],
  weeklyActivity = [],
  skills = [],
  nextItems = [],
  variant = 'default',
  showAchievements = true,
  showMilestones = true,
  showWeekly = true,
  showSkills = true,
  showNext = true,
  onItemClick,
}: ProgressTrackerProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    }
    if (mins === 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}`;
    }
    return `${hours}h ${mins}m`;
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-500 bg-yellow-100';
      case 'epic':
        return 'text-purple-500 bg-purple-100';
      case 'rare':
        return 'text-blue-500 bg-blue-100';
      default:
        return 'text-charcoal-500 bg-charcoal-100';
    }
  };

  const getDayAbbreviation = (day: string) => {
    return day.slice(0, 3);
  };

  const remainingTime = estimatedTotalTime - timeSpent;
  const percentTimeSpent = (timeSpent / estimatedTotalTime) * 100;

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="skill">{completedItems}/{totalItems} completed</Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-charcoal-600">Overall Progress</span>
              <span className="font-medium">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal-600 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Time spent
            </span>
            <span className="font-medium">{formatTime(timeSpent)}</span>
          </div>

          {streak > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal-600 flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                Current streak
              </span>
              <span className="font-medium text-orange-500">{streak} days</span>
            </div>
          )}

          {points !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal-600 flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Points earned
              </span>
              <span className="font-medium">{points} pts</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-charcoal-950">{title}</h2>
          {subtitle && <p className="text-charcoal-600 mt-1">{subtitle}</p>}
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall Progress */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-charcoal-500">Overall Progress</span>
              <Target className="h-4 w-4 text-primary-600" />
            </div>
            <div className="text-2xl font-bold mb-1">{Math.round(overallProgress)}%</div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-charcoal-500 mt-2">
              {completedItems} of {totalItems} completed
            </p>
          </Card>

          {/* Time Spent */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-charcoal-500">Time Spent</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatTime(timeSpent)}</div>
            <div className="w-full bg-charcoal-100 rounded-full h-1.5 mb-2">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${percentTimeSpent}%` }}
              />
            </div>
            <p className="text-xs text-charcoal-500">
              {formatTime(remainingTime)} remaining
            </p>
          </Card>

          {/* Streak */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-charcoal-500">Current Streak</span>
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold mb-1 text-orange-500">{streak} days</div>
            <div className="flex gap-1 mt-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < streak ? 'bg-orange-500' : 'bg-charcoal-100'
                  }`}
                />
              ))}
            </div>
          </Card>

          {/* Points/Level */}
          {points !== undefined && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-charcoal-500">Points</span>
                <Award className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold mb-1">{points} pts</div>
              {level && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-charcoal-500">Level {level}</span>
                  {nextLevelPoints && (
                    <span className="text-charcoal-500">{points}/{nextLevelPoints}</span>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Weekly Activity */}
        {showWeekly && weeklyActivity.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyActivity.map((day) => {
                const maxMinutes = Math.max(...weeklyActivity.map(d => d.minutes));
                const height = maxMinutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
                
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary-100 rounded-t-lg transition-all hover:bg-primary-200"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    >
                      <div className="relative group">
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-charcoal-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {day.minutes} minutes
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-charcoal-500">{getDayAbbreviation(day.day)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Skills Progress */}
        {showSkills && skills.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Skills Progress</h3>
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-charcoal-600">{skill.progress}%</span>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                  {skill.level && (
                    <p className="text-xs text-charcoal-500 mt-1">Level: {skill.level}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Milestones */}
        {showMilestones && milestones.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Milestones</h3>
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className={`p-2 rounded-full ${
                    milestone.completed ? 'bg-green-100' : 'bg-charcoal-100'
                  }`}>
                    {milestone.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      milestone.icon || <Target className="h-5 w-5 text-charcoal-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{milestone.title}</h4>
                    {milestone.description && (
                      <p className="text-sm text-charcoal-500">{milestone.description}</p>
                    )}
                  </div>
                  {milestone.date && (
                    <span className="text-xs text-charcoal-400">
                      {milestone.completed ? 'Completed' : 'Due'} {new Date(milestone.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Achievements */}
        {showAchievements && achievements.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`text-center p-3 border rounded-lg ${
                    achievement.unlockedAt ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'opacity-50'
                  }`}
                >
                  <div className="relative inline-block">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                      achievement.unlockedAt
                        ? getRarityColor(achievement.rarity)
                        : 'bg-charcoal-100'
                    }`}>
                      {achievement.icon || <Award className="h-6 w-6" />}
                    </div>
                    {!achievement.unlockedAt && (
                      <Lock className="absolute -top-1 -right-1 h-4 w-4 text-charcoal-400" />
                    )}
                  </div>
                  <p className="font-medium text-sm mt-2">{achievement.name}</p>
                  <p className="text-xs text-charcoal-500 line-clamp-2">{achievement.description}</p>
                  {achievement.progress !== undefined && achievement.total !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>{achievement.progress}/{achievement.total}</span>
                        <span>{Math.round((achievement.progress / achievement.total) * 100)}%</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.total) * 100} className="h-1" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Next Up */}
        {showNext && nextItems.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Next Up</h3>
            <div className="space-y-2">
              {nextItems.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left p-3 border rounded-lg hover:bg-charcoal-100/50 transition-colors"
                  onClick={() => onItemClick?.(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-primary-100 rounded">
                        {item.type === 'video' && <PlayCircle className="h-4 w-4 text-primary-600" />}
                        {item.type === 'quiz' && <Award className="h-4 w-4 text-primary-600" />}
                        {item.type === 'project' && <Code className="h-4 w-4 text-primary-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.duration && (
                          <p className="text-xs text-charcoal-500">{item.duration} min</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-charcoal-400" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-charcoal-500">{subtitle}</p>}
        </div>
        <Badge variant="skill">
          {completedItems}/{totalItems}
        </Badge>
      </div>

      {/* Main Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-charcoal-600">Overall Progress</span>
          <span className="font-semibold text-primary-600">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
          <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
          <p className="text-lg font-semibold">{formatTime(timeSpent)}</p>
          <p className="text-xs text-charcoal-500">Time spent</p>
        </div>

        {streak > 0 && (
          <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
            <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-lg font-semibold text-orange-500">{streak} days</p>
            <p className="text-xs text-charcoal-500">Streak</p>
          </div>
        )}

        {points !== undefined && (
          <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
            <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-semibold">{points} pts</p>
            <p className="text-xs text-charcoal-500">Points</p>
          </div>
        )}

        {level && (
          <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-lg font-semibold">Level {level}</p>
            <p className="text-xs text-charcoal-500">Progress</p>
          </div>
        )}
      </div>

      {/* Recent Milestones */}
      {milestones.slice(0, 3).map((milestone) => (
        <div key={milestone.id} className="flex items-center gap-2 text-sm mb-2">
          {milestone.completed ? (
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-charcoal-300 shrink-0" />
          )}
          <span className={milestone.completed ? 'text-charcoal-700' : 'text-charcoal-400'}>
            {milestone.title}
          </span>
        </div>
      ))}

      {/* Next Item */}
      {nextItems.length > 0 && (
        <button
          className="mt-4 w-full text-left p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          onClick={() => onItemClick?.(nextItems[0].id)}
        >
          <p className="text-xs text-primary-600 mb-1">Next up</p>
          <p className="font-medium text-primary-700">{nextItems[0].title}</p>
        </button>
      )}
    </Card>
  );
}
