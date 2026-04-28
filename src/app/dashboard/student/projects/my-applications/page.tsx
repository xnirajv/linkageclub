'use client';

import React, { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ApplicationsList } from '@/components/applications/ApplicationList';
import { useApplications } from '@/hooks/useApplications';
import DashboardLayout from '@/app/dashboard/layout';
import { Loader2 } from 'lucide-react';

interface Application {
  _id: string;
  type: 'project' | 'job';
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: string;
  projectId?: { _id: string; title: string };
  jobId?: { _id: string; title: string; company?: { name: string } };
  applicantId: string;
  companyId: string;
}

export default function MyApplicationsPage() {
  const { applications = [], isLoading } = useApplications({ role: 'applicant', limit: 50 });

  const pendingApps = useMemo(() => applications.filter((app: Application) => app.status === 'pending'), [applications]);
  const shortlistedApps = useMemo(() => applications.filter((app: Application) => app.status === 'shortlisted'), [applications]);
  const acceptedApps = useMemo(() => applications.filter((app: Application) => app.status === 'accepted'), [applications]);
  const rejectedApps = useMemo(() => applications.filter((app: Application) => app.status === 'rejected'), [applications]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-gray-600">Track your project and job applications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-blue-600">Total</p><p className="text-2xl font-bold text-blue-700">{applications.length}</p></div>
          <div className="p-4 bg-yellow-50 rounded-lg"><p className="text-sm text-yellow-600">Pending</p><p className="text-2xl font-bold text-yellow-700">{pendingApps.length}</p></div>
          <div className="p-4 bg-purple-50 rounded-lg"><p className="text-sm text-purple-600">Shortlisted</p><p className="text-2xl font-bold text-purple-700">{shortlistedApps.length}</p></div>
          <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-green-600">Accepted</p><p className="text-2xl font-bold text-green-700">{acceptedApps.length}</p></div>
          <div className="p-4 bg-red-50 rounded-lg"><p className="text-sm text-red-600">Rejected</p><p className="text-2xl font-bold text-red-700">{rejectedApps.length}</p></div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingApps.length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({shortlistedApps.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedApps.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApps.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6"><ApplicationsList applications={applications} isLoading={isLoading} type="all" /></TabsContent>
          <TabsContent value="pending" className="mt-6"><ApplicationsList applications={pendingApps} isLoading={isLoading} type="pending" /></TabsContent>
          <TabsContent value="shortlisted" className="mt-6"><ApplicationsList applications={shortlistedApps} isLoading={isLoading} type="shortlisted" /></TabsContent>
          <TabsContent value="accepted" className="mt-6"><ApplicationsList applications={acceptedApps} isLoading={isLoading} type="accepted" /></TabsContent>
          <TabsContent value="rejected" className="mt-6"><ApplicationsList applications={rejectedApps} isLoading={isLoading} type="rejected" /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}