'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ApplicantCardProps {
  applicant: {
    _id: string;
    userId: { _id: string; name: string; avatar?: string; trustScore: number };
    status: string;
    appliedAt: Date;
    matchScore?: number;
  };
  onStatusChange?: (id: string, status: string) => void;
}

const statusConfig: Record<string, { variant: any; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  reviewed: { variant: 'info', label: 'Reviewed' },
  shortlisted: { variant: 'success', label: 'Shortlisted' },
  rejected: { variant: 'error', label: 'Rejected' },
  hired: { variant: 'default', label: 'Hired' },
};

export function ApplicantCard({ applicant, onStatusChange }: ApplicantCardProps) {
  const user = applicant.userId;
  const config = statusConfig[applicant.status] || statusConfig.pending;

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-semibold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 text-yellow-500 fill-current" />{user.trustScore}%</div>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(applicant.appliedAt), { addSuffix: true })}</span>
                </div>
              </div>
              <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button size="sm" variant="ghost" asChild className="text-xs"><Link href={`/dashboard/company/applications/${applicant._id}`}><Eye className="h-3 w-3 mr-1" />Review</Link></Button>
          {applicant.status === 'pending' && onStatusChange && (
            <>
              <Button size="sm" variant="ghost" className="text-xs text-green-600" onClick={() => onStatusChange(applicant._id, 'shortlisted')}><CheckCircle className="h-3 w-3 mr-1" />Shortlist</Button>
              <Button size="sm" variant="ghost" className="text-xs text-red-600" onClick={() => onStatusChange(applicant._id, 'rejected')}><XCircle className="h-3 w-3 mr-1" />Reject</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}