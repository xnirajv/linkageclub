// components/dashboard/company/ProjectCard.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Eye, 
  Users, 
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Trash2,
  DollarSign,
  Clock,
  TrendingUp,
  Briefcase,
  MapPin,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import mongoose from 'mongoose';
import { IProject } from '@/lib/db/models/project';

type Project = IProject & {
  _id: mongoose.Types.ObjectId;
};

interface ProjectCardProps {
  project: Project;
  variant?: 'company' | 'student';
  onStatusChange?: (id: string, status: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  open: { 
    label: 'Open', 
    bg: 'bg-green-50 dark:bg-green-950/30', 
    text: 'text-green-700 dark:text-green-400', 
    border: 'border-green-200 dark:border-green-800',
    icon: TrendingUp
  },
  in_progress: { 
    label: 'In Progress', 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    text: 'text-blue-700 dark:text-blue-400', 
    border: 'border-blue-200 dark:border-blue-800',
    icon: Clock
  },
  completed: { 
    label: 'Completed', 
    bg: 'bg-purple-50 dark:bg-purple-950/30', 
    text: 'text-purple-700 dark:text-purple-400', 
    border: 'border-purple-200 dark:border-purple-800',
    icon: CheckCircle
  },
  cancelled: { 
    label: 'Cancelled', 
    bg: 'bg-red-50 dark:bg-red-950/30', 
    text: 'text-red-700 dark:text-red-400', 
    border: 'border-red-200 dark:border-red-800',
    icon: XCircle
  },
  draft: { 
    label: 'Draft', 
    bg: 'bg-charcoal-100/50 dark:bg-charcoal-800', 
    text: 'text-charcoal-700 dark:text-charcoal-400', 
    border: 'border-charcoal-200 dark:border-charcoal-700',
    icon: Edit
  },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const statusConfig = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  const formatBudget = () => {
    if (!project.budget) return 'Not specified';
    return `₹${project.budget.min.toLocaleString()} - ₹${project.budget.max.toLocaleString()}`;
  };

  const handleViewDetails = () => {
    router.push(`/dashboard/company/projects/${project._id.toString()}`);
  };

  return (
    <Card className="group p-5 hover:shadow-xl transition-all duration-300 border border-charcoal-100 dark:border-charcoal-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white group-hover:text-primary-600 transition-colors">
                  {project.title}
                </h3>
                <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-2 line-clamp-2">
                {project.description}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-charcoal-100/50 dark:bg-charcoal-800/50">
              <div className="p-1.5 rounded-lg bg-card dark:bg-charcoal-800">
                <DollarSign className="h-3.5 w-3.5 text-charcoal-500" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500">Budget</p>
                <p className="text-sm font-medium truncate max-w-[100px]">{formatBudget()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-charcoal-100/50 dark:bg-charcoal-800/50">
              <div className="p-1.5 rounded-lg bg-card dark:bg-charcoal-800">
                <Clock className="h-3.5 w-3.5 text-charcoal-500" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500">Duration</p>
                <p className="text-sm font-medium">{project.duration} days</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-charcoal-100/50 dark:bg-charcoal-800/50">
              <div className="p-1.5 rounded-lg bg-card dark:bg-charcoal-800">
                <Users className="h-3.5 w-3.5 text-charcoal-500" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500">Applications</p>
                <p className="text-sm font-medium">{project.applicationsCount || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-charcoal-100/50 dark:bg-charcoal-800/50">
              <div className="p-1.5 rounded-lg bg-card dark:bg-charcoal-800">
                <Calendar className="h-3.5 w-3.5 text-charcoal-500" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500">Posted</p>
                <p className="text-sm font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleViewDetails}
              className="gap-2 rounded-lg hover:bg-primary-50 hover:border-primary-200"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              asChild
              className="gap-2 rounded-lg hover:bg-primary-50 hover:border-primary-200"
            >
              <Link href={`/dashboard/company/projects/${project._id.toString()}/applications`}>
                <Users className="h-4 w-4" />
                Applications ({project.applicationsCount || 0})
              </Link>
            </Button>
          </div>

          {/* Skills */}
          {project.skills && project.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-charcoal-100 dark:border-charcoal-800">
              {project.skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="skill" size="sm" className="bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300">
                  {skill.name}
                </Badge>
              ))}
              {project.skills.length > 4 && (
                <span className="text-xs text-charcoal-400">
                  +{project.skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions Menu */}
        <ProjectActionsMenu projectId={project._id.toString()} />
      </div>
    </Card>
  );
}

// Project Actions Menu Component
function ProjectActionsMenu({ projectId }: { projectId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-charcoal-100">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-semibold text-charcoal-500">Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
          <Link href={`/dashboard/company/projects/${projectId}/edit`}>
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <Copy className="h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer text-yellow-600">
          <Archive className="h-4 w-4" />
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 cursor-pointer text-red-600">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Missing imports
import { CheckCircle, XCircle } from 'lucide-react';