'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Clock,
  Award,
  Users,
  Star,
  TrendingUp,
  PlayCircle,
  CheckCircle,
  Code,
  Zap,
  Target,
} from 'lucide-react';
import Link from 'next/link';

interface LearningPathCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  duration: number; // in hours
  lessons: number;
  projects?: number;
  quizzes?: number;
  skills: string[];
  progress?: number;
  enrolled?: boolean;
  completed?: boolean;
  featured?: boolean;
  popular?: boolean;
  rating?: number;
  students?: number;
  certificateAvailable?: boolean;
  prerequisites?: string[];
  instructor?: {
    name: string;
    avatar?: string;
    title?: string;
  };
  tags?: string[];
  lastUpdated?: Date;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'compact' | 'horizontal';
  showProgress?: boolean;
  onEnroll?: () => void;
  onContinue?: () => void;
}

export function LearningPathCard({
  id: _id,
  title,
  description,
  image,
  level,
  duration,
  lessons,
  projects,
  quizzes,
  skills,
  progress = 0,
  enrolled = false,
  completed = false,
  featured = false,
  popular = false,
  rating,
  students,
  certificateAvailable = false,
  prerequisites: _prerequisites,
  instructor,
  tags: _tags,
  lastUpdated,
  onClick,
  href,
  variant = 'default',
  showProgress = true,
  onEnroll,
  onContinue,
}: LearningPathCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'border border-success-200 bg-success-50 text-success-700 dark:border-success-900/40 dark:bg-success-950/20 dark:text-success-300';
      case 'intermediate':
        return 'border border-secondary-200 bg-secondary-50 text-secondary-700 dark:border-secondary-900/40 dark:bg-secondary-950/20 dark:text-secondary-300';
      case 'advanced':
        return 'border border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15 dark:text-destructive';
      case 'all-levels':
        return 'border border-info-200 bg-info-50 text-info-700 dark:border-info-900/40 dark:bg-info-950/20 dark:text-info-300';
      default:
        return 'border border-charcoal-200 bg-charcoal-100 text-charcoal-700 dark:border-charcoal-800 dark:bg-charcoal-900 dark:text-charcoal-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner':
        return <Zap className="h-3 w-3" />;
      case 'intermediate':
        return <TrendingUp className="h-3 w-3" />;
      case 'advanced':
        return <Target className="h-3 w-3" />;
      default:
        return <Award className="h-3 w-3" />;
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    if (hours === 1) {
      return '1 hour';
    }
    return `${hours} hours`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href) {
      return (
        <Link href={href} onClick={onClick} className="block">
          {children}
        </Link>
      );
    }
    return (
      <div
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick?.();
          }
        }}
        role="button"
        tabIndex={0}
        className="cursor-pointer"
      >
        {children}
      </div>
    );
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <CardWrapper>
        <Card className="luxury-border gradient-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-xl">
          <div className="flex items-start gap-3">
            {/* Icon/Image */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-700 to-info-600 text-xl font-bold text-white shadow-[0_16px_30px_-18px_rgba(52,74,134,0.55)]">
              {title[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="truncate font-medium text-charcoal-950 dark:text-white">{title}</h4>
                  <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">{description}</p>
                </div>
                {completed && (
                  <CheckCircle className="ml-2 h-5 w-5 shrink-0 text-success-500" />
                )}
              </div>

              <div className="mt-2 flex items-center gap-3 text-xs text-charcoal-500 dark:text-charcoal-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(duration)}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {lessons} lessons
                </span>
                <Badge className={getLevelColor(level)} size="sm">
                  {level}
                </Badge>
              </div>

              {showProgress && enrolled && progress > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-charcoal-500 dark:text-charcoal-400">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              )}
            </div>
          </div>
        </Card>
      </CardWrapper>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <CardWrapper>
        <Card className="luxury-border gradient-card flex overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl">
          {/* Left side - Image */}
          <div className="w-48 h-48 bg-gradient-to-br from-primary-500 to-secondary-500 flex-shrink-0">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                {title[0]}
              </div>
            )}
            {featured && (
              <div className="absolute top-2 left-2">
                <Badge variant="success">Featured</Badge>
              </div>
            )}
          </div>

          {/* Right side - Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-charcoal-950 dark:text-white">{title}</h3>
                  {popular && (
                    <Badge variant="warning">Popular</Badge>
                  )}
                </div>
                <p className="text-charcoal-600 mb-4 line-clamp-2">{description}</p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-500 mb-4">
                  <Badge className={getLevelColor(level)}>
                    <span className="flex items-center gap-1">
                      {getLevelIcon(level)}
                      {level}
                    </span>
                  </Badge>

                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(duration)}
                  </span>

                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {lessons} lessons
                  </span>

                  {projects && projects > 0 && (
                    <span className="flex items-center gap-1">
                      <Code className="h-4 w-4" />
                      {projects} projects
                    </span>
                  )}

                  {quizzes && quizzes > 0 && (
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {quizzes} quizzes
                    </span>
                  )}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="skill" size="sm">
                      {skill}
                    </Badge>
                  ))}
                  {skills.length > 3 && (
                    <Badge variant="skill" size="sm">
                      +{skills.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Instructor & Stats */}
                {instructor && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {instructor.avatar ? (
                        <img
                          src={instructor.avatar}
                          alt={instructor.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal-100 dark:bg-charcoal-800">
                          <span className="text-xs font-medium text-charcoal-700 dark:text-charcoal-100">{instructor.name[0]}</span>
                        </div>
                      )}
                      <span className="text-charcoal-600 dark:text-charcoal-300">{instructor.name}</span>
                      {instructor.title && (
                        <span className="text-xs text-charcoal-400 dark:text-charcoal-500">{instructor.title}</span>
                      )}
                    </div>

                    {students && students > 0 && (
                      <span className="flex items-center gap-1 text-charcoal-500">
                        <Users className="h-4 w-4" />
                        {formatNumber(students)} students
                      </span>
                    )}

                    {rating && (
                      <span className="flex items-center gap-1 text-secondary-600 dark:text-secondary-300">
                        <Star className="h-4 w-4 fill-current" />
                        {rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {completed ? (
                  <Button disabled variant="outline" className="text-success-600 dark:text-success-300">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completed
                  </Button>
                ) : enrolled ? (
                  <Button onClick={onContinue}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                ) : (
                  <Button onClick={onEnroll}>
                    Enroll Now
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {showProgress && enrolled && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-charcoal-600 dark:text-charcoal-300">Your progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </Card>
      </CardWrapper>
    );
  }

  // Default variant (vertical card)
  return (
    <CardWrapper>
      <Card className="luxury-border gradient-card group flex h-full flex-col transition-all hover:-translate-y-0.5 hover:shadow-xl">
        {/* Image */}
        <div className="relative h-40 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-t-lg overflow-hidden">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
              {title[0]}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {featured && (
              <Badge variant="success">Featured</Badge>
            )}
            {popular && (
              <Badge variant="warning">Popular</Badge>
            )}
          </div>

          {certificateAvailable && (
            <div className="absolute top-2 right-2">
              <Badge variant="info">Certificate</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Title & Level */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="line-clamp-2 text-lg font-semibold text-charcoal-950 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-300">
              {title}
            </h3>
            <Badge className={getLevelColor(level)} size="sm">
              {level}
            </Badge>
          </div>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm text-charcoal-600 dark:text-charcoal-300">{description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-charcoal-950 dark:text-white">{duration}h</p>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-charcoal-950 dark:text-white">{lessons}</p>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-charcoal-950 dark:text-white">{projects || 0}</p>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Projects</p>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1 mb-4">
            {skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="skill" size="sm">
                {skill}
              </Badge>
            ))}
          </div>

          {/* Rating & Students */}
          {(rating || students) && (
            <div className="mb-4 flex items-center justify-between text-sm text-charcoal-500 dark:text-charcoal-400">
              {rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary-400 text-secondary-400" />
                  {rating.toFixed(1)}
                </span>
              )}
              {students && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {formatNumber(students)} enrolled
                </span>
              )}
            </div>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <p className="mb-4 text-xs text-charcoal-400 dark:text-charcoal-500">
              Updated {new Date(lastUpdated).toLocaleDateString()}
            </p>
          )}

          {/* Progress */}
          {showProgress && enrolled && (
            <div className="mt-auto">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-charcoal-600 dark:text-charcoal-300">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Action Button */}
          <div className="mt-4">
            {completed ? (
              <Button variant="outline" className="w-full text-success-600 dark:text-success-300" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completed
              </Button>
            ) : enrolled ? (
              <Button className="w-full" onClick={onContinue}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Continue
              </Button>
            ) : (
              <Button className="w-full" onClick={onEnroll}>
                Enroll Now
              </Button>
            )}
          </div>
        </div>
      </Card>
    </CardWrapper>
  );
}

// Grid of learning paths
interface LearningPathGridProps {
  paths: LearningPathCardProps[];
  columns?: 2 | 3 | 4;
  showProgress?: boolean;
  onEnroll?: (pathId: string) => void;
  onContinue?: (pathId: string) => void;
}

export function LearningPathGrid({
  paths,
  columns = 3,
  showProgress = true,
  onEnroll,
  onContinue,
}: LearningPathGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {paths.map((path) => (
        <LearningPathCard
          key={path.id}
          {...path}
          showProgress={showProgress}
          onEnroll={() => onEnroll?.(path.id)}
          onContinue={() => onContinue?.(path.id)}
        />
      ))}
    </div>
  );
}

// Featured path banner
interface FeaturedPathBannerProps {
  path: LearningPathCardProps;
  onEnroll?: () => void;
  onContinue?: () => void;
}

export function FeaturedPathBanner({
  path,
  onEnroll,
  onContinue,
}: FeaturedPathBannerProps) {
  return (
    <Card className="relative overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,_rgba(225,221,214,0.28),_transparent_32%),linear-gradient(135deg,_rgba(52,74,134,0.96),_rgba(64,119,148,0.94)_56%,_rgba(75,73,69,0.92))] text-white shadow-[0_24px_60px_rgba(52,74,134,0.24)]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="white" />
          </pattern>
          <rect width="100" height="100" fill="url(#pattern)" />
        </svg>
      </div>

      <div className="relative p-8 flex flex-col md:flex-row items-center gap-8">
        {/* Content */}
        <div className="flex-1">
          <Badge variant="success" className="mb-4 bg-card/20 text-white border-white/30">
            Featured Path
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{path.title}</h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl">{path.description}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div>
              <p className="text-2xl font-bold">{path.duration}h</p>
              <p className="text-sm text-white/80">Total Duration</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{path.lessons}</p>
              <p className="text-sm text-white/80">Lessons</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{path.projects || 0}</p>
              <p className="text-sm text-white/80">Projects</p>
            </div>
            {path.students && (
              <div>
                <p className="text-2xl font-bold">{path.students}+</p>
                <p className="text-sm text-white/80">Students</p>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {path.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="skill" className="bg-card/20 text-white border-white/30">
                {skill}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            {path.enrolled ? (
              <Button size="lg" variant="secondary" onClick={onContinue}>
                <PlayCircle className="mr-2 h-5 w-5" />
                Continue Learning
              </Button>
            ) : (
              <Button size="lg" variant="secondary" onClick={onEnroll}>
                Enroll Now - Free
              </Button>
            )}
            <Button size="lg" variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card hover:text-charcoal-950">
              Learn More
            </Button>
          </div>
        </div>

        {/* Icon/Image */}
        <div className="w-48 h-48 bg-card/10 rounded-full flex items-center justify-center text-6xl font-bold">
          {path.title[0]}
        </div>
      </div>
    </Card>
  );
}
