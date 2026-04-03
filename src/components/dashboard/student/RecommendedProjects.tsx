'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, Star, Clock, ChevronRight, X, Info } from 'lucide-react';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  description: string;
  company?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  duration: number;
  skills?: Array<{ name: string }>;
  matchScore?: number;
  matchReasons?: string[];
}

interface RecommendedProjectsProps {
  projects: Project[];
  isLoading?: boolean;
  limit?: number;
  onDismiss?: (projectId: string) => void;
}

export function RecommendedProjects({ 
  projects, 
  isLoading, 
  limit = 3,
  onDismiss 
}: RecommendedProjectsProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const handleDismiss = (projectId: string) => {
    setDismissedIds([...dismissedIds, projectId]);
    onDismiss?.(projectId);
  };

  const visibleProjects = projects
    .filter(p => !dismissedIds.includes(p._id))
    .slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary-600" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-28 bg-charcoal-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary-600" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-charcoal-500">No recommendations available</p>
            <p className="text-xs text-charcoal-400 mt-1">
              Complete more assessments to get personalized recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary-600" />
          Recommended for You
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/student/projects">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visibleProjects.map((project) => (
            <div key={project._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow relative group">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={project.company?.avatar} />
                  <AvatarFallback>{project.company?.name?.[0] || 'C'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{project.title}</h4>
                      <p className="text-sm text-charcoal-600">{project.company?.name || 'Company'}</p>
                    </div>
                    {project.matchScore && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {project.matchScore}% match
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-charcoal-500 mt-1 line-clamp-2">{project.description}</p>

                  {project.matchReasons && project.matchReasons.length > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <Info className="h-3 w-3 text-primary-500" />
                      <span className="text-xs text-primary-600">
                        {project.matchReasons[0]}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                    {project.budget && (
                      <span>₹{project.budget.min.toLocaleString()} - ₹{project.budget.max.toLocaleString()}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {project.duration} days
                    </span>
                  </div>

                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="skill" size="sm">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button size="sm" variant="link" className="mt-2 p-0 h-auto" asChild>
                    <Link href={`/dashboard/student/projects/${project._id}`}>
                      View Details <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Dismiss button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDismiss(project._id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}