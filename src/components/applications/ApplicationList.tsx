'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

interface Application {
  _id: string;
  type: 'project' | 'job';
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: string;
  projectId?: {
    _id: string;
    title: string;
  };
  jobId?: {
    _id: string;
    title: string;
    company?: {
      name: string;
    };
  };
}

interface ApplicationsListProps {
  applications: Application[];
  isLoading: boolean;
  type: string;
}

export function ApplicationsList({ applications, isLoading, type }: ApplicationsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-charcoal-100 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-charcoal-100 rounded w-3/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Briefcase className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No applications found</h3>
        <p className="text-charcoal-500 mb-4">
          {type === 'all' 
            ? "You haven't applied to any projects or jobs yet."
            : `No ${type} applications at the moment.`}
        </p>
        {type === 'all' && (
          <Button asChild>
            <Link href="/dashboard/student/projects">Browse Projects</Link>
          </Button>
        )}
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  const getTitle = (app: Application) => {
    if (app.type === 'project') {
      return app.projectId?.title || 'Unknown Project';
    } else {
      return app.jobId?.title || 'Unknown Job';
    }
  };

  const getCompany = (app: Application) => {
    if (app.type === 'job') {
      return app.jobId?.company?.name;
    }
    return null;
  };

  const getDetailsHref = (app: Application) => {
    if (app.type === 'project' && app.projectId?._id) {
      return `/dashboard/student/projects/${app.projectId._id}`;
    }

    if (app.type === 'job' && app.jobId?._id) {
      return `/dashboard/student/jobs/${app.jobId._id}`;
    }

    return '/dashboard/student/projects/my-applications';
  };

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app._id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{getTitle(app)}</h3>
                  {getCompany(app) && (
                    <p className="text-sm text-charcoal-600">{getCompany(app)}</p>
                  )}
                </div>
                <Badge className={getStatusColor(app.status)}>
                  {app.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-charcoal-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Applied {new Date(app.submittedAt).toLocaleDateString()}
                </span>
                <span className="capitalize">{app.type}</span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" asChild>
                  <Link href={getDetailsHref(app)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Posting
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
