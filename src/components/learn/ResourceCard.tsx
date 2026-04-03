'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  PlayCircle,
  FileText,
  Video,
  Code,
  Download,
  BookOpen,
  CheckCircle,
  Lock,
  Clock,
  Users,
  Star,
  Award,
  ExternalLink,
  Bookmark,
  Share2,
  MoreVertical,
  Headphones,
  Image,
  File,
  Link as LinkIcon,
  Youtube,
  Github,
  Globe,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileType,
  FileVideo,
  FileAudio,
  FileArchive,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface ResourceCardProps {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'article' | 'tutorial' | 'code' | 'download' | 'book' | 'podcast' | 'course' | 'tool' | 'other';
  format?: 'pdf' | 'doc' | 'xls' | 'ppt' | 'zip' | 'mp4' | 'mp3' | 'html' | 'css' | 'js' | 'json' | 'md';
  url: string;
  source?: string;
  author?: string;
  image?: string;
  duration?: number; // in minutes
  size?: string; // file size for downloads
  pages?: number; // for books/articles
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  skills?: string[];
  rating?: number;
  reviews?: number;
  students?: number;
  language?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  
  // Progress tracking
  progress?: number;
  completed?: boolean;
  bookmarked?: boolean;
  
  // Actions
  onClick?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  
  // Display options
  variant?: 'default' | 'compact' | 'horizontal' | 'minimal';
  showProgress?: boolean;
  showActions?: boolean;
  className?: string;
}

