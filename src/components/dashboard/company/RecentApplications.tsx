'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, ArrowRight, Clock, Mail, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Application {
  _id: string;
  applicantId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  projectId?: {
    _id: string;
    title: string;
  };
  status: string;
  submittedAt: string;
}

interface RecentApplicationsProps {
  applications: Application[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onApplicationClick?: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  pending: { 
    label: 'Pending', 
    icon: Clock, 
    color: 'text-yellow-700', 
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' 
  },
  reviewed: { 
    label: 'Reviewed', 
    icon: CheckCircle2, 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100 dark:bg-blue-900/30' 
  },
  shortlisted: { 
    label: 'Shortlisted', 
    icon: CheckCircle2, 
    color: 'text-green-700', 
    bgColor: 'bg-green-100 dark:bg-green-900/30' 
  },
  accepted: { 
    label: 'Hired', 
    icon: CheckCircle2, 
    color: 'text-purple-700', 
    bgColor: 'bg-purple-100 dark:bg-purple-900/30' 
  },
  rejected: { 
    label: 'Rejected', 
    icon: XCircle, 
    color: 'text-red-700', 
    bgColor: 'bg-red-100 dark:bg-red-900/30' 
  },
};

export function RecentApplications({ 
  applications, 
  isLoading,
  onViewAll,
  onApplicationClick 
}: RecentApplicationsProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary-600" />
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-charcoal-100 dark:bg-charcoal-700 rounded-xl"></div>
            <div className="h-20 bg-charcoal-100 dark:bg-charcoal-700 rounded-xl"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <Activity className="h-4 w-4 text-primary-600" />
            </div>
            Recent Applications
            {applications.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({applications.length})
              </span>
            )}
          </CardTitle>
          {onViewAll && applications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center">
              <Users className="h-10 w-10 text-charcoal-400" />
            </div>
            <p className="text-muted-foreground font-medium">No recent applications</p>
            <p className="text-xs text-muted-foreground mt-1">Applications will appear here when candidates apply</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={app._id}
                  className="group p-4 rounded-xl border border-charcoal-100 dark:border-charcoal-800 bg-card dark:bg-charcoal-900 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => onApplicationClick?.(app._id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-white dark:ring-gray-800">
                      <AvatarImage src={app.applicantId?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-medium">
                        {getInitials(app.applicantId?.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-charcoal-950 dark:text-white group-hover:text-primary-600 transition-colors">
                            {app.applicantId?.name}
                          </p>
                          <p className="text-xs text-charcoal-500 mt-0.5 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            Applied for: {app.projectId?.title || 'Unknown position'}
                          </p>
                        </div>
                        <Badge className={`${status.bgColor} ${status.color} border-0 gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-400">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(app.submittedAt), { addSuffix: true })}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}