'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight,
  Star,
  UserCheck,
  UserX
} from 'lucide-react';
import mongoose from 'mongoose';
import { IApplication } from '@/lib/db/models/application';

// Define the populated application type
interface PopulatedApplication extends Omit<IApplication, 'applicantId' | 'companyId' | 'projectId' | 'jobId'> {
  _id: mongoose.Types.ObjectId;
  applicantId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    avatar?: string;
    trustScore?: number;
  };
  companyId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  projectId?: {
    _id: mongoose.Types.ObjectId;
    title: string;
  };
  jobId?: {
    _id: mongoose.Types.ObjectId;
    title: string;
    location?: string;
    type?: string;
  };
}

interface ApplicationCardProps {
  application: PopulatedApplication;
  variant?: 'company' | 'student';
  onStatusChange?: (id: string, status: string) => void;
}

export function ApplicationCard({ 
  application, 
  variant = 'company',
  onStatusChange 
}: ApplicationCardProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="info">Reviewed</Badge>;
      case 'shortlisted':
        return <Badge variant="info">Shortlisted</Badge>;
      case 'interview_scheduled':
        return <Badge variant="info">Interview Scheduled</Badge>;
      case 'interview_completed':
        return <Badge variant="success">Interview Completed</Badge>;
      case 'interview_cancelled':
        return <Badge variant="error">Interview Cancelled</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = () => {
    router.push(`/dashboard/applications/${application._id.toString()}`);
  };

  const getTitle = () => {
    if (application.type === 'project' && application.projectId) {
      return application.projectId.title || 'Unknown Project';
    } else if (application.type === 'job' && application.jobId) {
      return application.jobId.title || 'Unknown Job';
    }
    return 'Unknown Position';
  };

  const getLocation = () => {
    if (application.type === 'job' && application.jobId) {
      return application.jobId.location;
    }
    return null;
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={application.applicantId?.avatar} />
            <AvatarFallback>
              {application.applicantId?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">
                {variant === 'company' ? application.applicantId?.name : getTitle()}
              </h3>
              {getStatusBadge(application.status)}
            </div>
            
            <p className="text-sm text-charcoal-600 mb-2">
              {variant === 'company' ? (
                <>
                  Applied for: <span className="font-medium">{getTitle()}</span>
                </>
              ) : (
                application.applicantId?.name
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(application.submittedAt).toLocaleDateString()}
              </span>

              {application.type === 'job' && getLocation() && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {getLocation()}
                </span>
              )}

              {application.applicantId?.trustScore && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Trust: {application.applicantId.trustScore}%
                </span>
              )}

              {application.interview?.scheduled && (
                <span className="flex items-center gap-1 text-primary-600">
                  <Clock className="h-3 w-3" />
                  Interview Scheduled
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {variant === 'company' && application.status === 'pending' && onStatusChange && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-600"
                onClick={() => onStatusChange(application._id.toString(), 'shortlisted')}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Shortlist
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600"
                onClick={() => onStatusChange(application._id.toString(), 'rejected')}
              >
                <UserX className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleViewDetails}
          >
            Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {application.type === 'project' && application.projectId && (
        <div className="mt-4 p-3 bg-charcoal-100/50 rounded-lg">
          <p className="text-sm text-charcoal-700 line-clamp-2">
            {application.projectId.title}
          </p>
        </div>
      )}
    </Card>
  );
}