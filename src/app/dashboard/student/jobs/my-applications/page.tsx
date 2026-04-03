'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useApplications } from '@/hooks/useApplications';
import { 
  Briefcase, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Calendar,
  IndianRupee,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';

// Types
interface Job {
  _id: string;
  title: string;
  location?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

interface Company {
  _id: string;
  name: string;
  avatar?: string;
}

interface Interview {
  scheduled: boolean;
  date?: string;
  link?: string;
}

interface Application {
  _id: string;
  job?: Job;
  company?: Company;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: string;
  interview?: Interview;
}

export default function StudentJobApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { applications = [], isLoading } = useApplications({ 
    role: 'applicant',
    type: 'job'
  });

  // Type cast applications
  const typedApplications = applications as Application[];

  // Filter applications with proper typing
  const filteredApps = useMemo(() => {
    return typedApplications.filter((app: Application) => 
      app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [typedApplications, searchQuery]);

  // Filter by status with proper typing
  const pendingApps = useMemo(() => 
    filteredApps.filter((app: Application) => app.status === 'pending'), 
    [filteredApps]
  );
  
  const shortlistedApps = useMemo(() => 
    filteredApps.filter((app: Application) => app.status === 'shortlisted'), 
    [filteredApps]
  );
  
  const acceptedApps = useMemo(() => 
    filteredApps.filter((app: Application) => app.status === 'accepted'), 
    [filteredApps]
  );
  
  const rejectedApps = useMemo(() => 
    filteredApps.filter((app: Application) => app.status === 'rejected'), 
    [filteredApps]
  );



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
          <h1 className="text-2xl font-bold text-charcoal-950">My Job Applications</h1>
          <p className="text-charcoal-600">Track your job applications and responses</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Applications</p>
            <p className="text-2xl font-bold">{filteredApps.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingApps.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Shortlisted</p>
            <p className="text-2xl font-bold text-blue-600">{shortlistedApps.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{acceptedApps.length}</p>
          </Card>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All ({filteredApps.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingApps.length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({shortlistedApps.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedApps.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApps.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredApps.length === 0 ? (
              <EmptyState />
            ) : (
              filteredApps.map((app: Application) => (
                <ApplicationCard key={app._id} application={app} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingApps.map((app: Application) => (
              <ApplicationCard key={app._id} application={app} />
            ))}
          </TabsContent>

          <TabsContent value="shortlisted" className="space-y-4 mt-6">
            {shortlistedApps.map((app: Application) => (
              <ApplicationCard key={app._id} application={app} />
            ))}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4 mt-6">
            {acceptedApps.map((app: Application) => (
              <ApplicationCard key={app._id} application={app} />
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedApps.map((app: Application) => (
              <ApplicationCard key={app._id} application={app} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Application Card Component
interface ApplicationCardProps {
  application: Application;
}

function ApplicationCard({ application }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'shortlisted': return <Eye className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={application.company?.avatar} />
          <AvatarFallback>{application.company?.name?.[0] || 'C'}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{application.job?.title || 'Job Title'}</h3>
              <p className="text-charcoal-600">{application.company?.name || 'Company'}</p>
            </div>
            <Badge className={getStatusColor(application.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(application.status)}
                {application.status}
              </span>
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Applied: {new Date(application.submittedAt).toLocaleDateString()}
            </span>
            {application.job?.location && (
              <span className="flex items-center gap-1">
                📍 {application.job.location}
              </span>
            )}
            {application.job?.salary && (
              <span className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                {application.job.salary.min?.toLocaleString()} - {application.job.salary.max?.toLocaleString()}
              </span>
            )}
          </div>

          {application.interview?.scheduled && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Interview Scheduled: {new Date(application.interview.date!).toLocaleString()}
              </p>
              {application.interview.link && (
                <a 
                  href={application.interview.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                >
                  Join Meeting
                </a>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/student/jobs/${application.job?._id}`}>
                View Job
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/student/applications/${application._id}`}>
                View Application
              </Link>
            </Button>
            {application.status === 'pending' && (
              <Button size="sm" variant="outline" className="text-red-600">
                Withdraw
              </Button>
            )}
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
      <Briefcase className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No applications yet</h3>
      <p className="text-charcoal-500 mb-4">Start applying to jobs to track them here</p>
      <Button asChild>
        <Link href="/dashboard/student/jobs">Browse Jobs</Link>
      </Button>
    </Card>
  );
}