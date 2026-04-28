'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, ArrowRight, Clock, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Application {
  _id: string;
  applicantId: { _id: string; name: string; avatar?: string };
  projectId?: { _id: string; title: string };
  status: string;
  submittedAt: string;
}

interface RecentApplicationsProps {
  applications: Application[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onApplicationClick?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  pending: { label: 'Pending', variant: 'warning' },
  reviewed: { label: 'Reviewed', variant: 'info' },
  shortlisted: { label: 'Shortlisted', variant: 'info' },
  accepted: { label: 'Hired', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
};

export function RecentApplications({ applications, isLoading, onViewAll, onApplicationClick }: RecentApplicationsProps) {
  if (isLoading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-5 space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <Activity className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="font-semibold text-sm">Recent Applications ({applications.length})</h3>
        </div>
        {onViewAll && <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs">View all <ArrowRight className="h-3 w-3 ml-1" /></Button>}
      </div>
      <CardContent className="p-5">
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const config = statusConfig[app.status] || statusConfig.pending;
              return (
                <button
                  key={app._id}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
                  onClick={() => onApplicationClick?.(app._id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium">
                        {(app.applicantId?.name || 'C')[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{app.applicantId?.name}</p>
                        <p className="text-xs text-gray-500">{app.projectId?.title || 'Project'} • {formatDistanceToNow(new Date(app.submittedAt), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
                      <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}