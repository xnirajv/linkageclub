'use client';

import React from 'react';
import { Shield, TrendingUp, Info, Award, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TrustScoreProps {
  score: number;
  trend?: number;
  factors?: {
    label: string;
    value: number;
    description: string;
    nextMilestone?: string;
  }[];
  maxScore?: number;
  onImproveClick?: () => void;
}

export function TrustScore({ 
  score, 
  trend, 
  factors = [], 
  maxScore = 100,
  onImproveClick 
}: TrustScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-info-700 dark:text-info-300';
    if (score >= 60) return 'text-primary-700 dark:text-info-300';
    if (score >= 40) return 'text-secondary-800 dark:text-secondary-200';
    return 'text-charcoal-700 dark:text-charcoal-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getNextMilestone = (score: number) => {
    if (score < 40) return '40 points - Bronze Level';
    if (score < 60) return '60 points - Silver Level';
    if (score < 80) return '80 points - Gold Level';
    return '100 points - Elite Level';
  };

  const getPointsToNext = () => {
    if (score < 40) return 40 - score;
    if (score < 60) return 60 - score;
    if (score < 80) return 80 - score;
    if (score < 100) return 100 - score;
    return 0;
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-info-600';
    if (score >= 60) return 'bg-primary-700';
    if (score >= 40) return 'bg-secondary-500';
    return 'bg-charcoal-700';
  };

  return (
    <TooltipProvider>
      <Card className="luxury-border bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all duration-300 hover:shadow-xl dark:from-charcoal-900/90 dark:to-charcoal-800/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary-600" />
            Trust Score
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help ml-auto" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Your trust score is calculated based on your activity, 
                  reviews, and verification status. Higher scores mean 
                  more trust from the community.
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-6xl font-bold tracking-tight ${getScoreColor(score)}`}>
                {score}
                <span className="text-lg text-muted-foreground font-normal">/{maxScore}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Award className={`h-4 w-4 ${getScoreColor(score)}`} />
                <p className={`text-sm font-medium mt-1 ${getScoreColor(score)}`}>
                  {getScoreLabel(score)}
                </p>
              </div>
              {trend !== undefined && (
                <div className={`mt-2 flex items-center justify-center gap-1 text-sm ${
                  trend > 0 ? 'text-info-700 dark:text-info-300' : 'text-charcoal-700 dark:text-charcoal-100'
                }`}>
                  <TrendingUp className={`h-4 w-4 ${
                    trend > 0 ? 'text-info-700 dark:text-info-300' : 'text-charcoal-700 rotate-180 dark:text-charcoal-100'
                  }`} />
                  <span>
                    {trend > 0 ? '+' : ''}{trend} points from last month
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={score} 
                max={maxScore}
                className={`h-2 ${getProgressColor(score)}`}
              />
            </div>

            {/* Next Milestone */}
            {score < maxScore && (
              <div className="flex items-center justify-between rounded-[20px] bg-muted/30 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary-600" />
                  <span>Next: {getNextMilestone(score)}</span>
                </div>
                <span className="font-medium">{getPointsToNext()} points to go</span>
              </div>
            )}

            {/* Score Factors */}
            {factors.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="font-semibold text-sm">Score Breakdown</h4>
                {factors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{factor.label}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">{factor.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="font-medium">{Math.round(factor.value)}%</span>
                    </div>
                    <Progress 
                      value={factor.value} 
                      max={100}
                      className="h-1.5 bg-charcoal-100 dark:bg-charcoal-800"
                    />
                    {factor.nextMilestone && (
                      <p className="text-xs text-muted-foreground">{factor.nextMilestone}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Improve Button */}
            {onImproveClick && (
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={onImproveClick}
              >
                How to Improve Your Score →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
