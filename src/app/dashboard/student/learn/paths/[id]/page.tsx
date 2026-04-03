'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { LearningPath } from '@/components/dashboard/student/LearningPath';
import { Card, CardContent } from '@/components/ui/card';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen } from 'lucide-react';

// Types - Cleanly separated
interface Step {
  id: string;
  title: string;
  type: 'video' | 'article' | 'assessment' | 'project';
  duration?: string;
  completed: boolean;
  locked: boolean;
}

interface LearningPathData {
  _id: string;
  title: string;
  description?: string;
  progress?: number;
  steps?: Step[];
}

interface ApiResponse {
  path?: LearningPathData;
  error?: string;
}

export default function StudentLearningPathPage() {
  const params = useParams();
  const pathId = params?.id as string;
  
  // ✅ Production-ready SWR with type assertion
  const { data, error, isLoading } = useSWR(
    pathId ? `/api/mentors/resources?pathId=${pathId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,     // Don't refetch on tab focus
      revalidateOnReconnect: false, // Don't refetch on network reconnect
      dedupingInterval: 60000,      // Dedupe requests within 60 seconds
      errorRetryCount: 3,            // Retry 3 times on error
    }
  ) as { data: ApiResponse | undefined; error: any; isLoading: boolean };
  
  const path = data?.path;

  // Loading state with skeletons
  if (isLoading) {
    return (
        <div className="max-w-3xl mx-auto space-y-6 p-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-2 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
        <Card className="max-w-md mx-auto mt-10">
          <CardContent className="py-10 text-center">
            <p className="text-red-600 mb-4">Failed to load learning path</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-primary-600 hover:underline"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
    );
  }

  // Not found state
  if (!path) {
    return (
        <Card className="max-w-md mx-auto mt-10">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-charcoal-100 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Learning Path Not Found</h3>
              <p className="text-charcoal-500 max-w-md">
                The learning path you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </CardContent>
        </Card>
    );
  }

  // Success state
  return (
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            {path.title}
          </h1>
          {path.description && (
            <p className="text-charcoal-600 dark:text-charcoal-400 mt-1">
              {path.description}
            </p>
          )}
        </div>

        <LearningPath
          title={path.title}
          description={path.description}
          progress={path.progress || 0}
          steps={path.steps || []}
        />
      </div>
  );
}