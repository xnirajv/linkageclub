'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, MoreVertical, Edit, Copy, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ProjectHeaderProps {
  project: {
    _id: string;
    title: string;
    category: string;
    status: string;
    progress: number;
    budget: { min: number; max: number };
    duration: number;
    daysRemaining?: number;
    candidate?: { name: string; trustScore: number };
    createdAt: string;
  };
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/projects/${project._id}`);
    toast.success('Link copied!');
  };

  const statusColors: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-purple-50 text-purple-700 border-purple-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    draft: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/company/my-projects"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
              <Badge className={statusColors[project.status] || 'bg-gray-100'}>
                {project.status?.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {project.category} • Posted {new Date(project.createdAt).toLocaleDateString()} • ID: #{project._id?.slice(-8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/company/my-projects/${project._id}/manage`}><Edit className="h-4 w-4 mr-1" />Edit</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink}><Share2 className="h-4 w-4" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600"><Flag className="h-4 w-4 mr-2" />Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {project.status === 'in_progress' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">● Active Project</span>
            <span className="text-sm text-blue-600">{project.progress || 0}% Complete</span>
          </div>
          <Progress value={project.progress || 0} className="h-2" />
          <div className="flex items-center gap-6 mt-3 text-sm text-blue-700 dark:text-blue-400">
            {project.daysRemaining !== undefined && <span>⏱️ {project.daysRemaining} days remaining</span>}
            {project.candidate && <span>👤 {project.candidate.name} (Trust: {project.candidate.trustScore}%)</span>}
            <span>💰 {formatCurrency(project.budget.min)} - {formatCurrency(project.budget.max)}</span>
          </div>
        </div>
      )}
    </div>
  );
}