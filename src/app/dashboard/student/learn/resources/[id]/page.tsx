'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/learn/VideoPlayer';
import { ExternalLink, Download, Loader2, FileText, PlayCircle } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';
import DashboardLayout from '@/app/dashboard/layout';

// Types
interface Resource {
  _id: string;
  title: string;
  description?: string;
  type: 'video' | 'article' | 'course' | 'template' | 'other';
  url: string;
  tags?: string[];
  downloads?: number;
  createdAt?: string;
}

interface ApiResponse {
  resource?: Resource;
  error?: string;
}

export default function StudentLearnResourcePage() {
  const params = useParams();
  const resourceId = params?.id as string;
  
  // ✅ FIX: Type assertion
  const { data, error, isLoading } = useSWR(
    resourceId ? `/api/mentors/resources/${resourceId}` : null,
    fetcher
  ) as { data: ApiResponse | undefined; error: any; isLoading: boolean };
  
  const resource = data?.resource;

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
  if (error || !resource) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-10">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-charcoal-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Resource Not Found</h3>
              <p className="text-charcoal-500 max-w-md">
                The resource you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Get icon based on resource type
  const getResourceIcon = () => {
    switch (resource.type) {
      case 'video': return <PlayCircle className="h-5 w-5" />;
      case 'article': return <FileText className="h-5 w-5" />;
      default: return <ExternalLink className="h-5 w-5" />;
    }
  };

  // Get action text based on resource type
  const getActionText = () => {
    switch (resource.type) {
      case 'video': return 'Watch Video';
      case 'article': return 'Read Article';
      case 'course': return 'Start Course';
      default: return 'Open Resource';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">{resource.title}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant="skill" className="capitalize">
              {getResourceIcon()}
              <span className="ml-1">{resource.type}</span>
            </Badge>
            {resource.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline" size="sm">#{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Video Player - Only for video type */}
        {resource.type === 'video' && (
          <VideoPlayer src={resource.url} title={resource.title} />
        )}

        {/* Resource Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>About this Resource</CardTitle>
          </CardHeader>
          <CardContent>
            {resource.description && (
              <p className="text-charcoal-700 dark:text-charcoal-300 mb-6">
                {resource.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Action Button */}
              <Button asChild className="gap-2">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {getResourceIcon()}
                  {getActionText()}
                </a>
              </Button>

              {/* Downloads count */}
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Download className="h-4 w-4" />
                {resource.downloads || 0} downloads
              </span>

              {/* Created date if available */}
              {resource.createdAt && (
                <span className="text-sm text-muted-foreground">
                  Added {new Date(resource.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}