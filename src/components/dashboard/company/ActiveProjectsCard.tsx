import React from 'react';
import Link from 'next/link';
import { Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ActiveProjectCardProps {
  project: {
    _id: string;
    title: string;
    status: string;
    budget: { min: number; max: number };
    duration: number;
    applicationsCount: number;
    selectedApplicant?: { name: string; trustScore: number };
    milestones?: Array<{ title: string; status: string; deadline: number }>;
    createdAt: string;
  };
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

function timeAgo(date: string) {
  const hours = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export function ActiveProjectCard({ project }: ActiveProjectCardProps) {
  const completed = (project.milestones || []).filter(
    (m) => m.status === 'completed' || m.status === 'approved'
  ).length;
  const total = (project.milestones || []).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const nextMilestone = (project.milestones || []).find((m) => m.status === 'pending' || m.status === 'in_progress');

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{project.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Candidate: {project.selectedApplicant?.name || 'Not assigned yet'} • Trust Score: {project.selectedApplicant?.trustScore || 'N/A'}% • Started: {timeAgo(project.createdAt)}
          </p>
        </div>
      </div>

      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Progress</span>
            <span>{completed}/{total} milestones</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {nextMilestone && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Next Milestone: <span className="font-medium">{nextMilestone.title}</span> • Due in {nextMilestone.deadline} days
        </p>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Button size="sm" variant="ghost" asChild className="text-xs font-medium">
          <Link href={`/dashboard/company/my-projects/${project._id}`}>
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Details
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="text-xs font-medium">
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          Message Candidate
        </Button>
      </div>
    </div>
  );
}