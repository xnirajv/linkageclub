'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MilestoneTracker } from '@/components/dashboard/student/MilestoneTracker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IndianRupee, Star, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';
import DashboardLayout from '@/app/dashboard/layout';

// Types
interface Company {
  _id: string;
  name: string;
  companyName?: string;
  avatar?: string;
}

interface Milestone {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  deadline: number;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  completedAt?: string;
}

interface Review {
  rating: number;
  comment: string;
  createdAt: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  budget: {
    min: number;
    max: number;
  };
  company?: Company;
  companyId: string;
  milestones?: Milestone[];
  reviews?: Review[];
  startDate?: string;
  endDate?: string;
  status: string;
}

interface ApiResponse {
  project?: Project;
  error?: string;
}

export default function StudentCompletedProjectPage() {
  const params = useParams();
  const projectId = params?.id as string;
  
  const { data, error, isLoading } = useSWR<ApiResponse>(
    projectId ? `/api/projects/${projectId}` : null,
    fetcher
  );
  
  const project = data?.project;

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-10">
          <CardContent className="py-10 text-center">
            <h3 className="text-lg font-medium mb-2">Project Not Found</h3>
            <p className="text-charcoal-500">The project you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Calculate total earned from approved milestones
  const totalEarned = project.milestones
    ?.filter((m: Milestone) => m.status === 'approved')
    .reduce((sum: number, m: Milestone) => sum + m.amount, 0) || 0;

  // Get company display name
  const companyName = (project.company as Company)?.companyName || 
                      (project.company as Company)?.name || 
                      'Client';

  // Get company avatar
  const companyAvatar = (project.company as Company)?.avatar;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">{project.title}</h1>
            <p className="text-charcoal-600 dark:text-charcoal-400 mt-1">Completed Project</p>
          </div>
          <Badge variant="success" size="lg">Completed</Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <div className="flex items-center justify-center gap-1 text-xl font-bold text-success-600 mt-1">
                <IndianRupee className="h-4 w-4" />
                {totalEarned.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-xl font-bold mt-1">{project.duration} days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Milestones</p>
              <p className="text-xl font-bold mt-1">{project.milestones?.length || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Company/Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={companyAvatar} />
                <AvatarFallback>{companyName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{companyName}</p>
                <p className="text-sm text-muted-foreground">{project.category}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        {project.milestones && project.milestones.length > 0 ? (
          <MilestoneTracker milestones={project.milestones} projectId={project._id} />
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-charcoal-500">No milestones found for this project</p>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {project.reviews && project.reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Client Review</CardTitle>
            </CardHeader>
            <CardContent>
              {project.reviews.map((review: Review, index: number) => (
                <div key={index}>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star 
                        key={j} 
                        className={`h-5 w-5 ${
                          j < review.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-charcoal-200'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-charcoal-700 dark:text-charcoal-300">{review.comment}</p>
                  <p className="text-xs text-charcoal-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* If no review yet */}
        {(!project.reviews || project.reviews.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-charcoal-500">No review has been provided yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}