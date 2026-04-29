'use client';

import React from 'react';
import { Star, MapPin, Calendar, Briefcase, MessageSquare, Award, ExternalLink, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CandidateTabProps {
  project: any;
}

export function CandidateTab({ project }: CandidateTabProps) {
  const candidate = project?.candidate;

  if (!candidate) {
    return (
      <Card className="border border-dashed border-gray-300 dark:border-gray-700 shadow-none">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Candidate Hired Yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            A candidate will appear here once you accept an application for this project.
          </p>
          <Button size="sm" className="mt-4" variant="outline" asChild>
            <a href={`/dashboard/company/my-projects/${project._id}/applications`}>
              View Applications
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <CardContent className="p-6 -mt-10">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-md flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-white flex-shrink-0">
              {(candidate.name || 'C')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{candidate.name}</h2>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" />Verified
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  Trust Score: <span className="font-semibold text-gray-900 dark:text-white">{candidate.trustScore}%</span>
                </span>
                {candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {candidate.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(candidate.memberSince || project.startDate || project.createdAt).getFullYear()}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Full Profile
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Verified Skills */}
        {candidate.skills?.length > 0 && (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                Verified Skills
              </h3>
            </div>
            <CardContent className="p-5">
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs px-3 py-1.5">
                    {skill}
                    <ShieldCheck className="h-3 w-3 ml-1 text-green-500" />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio */}
        {candidate.portfolio?.length > 0 && (
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-600" />
                Portfolio & Past Projects
              </h3>
            </div>
            <CardContent className="p-5 space-y-3">
              {candidate.portfolio.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.tech}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{item.rating}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activity */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm">Activity on This Project</h3>
        </div>
        <CardContent className="p-5">
          <div className="space-y-3">
            {project.milestones?.filter((m: any) => m.status === 'approved' || m.status === 'submitted' || m.status === 'completed')
              .map((m: any, i: number) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {m.status === 'approved' ? 'Completed' : 'Submitted'} Milestone: <span className="font-medium">{m.title}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(m.submittedAt || m.completedAt || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            {project.startDate && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 dark:text-gray-300">Project started</p>
                  <p className="text-xs text-gray-500">{new Date(project.startDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}