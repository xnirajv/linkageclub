'use client';

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Download, Eye, CheckCircle, XCircle, Clock, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ApplicantCardProps {
  applicant: {
    _id: string;
    userId: { _id: string; name: string; avatar?: string; trustScore: number; email?: string };
    resume: string;
    coverLetter?: string;
    status: string;
    appliedAt: Date;
    matchScore?: number;
  };
  onStatusChange?: (applicantId: string, status: string) => void;
}

const STATUS_VARIANTS: Record<string, { variant: any; label: string; color: string }> = {
  pending: { variant: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  reviewed: { variant: 'warning', label: 'Reviewed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  shortlisted: { variant: 'success', label: 'Shortlisted', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected: { variant: 'error', label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  hired: { variant: 'verified', label: 'Hired', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

export function ApplicantCard({ applicant, onStatusChange }: ApplicantCardProps) {
  const user = applicant.userId;
  const statusConfig = STATUS_VARIANTS[applicant.status] || STATUS_VARIANTS.pending;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-gray-800">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-semibold text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white group-hover:text-primary-600 transition-colors">
                  {user.name}
                </h3>
                {user.email && (
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400 flex items-center gap-1 mt-0.5">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </p>
                )}
              </div>
              <Badge className={`${statusConfig.color} border-0 gap-1`}>
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="font-medium text-yellow-700 dark:text-yellow-400">
                  Trust: {user.trustScore}
                </span>
              </div>
              <div className="flex items-center gap-1 text-charcoal-500">
                <Clock className="h-3 w-3" />
                Applied {formatDistanceToNow(new Date(applicant.appliedAt), { addSuffix: true })}
              </div>
              {applicant.matchScore && (
                <Badge variant="skill" size="sm" className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 gap-1">
                  <Sparkles className="h-3 w-3" />
                  {applicant.matchScore}% match
                </Badge>
              )}
            </div>

            {applicant.coverLetter && (
              <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mt-3 line-clamp-2">
                {applicant.coverLetter}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t border-charcoal-100 dark:border-charcoal-800 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild className="gap-1">
          <a href={applicant.resume} target="_blank" rel="noopener noreferrer">
            <Download className="h-3.5 w-3.5" />
            Resume
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild className="gap-1">
          <Link href={`/dashboard/company/applications/${applicant._id}`}>
            <Eye className="h-3.5 w-3.5" />
            Review
          </Link>
        </Button>
        {applicant.status === 'pending' && onStatusChange && (
          <>
            <Button 
              size="sm" 
              className="gap-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onStatusChange(applicant._id, 'shortlisted')}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Shortlist
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onStatusChange(applicant._id, 'rejected')}
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}