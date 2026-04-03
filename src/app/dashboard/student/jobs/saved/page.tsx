'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useJobs } from '@/hooks/useJobs';
import { 
  Bookmark, 
  Search, 
  MapPin, 
  IndianRupee, 
  Briefcase,
  X,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';

// Types
interface Company {
  _id: string;
  name: string;
  avatar?: string;
}

interface Salary {
  min: number;
  max: number;
  currency: string;
}

interface Skill {
  name: string;
  level?: string;
}

interface Job {
  _id: string;
  title: string;
  company?: Company;
  location: string;
  type: string;
  salary?: Salary;
  skills?: Skill[];
  postedAt?: string;
}

export default function SavedJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { jobs: savedJobs = [], isLoading, saveJob } = useJobs({ saved: true });

  // Filter jobs with proper typing
  const filteredJobs = useMemo(() => {
    return savedJobs.filter((job: Job) => 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [savedJobs, searchQuery]);

  const handleRemoveSaved = async (jobId: string) => {
    try {
      await saveJob(jobId);
      // Optional: Show success toast
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950">Saved Jobs</h1>
          <p className="text-charcoal-600">Jobs you've bookmarked for later</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search saved jobs..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Saved Jobs List */}
        {filteredJobs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job: Job) => (
              <JobCard 
                key={job._id} 
                job={job} 
                onRemove={handleRemoveSaved}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Job Card Component
interface JobCardProps {
  job: Job;
  onRemove: (id: string) => Promise<void>;
}

function JobCard({ job, onRemove }: JobCardProps) {
  return (
    <Card className="p-6 group hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={job.company?.avatar} />
          <AvatarFallback>{job.company?.name?.[0] || 'C'}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p className="text-charcoal-600">{job.company?.name || 'Company'}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(job._id)}
              title="Remove from saved"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                ₹{job.salary.min?.toLocaleString()} - ₹{job.salary.max?.toLocaleString()}
              </span>
            )}
            {job.type && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.type.replace('-', ' ')}
              </span>
            )}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {job.skills.slice(0, 4).map((skill: Skill, index: number) => (
                <Badge key={index} variant="skill" size="sm">
                  {skill.name}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge variant="skill" size="sm">
                  +{job.skills.length - 4}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button size="sm" asChild>
              <Link href={`/dashboard/student/jobs/${job._id}`}>
                View Details
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/student/jobs/${job._id}/apply`}>
                Apply Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <Bookmark className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No saved jobs</h3>
      <p className="text-charcoal-500 mb-4">Jobs you save will appear here</p>
      <Button asChild>
        <Link href="/dashboard/student/jobs">Browse Jobs</Link>
      </Button>
    </Card>
  );
}