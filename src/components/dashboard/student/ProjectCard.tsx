import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  hasApplied?: boolean;
  onApply?: (projectId: string) => void;
  isApplying?: boolean;
}

export function ProjectCard({ project, hasApplied, onApply, isApplying }: ProjectCardProps) {
  const isOpen = project.status === 'open' || project.status === 'active';
  const applied = hasApplied ?? project.hasApplied ?? false;

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date();
    const due = new Date(deadline);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Last day';
    return `${diffDays} days left`;
  };

  const daysLeft = getDaysLeft(project.deadline);

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base">{project.title}</CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={isOpen ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
            {applied && (
              <Badge variant="success" className="text-xs flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Applied
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.slice(0, 3).map((skill) => (
            <Badge key={skill.name} variant="outline" className="text-xs">
              {skill.name}
            </Badge>
          ))}
          {project.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.skills.length - 3}
            </Badge>
          )}
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>
              {project.budget
                ? `${project.budget.currency} ${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()}`
                : 'Negotiable'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{project.duration}</span>
          </div>
          {project.teamSize && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{project.teamSize} members</span>
            </div>
          )}
          {daysLeft && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">{daysLeft}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/dashboard/student/projects/${project._id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Details
          </Button>
        </Link>
        {!applied && onApply ? (
          <Button 
            className="flex-1" 
            onClick={() => onApply(project._id)}
            disabled={isApplying || !isOpen}
          >
            {isApplying ? 'Applying...' : 'Apply'}
          </Button>
        ) : applied && (
          <Button variant="secondary" className="flex-1" disabled>
            Applied
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
