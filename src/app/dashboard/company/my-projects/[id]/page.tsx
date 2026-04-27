'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Briefcase,
  ExternalLink,
  MessageSquare,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-purple-100 text-purple-700',
    draft: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
}

export default function CompanyProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, isLoading, errorMessage } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4 text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600">{errorMessage || 'Project not found'}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/company/my-projects">Back to My Projects</Link>
        </Button>
      </div>
    );
  }

  const progress = project.milestones?.length
    ? Math.round(
        (project.milestones.filter((m: any) => m.status === 'approved').length /
          project.milestones.length) *
          100
      )
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={getStatusBadge(project.status)}>
                {project.status === 'open' ? 'Active' : project.status}
              </Badge>
              <span className="text-sm text-gray-500">
                {progress}% Complete • {project.duration} days
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/dashboard/company/my-projects/${projectId}/manage`}>
              Manage Project
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/company/my-projects/${projectId}/applications`}>
              <Users className="mr-2 h-4 w-4" />
              Applications ({project.applicationsCount || 0})
            </Link>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-500">Project Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label="Budget"
          value={`${formatCurrency(project.budget?.min || 0)} - ${formatCurrency(project.budget?.max || 0)}`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          label="Duration"
          value={`${project.duration} days`}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-purple-600" />}
          label="Posted"
          value={new Date(project.createdAt).toLocaleDateString()}
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-orange-600" />}
          label="Category"
          value={project.category || 'General'}
        />
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Description + Skills */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Project Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap leading-7">{project.description}</p>
            </CardContent>
          </Card>

          {project.skills?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Skills Required</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill: any, i: number) => (
                    <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                      {skill.name || skill} {skill.level && `(${skill.level})`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.requirements?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {project.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 bg-primary-600 rounded-full" />
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Milestones + Location */}
        <div className="space-y-6">
          {project.milestones?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {project.milestones.map((milestone: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-sm">{milestone.title}</p>
                      <p className="text-xs text-gray-500">Day {milestone.deadline}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(milestone.amount)}</p>
                      <Badge className={getStatusBadge(milestone.status)}>
                        {milestone.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {project.location && (
            <Card>
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-lg font-medium capitalize">
                    {project.location.type}
                    {project.location.label && ` - ${project.location.label}`}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />Message
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() =>
                  router.push(`/dashboard/company/my-projects/${projectId}/manage`)
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />Manage Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}