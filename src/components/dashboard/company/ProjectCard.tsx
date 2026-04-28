'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, DollarSign, Clock, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    status: string;
    description?: string;
    budget?: { min: number; max: number };
    duration?: number;
    applicationsCount?: number;
    createdAt: string;
    skills?: Array<{ name: string }>;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatBudget = () => {
    if (!project.budget) return 'Not specified';
    return `₹${project.budget.min.toLocaleString()} - ₹${project.budget.max.toLocaleString()}`;
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{project.title}</h3>
              <Badge variant={project.status === 'open' ? 'default' : 'secondary'} className="text-[10px] flex-shrink-0 capitalize">{project.status.replace('_', ' ')}</Badge>
            </div>
            {project.description && <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><DollarSign className="h-3 w-3" />{formatBudget()}</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><Clock className="h-3 w-3" />{project.duration || 0}d</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><Users className="h-3 w-3" />{project.applicationsCount || 0} apps</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><Calendar className="h-3 w-3" />{new Date(project.createdAt).toLocaleDateString()}</div>
        </div>
        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.skills.slice(0, 4).map((skill) => (
              <Badge key={skill.name} variant="secondary" className="text-[10px]">{skill.name}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button size="sm" variant="ghost" asChild className="text-xs"><Link href={`/dashboard/company/my-projects/${project._id}`}><Eye className="h-3 w-3 mr-1" />View</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}