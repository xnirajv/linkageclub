'use client';

import React, { useState } from 'react';
import { Job } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/divider';
import { SaveJobButton } from './SaveJobButton';
import { JobApplyModal } from './JobApplyModal';
import {
  MapPin, Briefcase, Clock, IndianRupee, Users, CheckCircle, Calendar, Building
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobDetailsProps {
  job: Job;
}

export function JobDetails({ job }: JobDetailsProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);

  const salaryText = job.salary
    ? `₹${job.salary.min.toLocaleString()}–₹${job.salary.max.toLocaleString()} / ${job.salary.period}`
    : 'Not disclosed';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={(job.company as any)?.avatar} alt={(job.company as any)?.companyName} />
              <AvatarFallback><Building className="h-8 w-8" /></AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">{job.title}</h1>
                  <p className="text-charcoal-600 dark:text-charcoal-400 mt-1">
                    {(job.company as any)?.companyName || 'Company'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <SaveJobButton jobId={job._id} isSaved={job.isSaved} />
                  <Button
                    onClick={() => setShowApplyModal(true)}
                    disabled={job.hasApplied}
                  >
                    {job.hasApplied ? 'Applied' : 'Apply Now'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-charcoal-600 dark:text-charcoal-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> {job.type}
                </span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" /> {salaryText}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </span>
                {job.openings > 1 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {job.openings} openings
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {job.isVerified && <Badge variant="verified">Verified</Badge>}
                <Badge variant="outline">
                  {job.experience?.level} · {job.experience?.min}–{job.experience?.max} yrs
                </Badge>
                {job.deadline && (
                  <Badge variant="warning">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader><CardTitle>Job Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-charcoal-700 dark:text-charcoal-300 whitespace-pre-line">{job.description}</p>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      {job.responsibilities?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Responsibilities</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {job.responsibilities.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-charcoal-700 dark:text-charcoal-300">
                  <CheckCircle className="h-4 w-4 text-success-600 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      {job.requirements?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {job.requirements.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-charcoal-700 dark:text-charcoal-300">
                  <CheckCircle className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {job.skills?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Required Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge
                  key={skill.name}
                  variant={skill.mandatory ? 'default' : 'skill'}
                >
                  {skill.name}
                  {skill.mandatory && ' *'}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">* Mandatory skills</p>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Benefits</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {job.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-charcoal-700 dark:text-charcoal-300">
                  <CheckCircle className="h-4 w-4 text-success-600 mt-0.5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <JobApplyModal
        job={job}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />
    </div>
  );
}
