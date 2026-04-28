'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, MapPin, Briefcase, Star } from 'lucide-react';
import type { Project } from '@/types/project';
import { getCompanyName } from '@/types/project';
import { SaveButton } from '@/components/projects/SaveButton';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const budgetLabel = project.budget
    ? `₹${project.budget.min.toLocaleString()} - ₹${project.budget.max.toLocaleString()}`
    : 'Budget not specified';

  const companyName = getCompanyName(project);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/dashboard/student/projects/${project._id}`}>
              <h3 className="text-lg font-semibold truncate group-hover:text-primary-600 transition-colors">
                {project.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">{companyName}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="capitalize">{project.status}</Badge>
              <Badge variant="outline">{project.category}</Badge>
              {project.matchScore !== undefined && (
                <Badge variant="secondary">Match: {project.matchScore}%</Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{budgetLabel}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{project.duration} days</span>
              {project.location && (
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{project.location.type}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {project.skills?.slice(0, 4).map((skill) => (
                <Badge key={skill.name} variant="secondary" className="text-xs">{skill.name}</Badge>
              ))}
              {project.skills && project.skills.length > 4 && (
                <span className="text-xs text-gray-400">+{project.skills.length - 4} more</span>
              )}
            </div>
          </div>

          <SaveButton projectId={project._id} isSaved={project.isSaved} />
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{project.applicationsCount || 0} applicants</span>
            {project.company && (
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{project.company.name}</span>
            )}
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/student/projects/${project._id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}