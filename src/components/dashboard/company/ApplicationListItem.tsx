import React from 'react';
import Link from 'next/link';
import { Eye, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ApplicationListItemProps {
  application: {
    _id: string;
    status: string;
    submittedAt: string;
    applicantId?: { name: string; trustScore: number };
    projectId?: { title: string };
  };
  onShortlist: (id: string) => void;
  onReject: (id: string) => void;
}

function timeAgo(date: string) {
  const hours = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

const statusBadge: Record<string, { variant: any; label: string }> = {
  pending: { variant: 'warning', label: 'New' },
  reviewed: { variant: 'info', label: 'Reviewed' },
  shortlisted: { variant: 'success', label: 'Shortlisted' },
  accepted: { variant: 'default', label: 'Hired' },
  rejected: { variant: 'error', label: 'Rejected' },
};

export function ApplicationListItem({ application, onShortlist, onReject }: ApplicationListItemProps) {
  const config = statusBadge[application.status] || statusBadge.pending;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-medium flex-shrink-0">
          {(application.applicantId?.name || 'C')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">
            {application.applicantId?.name || 'Candidate'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Applied for: {application.projectId?.title || 'Project'} • Trust: {application.applicantId?.trustScore || 0}% • {timeAgo(application.submittedAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
        <Button size="sm" variant="ghost" asChild className="h-8 w-8 p-0">
          <Link href={`/dashboard/company/applications/${application._id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={() => onShortlist(application._id)}>
          <CheckCircle2 className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => onReject(application._id)}>
          <XCircle className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}