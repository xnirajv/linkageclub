'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Circle,
  Lock,
  PlayCircle,
  FileText,
  Video,
  BookOpen,
  Code,
  Download,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  Star,
  FileCheck,
  HelpCircle,
  Users,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

interface Resource {
  id: string;
  type: 'video' | 'article' | 'exercise' | 'quiz' | 'code' | 'download';
  title: string;
  duration?: number;
  completed?: boolean;
  locked?: boolean;
  url?: string;
  points?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface WeekData {
  weekNumber: number;
  title: string;
  description?: string;
  resources: Resource[];
  completed?: boolean;
  progress?: number;
  totalDuration?: number;
  points?: number;
  earnedPoints?: number;
  prerequisites?: string[];
  objectives?: string[];
  projects?: {
    title: string;
    description: string;
    completed?: boolean;
  }[];
}

interface WeekViewProps {
  week: WeekData;
  isExpanded?: boolean;
  onToggle?: () => void;
  onResourceClick?: (resource: Resource) => void;
  showProgress?: boolean;
  compact?: boolean;
  courseId?: string;
}

export function WeekView({
  week,
  isExpanded = false,
  onToggle,
  onResourceClick,
  showProgress = true,
  compact = false,
  courseId,
}: WeekViewProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  const handleToggle = () => {
    setExpanded(!expanded);
    onToggle?.();
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'article':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'exercise':
        return <Code className="h-4 w-4 text-orange-500" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-purple-500" />;
      case 'code':
        return <Code className="h-4 w-4 text-red-500" />;
      case 'download':
        return <Download className="h-4 w-4 text-charcoal-500" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-charcoal-100 text-charcoal-700';
    }
  };

  const completedCount = week.resources.filter(r => r.completed).length;
  const totalCount = week.resources.length;
  const progress = (completedCount / totalCount) * 100;

  if (compact) {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={handleToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              week.completed ? 'bg-green-100' : 'bg-charcoal-100'
            }`}>
              {week.completed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <span className="text-sm font-medium">{week.weekNumber}</span>
              )}
            </div>
            <div>
              <h3 className="font-medium">Week {week.weekNumber}: {week.title}</h3>
              <p className="text-sm text-charcoal-500">
                {completedCount}/{totalCount} completed • {week.totalDuration} min
              </p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-charcoal-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Week Header */}
      <div
        className="p-6 bg-gradient-to-r from-gray-50 to-white border-b cursor-pointer hover:bg-charcoal-100/60 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              week.completed ? 'bg-green-100' : 'bg-primary-100'
            }`}>
              {week.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <span className="text-lg font-bold text-primary-600">{week.weekNumber}</span>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-1">Week {week.weekNumber}: {week.title}</h2>
              {week.description && (
                <p className="text-charcoal-600 mb-3">{week.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {week.totalDuration} min total
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {totalCount} resources
                </span>
                {week.points && (
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {week.earnedPoints}/{week.points} points
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon">
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-charcoal-600">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* Learning Objectives */}
          {week.objectives && week.objectives.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-600" />
                Learning Objectives
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-charcoal-700">
                {week.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources List */}
          <div className="space-y-2">
            <h3 className="font-semibold mb-3">Resources</h3>
            {week.resources.map((resource) => (
              <div
                key={resource.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  resource.locked
                    ? 'bg-charcoal-100/50 opacity-60'
                    : 'hover:bg-charcoal-100/50 cursor-pointer'
                }`}
                onClick={() => !resource.locked && onResourceClick?.(resource)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {resource.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : resource.locked ? (
                    <Lock className="h-5 w-5 text-charcoal-400" />
                  ) : (
                    getResourceIcon(resource.type)
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{resource.title}</span>
                      {resource.difficulty && (
                        <Badge className={getDifficultyColor(resource.difficulty)} size="sm">
                          {resource.difficulty}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-500">
                      <span className="capitalize">{resource.type}</span>
                      {resource.duration && (
                        <>
                          <span>•</span>
                          <span>{resource.duration} min</span>
                        </>
                      )}
                      {resource.points && (
                        <>
                          <span>•</span>
                          <span>{resource.points} points</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {resource.type === 'video' && (
                  <PlayCircle className="h-5 w-5 text-primary-600" />
                )}
                {resource.type === 'quiz' && !resource.completed && !resource.locked && (
                  <Button size="sm" variant="outline">Start Quiz</Button>
                )}
                {resource.type === 'exercise' && !resource.completed && !resource.locked && (
                  <Button size="sm" variant="outline">Start Exercise</Button>
                )}
                {resource.completed && (
                  <Badge variant="success">Completed</Badge>
                )}
              </div>
            ))}
          </div>

          {/* Projects */}
          {week.projects && week.projects.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Projects</h3>
              <div className="grid gap-4">
                {week.projects.map((project, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium mb-1">{project.title}</h4>
                        <p className="text-sm text-charcoal-600">{project.description}</p>
                      </div>
                      {project.completed ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        <Button size="sm">Start Project</Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {week.prerequisites && week.prerequisites.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Prerequisites:</span>{' '}
                {week.prerequisites.join(' • ')}
              </p>
            </div>
          )}

          {/* Discussion/Community Link */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <Users className="h-4 w-4" />
              Discuss this week with other learners
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={courseId ? `/courses/${courseId}/discussion` : '#'}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Join Discussion
              </Link>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Week list component for course overview
interface WeekListProps {
  weeks: WeekData[];
  currentWeek?: number;
  onWeekSelect?: (weekNumber: number) => void;
  courseId?: string;
}

export function WeekList({ weeks, currentWeek, onWeekSelect, courseId }: WeekListProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>(
    currentWeek ? [currentWeek] : []
  );

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev =>
      prev.includes(weekNumber)
        ? prev.filter(w => w !== weekNumber)
        : [...prev, weekNumber]
    );
  };

  const totalDuration = weeks.reduce((sum, week) => sum + (week.totalDuration || 0), 0);
  const totalResources = weeks.reduce((sum, week) => sum + week.resources.length, 0);
  const completedWeeks = weeks.filter(w => w.completed).length;

  return (
    <div className="space-y-4">
      {/* Course Overview */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Course Overview</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">{weeks.length}</p>
            <p className="text-sm text-charcoal-600">Weeks</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">{totalResources}</p>
            <p className="text-sm text-charcoal-600">Resources</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
            </p>
            <p className="text-sm text-charcoal-600">Total Duration</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-charcoal-600">Overall Progress</span>
            <span className="font-medium">
              {Math.round((completedWeeks / weeks.length) * 100)}%
            </span>
          </div>
          <Progress value={(completedWeeks / weeks.length) * 100} />
        </div>
      </Card>

      {/* Weeks List */}
      {weeks.map((week) => (
        <WeekView
          key={week.weekNumber}
          week={week}
          isExpanded={expandedWeeks.includes(week.weekNumber)}
          onToggle={() => toggleWeek(week.weekNumber)}
          courseId={courseId}
        />
      ))}
    </div>
  );
}