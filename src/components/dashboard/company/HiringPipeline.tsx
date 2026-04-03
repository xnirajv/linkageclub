'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, Users, CheckCircle, Clock, ArrowRight, TrendingUp, UserCheck, UserPlus, Target } from 'lucide-react';

export interface PipelineApplicant {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
  appliedAt?: Date;
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  count: number;
  applicants: PipelineApplicant[];
}

export interface HiringPipelineProps {
  stages?: PipelineStage[];
  jobTitle?: string;
  isLoading?: boolean;
  onStageClick?: (status: string) => void;
  onApplicantClick?: (applicantId: string) => void;
}

const DEFAULT_STAGES: PipelineStage[] = [
  { name: 'Applied', status: 'pending', count: 0, applicants: [] },
  { name: 'Reviewed', status: 'reviewed', count: 0, applicants: [] },
  { name: 'Shortlisted', status: 'shortlisted', count: 0, applicants: [] },
  { name: 'Hired', status: 'accepted', count: 0, applicants: [] },
];

const STAGE_CONFIG: Record<string, { 
  color: string; 
  bgColor: string; 
  icon: React.ElementType; 
  borderColor: string;
  progressColor: string;
}> = {
  pending: { 
    color: 'text-yellow-700 dark:text-yellow-400', 
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    progressColor: 'bg-yellow-500',
    icon: Clock
  },
  reviewed: { 
    color: 'text-blue-700 dark:text-blue-400', 
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    progressColor: 'bg-blue-500',
    icon: UserCheck
  },
  shortlisted: { 
    color: 'text-green-700 dark:text-green-400', 
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    progressColor: 'bg-green-500',
    icon: CheckCircle
  },
  accepted: { 
    color: 'text-purple-700 dark:text-purple-400', 
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    progressColor: 'bg-purple-500',
    icon: Briefcase
  },
};

export function HiringPipeline({ 
  stages = DEFAULT_STAGES, 
  jobTitle,
  isLoading = false,
  onStageClick,
  onApplicantClick 
}: HiringPipelineProps) {
  
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary-600" />
            Hiring Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-charcoal-100 dark:bg-charcoal-700 rounded-xl"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStageConfig = (status: string) => {
    return STAGE_CONFIG[status] || { 
      color: 'text-charcoal-700', 
      bgColor: 'bg-charcoal-100/50 dark:bg-charcoal-800',
      borderColor: 'border-charcoal-200 dark:border-charcoal-700',
      progressColor: 'bg-charcoal-500',
      icon: Users
    };
  };

  const totalApplicants = stages.reduce((acc, s) => acc + s.count, 0);
  const hiredCount = stages.find(s => s.status === 'accepted')?.count || 0;
  const conversionRate = totalApplicants > 0 ? Math.round((hiredCount / totalApplicants) * 100) : 0;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <Target className="h-4 w-4 text-primary-600" />
            </div>
            Hiring Pipeline
            {jobTitle && (
              <span className="text-sm font-normal text-muted-foreground">
                – {jobTitle}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">Total: {totalApplicants}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <UserPlus className="h-3 w-3" />
              Hired: {hiredCount}
            </span>
            {conversionRate > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="flex items-center gap-1 text-primary-600">
                  <TrendingUp className="h-3 w-3" />
                  {conversionRate}% conversion
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const config = getStageConfig(stage.status);
            const Icon = config.icon;
            const hasApplicants = stage.applicants.length > 0;
            const displayApplicants = stage.applicants.slice(0, 3);
            const stagePercentage = totalApplicants > 0 ? (stage.count / totalApplicants) * 100 : 0;

            return (
              <div
                key={stage.status}
                className={`
                  relative rounded-xl border-2 p-4 transition-all hover:shadow-md cursor-pointer
                  ${config.bgColor} ${config.borderColor}
                `}
                onClick={() => onStageClick?.(stage.status)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onStageClick?.(stage.status)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <h4 className="font-medium text-sm">{stage.name}</h4>
                  </div>
                  <Badge variant="outline" className="bg-card dark:bg-charcoal-900 font-semibold">
                    {stage.count}
                  </Badge>
                </div>

                <div className="space-y-2 min-h-[100px]">
                  {!hasApplicants ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Users className="h-8 w-8 text-charcoal-300 dark:text-charcoal-300 mb-1" />
                      <p className="text-xs text-muted-foreground">No applicants</p>
                    </div>
                  ) : (
                    <>
                      {displayApplicants.map((applicant) => (
                        <div
                          key={applicant._id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-card/80 dark:bg-charcoal-800/50 hover:bg-card dark:hover:bg-charcoal-800 transition-all duration-200 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplicantClick?.(applicant._id);
                          }}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={applicant.avatar} />
                            <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                              {getInitials(applicant.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium truncate flex-1">
                            {applicant.name}
                          </span>
                          <ArrowRight className="h-3 w-3 text-charcoal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                      
                      {stage.applicants.length > 3 && (
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          +{stage.applicants.length - 3} more
                        </p>
                      )}
                    </>
                  )}
                </div>

                {stage.count > 0 && totalApplicants > 0 && (
                  <div className="absolute bottom-0 left-0 h-1 rounded-b-lg transition-all duration-300"
                    style={{ 
                      width: `${stagePercentage}%`,
                      backgroundColor: config.progressColor,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {totalApplicants > 0 && (
          <div className="mt-5 pt-4 border-t border-charcoal-100 dark:border-charcoal-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">Pipeline summary</span>
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                {Math.round((stages[2].count / totalApplicants) * 100)}% shortlisted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {stages.flatMap(s => s.applicants.slice(0, 1)).map((a, i) => (
                  <Avatar key={a._id} className="h-6 w-6 border-2 border-white dark:border-charcoal-900">
                    <AvatarImage src={a.avatar} />
                    <AvatarFallback className="text-[8px] bg-primary-100">
                      {getInitials(a.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-muted-foreground">recent applicants</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HiringPipeline;