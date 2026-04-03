'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Briefcase, FolderOpen, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Application {
  _id: string;
  type: 'job' | 'project';
  title: string;
  companyName: string;
  companyLogo?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired' | 'accepted';
  appliedAt: Date;
  statusUpdatedAt?: Date;
  interviewDate?: Date;
}

interface ApplicationStatusProps {
  applications: Application[];
  onWithdraw?: (applicationId: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; variant: any; icon: any; color: string }> = {
  pending: { label: 'Pending', variant: 'pending', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  reviewed: { label: 'Reviewed', variant: 'warning', icon: AlertCircle, color: 'text-blue-600 bg-blue-50' },
  shortlisted: { label: 'Shortlisted', variant: 'success', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
  rejected: { label: 'Rejected', variant: 'error', icon: XCircle, color: 'text-red-600 bg-red-50' },
  hired: { label: 'Hired', variant: 'verified', icon: CheckCircle2, color: 'text-purple-600 bg-purple-50' },
  accepted: { label: 'Accepted', variant: 'verified', icon: CheckCircle2, color: 'text-purple-600 bg-purple-50' },
};

export function ApplicationStatus({ applications, onWithdraw }: ApplicationStatusProps) {
  if (!applications?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No applications yet</p>
            <Button size="sm" variant="outline" className="mt-3" asChild>
              <Link href="/dashboard/student/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/student/jobs/my-applications">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.slice(0, 5).map((app) => {
            const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={app._id} className="flex items-start gap-3 py-3 border-b last:border-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={app.companyLogo} />
                  <AvatarFallback>
                    {app.type === 'job' ? <Briefcase className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-medium truncate">{app.title}</p>
                      <p className="text-xs text-muted-foreground">{app.companyName}</p>
                    </div>
                    <Badge variant={statusConfig.variant} size="sm" className="capitalize flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}</span>
                    {app.interviewDate && (
                      <span className="flex items-center gap-1 text-primary-600">
                        <Clock className="h-3 w-3" />
                        Interview: {new Date(app.interviewDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {app.status === 'pending' && onWithdraw && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-1 text-xs text-red-600"
                      onClick={() => onWithdraw(app._id)}
                    >
                      Withdraw Application
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}