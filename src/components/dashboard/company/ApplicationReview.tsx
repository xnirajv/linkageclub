'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, CheckCircle, XCircle, Clock, Star, Mail, FileText, User, Sparkles } from 'lucide-react';

interface ApplicationReviewProps {
  application: any;
  onStatusChange?: (status: string, notes?: string) => void;
}

const STATUS_VARIANTS: Record<string, { variant: any; label: string; color: string }> = {
  pending: { variant: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  reviewed: { variant: 'warning', label: 'Reviewed', color: 'bg-blue-100 text-blue-700' },
  shortlisted: { variant: 'success', label: 'Shortlisted', color: 'bg-green-100 text-green-700' },
  rejected: { variant: 'error', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  hired: { variant: 'verified', label: 'Hired', color: 'bg-purple-100 text-purple-700' },
};

export function ApplicationReview({ application, onStatusChange }: ApplicationReviewProps) {
  const [notes, setNotes] = useState(application.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: string) => {
    setIsUpdating(true);
    try {
      await onStatusChange?.(status, notes);
    } finally {
      setIsUpdating(false);
    }
  };

  const user = application.userId;
  const statusConfig = STATUS_VARIANTS[application.status] || STATUS_VARIANTS.pending;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Applicant Info Header */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-gray-800 shadow-xl">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white text-2xl font-semibold">
                {getInitials(user?.name || 'A')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal-950 dark:text-white">
                    {user?.name}
                  </h2>
                  <p className="text-charcoal-500 dark:text-charcoal-400 flex items-center gap-1 mt-1">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                </div>
                <Badge className={`${statusConfig.color} border-0 px-3 py-1 text-sm`}>
                  {statusConfig.label}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    Trust Score: {user?.trustScore}%
                  </span>
                </div>
                {application.matchScore && (
                  <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      {application.matchScore}% Match
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-charcoal-100 dark:bg-charcoal-800 px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4 text-charcoal-500" />
                  <span className="text-sm text-charcoal-600 dark:text-charcoal-400">
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Resume
            </CardTitle>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href={application.resume} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Cover Letter */}
      {application.coverLetter && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              Cover Letter
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-charcoal-700 dark:text-charcoal-300 whitespace-pre-line leading-relaxed">
              {application.coverLetter}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Q&A Section */}
      {application.answers?.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              Screening Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {application.answers.map((qa: any, i: number) => (
              <div key={i} className="pb-3 border-b border-charcoal-100 dark:border-charcoal-800 last:border-0">
                <p className="text-sm font-medium text-charcoal-950 dark:text-white mb-1">
                  {qa.question}
                </p>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                  {qa.answer}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Review Notes & Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Review Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <textarea
            className="w-full rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-card dark:bg-charcoal-900 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            placeholder="Add internal notes about this applicant..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => handleStatusChange('shortlisted')}
              disabled={isUpdating}
              className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4" />
              Shortlist
            </Button>
            <Button
              onClick={() => handleStatusChange('hired')}
              disabled={isUpdating}
              className="gap-2 bg-primary-600 hover:bg-primary-700"
            >
              <CheckCircle className="h-4 w-4" />
              Hire
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusChange('rejected')}
              disabled={isUpdating}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}