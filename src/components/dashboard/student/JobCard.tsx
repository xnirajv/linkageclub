import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { MapPin, Briefcase, Clock, Building, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Job } from '@/types/job';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  hasApplied?: boolean;
  onApply?: (jobId: string) => void;
  isApplying?: boolean;
}

export function JobCard({ job, hasApplied, onApply, isApplying }: JobCardProps) {
  const company = job.company;

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time': return 'bg-green-100 text-green-700';
      case 'part-time': return 'bg-blue-100 text-blue-700';
      case 'contract': return 'bg-purple-100 text-purple-700';
      case 'internship': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-charcoal-100 text-charcoal-700';
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar src={company?.logo} alt={company?.name} className="h-12 w-12" />
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Building className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{company?.name ?? 'Company'}</p>
            </div>
          </div>
          {hasApplied && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Applied
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className={`text-xs ${getJobTypeColor(job.type)}`}>
              {job.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-2 text-sm font-medium text-primary-600">
              <span>💰 {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 4).map((skill) => (
            <Badge key={skill.name} variant="outline" className="text-xs">
              {skill.name}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{job.skills.length - 4}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/dashboard/student/jobs/${job._id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        {!hasApplied && onApply ? (
          <Button 
            className="flex-1" 
            onClick={() => onApply(job._id)}
            disabled={isApplying}
          >
            {isApplying ? 'Applying...' : 'Apply Now'}
          </Button>
        ) : hasApplied && (
          <Button variant="secondary" className="flex-1" disabled>
            Already Applied
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
