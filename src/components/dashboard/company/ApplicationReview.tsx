'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Mail, FileText, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface ApplicationReviewProps {
  application: any;
  onStatusChange?: (status: string, notes?: string) => void;
}

const statusConfig: Record<string, { variant: any; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  reviewed: { variant: 'info', label: 'Reviewed' },
  shortlisted: { variant: 'success', label: 'Shortlisted' },
  rejected: { variant: 'error', label: 'Rejected' },
  hired: { variant: 'default', label: 'Hired' },
};

export function ApplicationReview({ application, onStatusChange }: ApplicationReviewProps) {
  const [notes, setNotes] = useState(application?.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const user = application?.userId;
  const config = statusConfig[application?.status] || statusConfig.pending;

  const handleStatus = async (status: string) => {
    setIsUpdating(true);
    await onStatusChange?.(status, notes);
    setIsUpdating(false);
  };

  if (!application) {
    return <Card className="border border-gray-200 dark:border-gray-800 shadow-sm"><CardContent className="p-12 text-center"><p className="text-gray-500">No application data</p></CardContent></Card>;
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xl font-semibold flex-shrink-0">
              {(user?.name || 'A').charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Mail className="h-4 w-4" />{user?.email}</p>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 text-yellow-500 fill-current" />{user?.trustScore}% Trust</div>
                {application.matchScore && (
                  <div className="flex items-center gap-1 text-sm"><Sparkles className="h-4 w-4 text-green-500" />{application.matchScore}% Match</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {application.coverLetter && (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800"><h3 className="font-semibold text-sm">Cover Letter</h3></div>
          <CardContent className="p-5"><p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{application.coverLetter}</p></CardContent>
        </Card>
      )}

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800"><h3 className="font-semibold text-sm">Review Notes</h3></div>
        <CardContent className="p-5 space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 resize-none"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => handleStatus('shortlisted')} disabled={isUpdating}><CheckCircle className="h-4 w-4 mr-1" />Shortlist</Button>
            <Button size="sm" variant="outline" onClick={() => handleStatus('rejected')} disabled={isUpdating} className="text-red-600"><XCircle className="h-4 w-4 mr-1" />Reject</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}