export function ResourceCard({
  id,
  title,
  description,
  type,
  format,
  url,
  source,
  author,
  image,
  duration,
  size,
  pages,
  difficulty,
  tags = [],
  skills = [],
  rating,
  reviews,
  students,
  language,
  publishedAt,
  updatedAt,
  progress = 0,
  completed = false,
  bookmarked = false,
  onClick,
  onBookmark,
  onShare,
  onDownload,
  variant = 'default',
  showProgress = true,
  showActions = true,
  className,
}: ResourceCardProps) {
  const getTypeIcon = () => {
    const iconProps = { className: "h-5 w-5" };
    
    switch (type) {
      case 'video':
        return <Video {...iconProps} />;
      case 'article':
        return <FileText {...iconProps} />;
      case 'tutorial':
        return <BookOpen {...iconProps} />;
      case 'code':
        return <Code {...iconProps} />;
      case 'download':
        return <Download {...iconProps} />;
      case 'book':
        return <BookOpen {...iconProps} />;
      case 'podcast':
        return <Headphones {...iconProps} />;
      case 'course':
        return <PlayCircle {...iconProps} />;
      case 'tool':
        return <Code {...iconProps} />;
      default:
        return <File {...iconProps} />;
    }
  };

  const getFormatIcon = () => {
    const iconProps = { className: "h-4 w-4" };
    
    switch (format) {
      case 'pdf':
        return <FileText {...iconProps} />;
      case 'doc':
        return <FileText {...iconProps} />;
      case 'xls':
        return <FileSpreadsheet {...iconProps} />;
      case 'ppt':
        return <FileType {...iconProps} />;
      case 'zip':
        return <FileArchive {...iconProps} />;
      case 'mp4':
        return <FileVideo {...iconProps} />;
      case 'mp3':
        return <FileAudio {...iconProps} />;
      case 'html':
      case 'css':
      case 'js':
        return <FileCode {...iconProps} />;
      case 'json':
        return <FileJson {...iconProps} />;
      case 'md':
        return <FileText {...iconProps} />;
      default:
        return null;
    }
  };

  const getSourceIcon = () => {
    if (!source) return null;
    
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('youtube')) return <Youtube className="h-4 w-4 text-red-600" />;
    if (sourceLower.includes('github')) return <Github className="h-4 w-4" />;
    if (sourceLower.includes('medium')) return <FileText className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const getDifficultyColor = () => {
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

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    
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

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (onClick) {
      return (
        <div onClick={onClick} className="cursor-pointer">
          {children}
        </div>
      );
    }
    return <>{children}</>;
  };

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <CardWrapper>
        <div className={cn("flex items-center gap-3 p-2 hover:bg-charcoal-100/50 rounded-lg transition-colors", className)}>
          <div className="p-2 bg-primary-100 rounded-lg shrink-0">
            {getTypeIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{title}</h4>
            {source && (
              <p className="text-xs text-charcoal-500">{source}</p>
            )}
          </div>
          {duration && (
            <span className="text-xs text-charcoal-400">{formatDuration(duration)}</span>
          )}
          {completed && (
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
          )}
        </div>
      </CardWrapper>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <CardWrapper>
        <Card className={cn("p-4 hover:shadow-md transition-shadow", className)}>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 rounded-lg shrink-0">
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-charcoal-950 truncate">{title}</h4>
              {source && (
                <p className="text-xs text-charcoal-500 mt-1">{source}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-500">
                {duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(duration)}
                  </span>
                )}
                {difficulty && (
                  <Badge className={getDifficultyColor()} size="sm">
                    {difficulty}
                  </Badge>
                )}
                {completed && (
                  <Badge variant="success" size="sm">Completed</Badge>
                )}
              </div>
            </div>
            {bookmarked && (
              <Bookmark className="h-4 w-4 text-primary-600 fill-current" />
            )}
          </div>
        </Card>
      </CardWrapper>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <CardWrapper>
        <Card className={cn("flex overflow-hidden hover:shadow-lg transition-shadow", className)}>
          {/* Left side - Image/Icon */}
          <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 flex-shrink-0 flex items-center justify-center">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-white text-3xl font-bold">
                {getTypeIcon()}
              </div>
            )}
          </div>

          {/* Right side - Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-charcoal-950">{title}</h3>
                  {source && getSourceIcon()}
                </div>
                {author && (
                  <p className="text-sm text-charcoal-600">by {author}</p>
                )}
              </div>
              {bookmarked && (
                <Bookmark className="h-5 w-5 text-primary-600 fill-current" />
              )}
            </div>

            {description && (
              <p className="text-sm text-charcoal-600 mb-3 line-clamp-2">{description}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-charcoal-500 mb-3">
              {type && (
                <Badge variant="skill" size="sm">
                  {type}
                </Badge>
              )}
              {format && getFormatIcon()}
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(duration)}
                </span>
              )}
              {pages && (
                <span>{pages} pages</span>
              )}
              {size && (
                <span>{size}</span>
              )}
              {difficulty && (
                <Badge className={getDifficultyColor()} size="sm">
                  {difficulty}
                </Badge>
              )}
              {language && (
                <span>{language}</span>
              )}
            </div>

            {/* Skills/Tags */}
            {(tags.length > 0 || skills.length > 0) && (
              <div className="flex flex-wrap gap-1 mb-3">
                {skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="skill" size="sm">
                    {skill}
                  </Badge>
                ))}
                {tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            {(rating || students) && (
              <div className="flex items-center gap-4 text-sm">
                {rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {rating.toFixed(1)} ({formatNumber(reviews)})
                  </span>
                )}
                {students && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {formatNumber(students)} students
                  </span>
                )}
              </div>
            )}

            {/* Progress */}
            {showProgress && progress > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-charcoal-500">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 mt-4">
                <Button size="sm" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Resource
                  </a>
                </Button>
                {onBookmark && (
                  <Button size="sm" variant="outline" onClick={onBookmark}>
                    <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                  </Button>
                )}
                {onShare && (
                  <Button size="sm" variant="outline" onClick={onShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
                {type === 'download' && onDownload && (
                  <Button size="sm" variant="outline" onClick={onDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </CardWrapper>
    );
  }

  // Default variant
  return (
    <CardWrapper>
      <Card className={cn("h-full flex flex-col hover:shadow-lg transition-shadow group", className)}>
        {/* Header with type badge */}
        <div className="p-4 border-b bg-charcoal-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                {getTypeIcon()}
              </div>
              <div>
                <Badge variant="skill" size="sm">
                  {type}
                </Badge>
                {format && (
                  <Badge variant="outline" size="sm" className="ml-2">
                    {format}
                  </Badge>
                )}
              </div>
            </div>
            {source && getSourceIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <h3 className="font-semibold text-charcoal-950 mb-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>

          {description && (
            <p className="text-sm text-charcoal-600 mb-3 line-clamp-2">{description}</p>
          )}

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {duration && (
              <Badge variant="outline" size="sm" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(duration)}
              </Badge>
            )}
            {difficulty && (
              <Badge className={getDifficultyColor()} size="sm">
                {difficulty}
              </Badge>
            )}
            {pages && (
              <Badge variant="outline" size="sm">
                {pages} pages
              </Badge>
            )}
            {size && (
              <Badge variant="outline" size="sm">
                {size}
              </Badge>
            )}
          </div>

          {/* Author/Source */}
          {author && (
            <p className="text-xs text-charcoal-500 mb-2">By {author}</p>
          )}

          {/* Skills/Tags */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="skill" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {/* Rating/Stats */}
          {rating && (
            <div className="flex items-center gap-2 text-sm mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
              {reviews && (
                <span className="text-charcoal-500">({formatNumber(reviews)} reviews)</span>
              )}
            </div>
          )}

          {/* Progress */}
          {showProgress && progress > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-charcoal-500">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}

          {/* Date info */}
          {publishedAt && (
            <p className="text-xs text-charcoal-400 mt-2">
              Published {new Date(publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            {completed && (
              <Badge variant="success" size="sm">Completed</Badge>
            )}
            {bookmarked && (
              <Bookmark className="h-4 w-4 text-primary-600 fill-current" />
            )}
          </div>

          <Button size="sm" variant="ghost" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </Card>
    </CardWrapper>
  );
}

// Resource grid component
interface ResourceGridProps {
  resources: ResourceCardProps[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'horizontal';
  showProgress?: boolean;
  showActions?: boolean;
  onResourceClick?: (resourceId: string) => void;
}

export function ResourceGrid({
  resources,
  columns = 3,
  variant = 'default',
  showProgress = true,
  showActions = true,
  onResourceClick,
}: ResourceGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          {...resource}
          variant={variant}
          showProgress={showProgress}
          showActions={showActions}
          onClick={() => onResourceClick?.(resource.id)}
        />
      ))}
    </div>
  );
}

// Resource filter component
interface ResourceFilterProps {
  types?: string[];
  difficulties?: string[];
  tags?: string[];
  onFilterChange?: (filters: any) => void;
}

export function ResourceFilters({ types, difficulties, tags, onFilterChange }: ResourceFilterProps) {
  return (
    <Card className="p-4">
      <h3 className="font-medium mb-3">Filters</h3>
      <div className="space-y-4">
        {types && (
          <div>
            <label className="text-sm text-charcoal-600 mb-2 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <Badge key={type} variant="outline" className="cursor-pointer hover:bg-primary-100">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {difficulties && (
          <div>
            <label className="text-sm text-charcoal-600 mb-2 block">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <Badge key={diff} variant="outline" className="cursor-pointer hover:bg-primary-100">
                  {diff}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {tags && (
          <div>
            <label className="text-sm text-charcoal-600 mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="skill" size="sm" className="cursor-pointer">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
