'use client';

import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Building, Calendar, CheckCircle, Clock, IndianRupee, Tag, Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Project } from '@/types/project';
import { getCompanyAvatar, getCompanyName } from '@/types/project';
import { SaveButton } from './SaveButton';
import { ApplyModal } from './ApplyModal';

interface ProjectDetailsProps {
  project: Project;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [localProject, setLocalProject] = useState(project);

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const budgetText = localProject.budget
    ? `Rs. ${localProject.budget.min.toLocaleString()} - Rs. ${localProject.budget.max.toLocaleString()} (${localProject.budget.type})`
    : 'Not specified';

  const companyName = getCompanyName(localProject);
  const companyAvatar = getCompanyAvatar(localProject);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <Avatar className="h-16 w-16">
              <AvatarImage src={companyAvatar} />
              <AvatarFallback><Building className="h-8 w-8" /></AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
                    {localProject.title}
                  </h1>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{companyName}</p>
                </div>
                <div className="flex gap-2">
                  <SaveButton
                    projectId={localProject._id}
                    isSaved={localProject.isSaved}
                    onSave={(saved) => setLocalProject((prev) => ({ ...prev, isSaved: saved }))}
                  />
                  <Button
                    onClick={() => setShowApplyModal(true)}
                    disabled={localProject.hasApplied || localProject.status !== 'open'}
                  >
                    {localProject.hasApplied
                      ? 'Applied'
                      : localProject.status !== 'open'
                        ? 'Closed'
                        : 'Apply Now'}
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" /> {budgetText}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {localProject.duration} days
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {localProject.applicationsCount} applicants
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(localProject.createdAt), { addSuffix: true })}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={localProject.status === 'open' ? 'default' : 'secondary'}>
                  {localProject.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {localProject.experienceLevel}
                </Badge>
                <Badge variant="outline">{localProject.category}</Badge>
                {typeof localProject.matchScore === 'number' && (
                  <Badge variant="outline">Match {localProject.matchScore}%</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Project Description</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
            {localProject.description}
          </p>
        </CardContent>
      </Card>

      {localProject.requirements?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {localProject.requirements.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {localProject.milestones?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {localProject.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        Rs. {milestone.amount.toLocaleString()}
                      </span>
                    </div>
                    {milestone.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due in {milestone.deadline} days
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {localProject.skills?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Skills Required</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {localProject.skills.map((skill) => (
                <Badge
                  key={skill.name}
                  variant={skill.mandatory ? 'default' : 'secondary'}
                >
                  {skill.name} {skill.mandatory && '*'}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">* Mandatory</p>
          </CardContent>
        </Card>
      )}

      {localProject.tags?.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {localProject.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ApplyModal
        project={localProject}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onApplied={() => {
          setLocalProject((prev) => ({
            ...prev,
            hasApplied: true,
            applicationsCount: prev.applicationsCount + 1,
          }));
        }}
      />
    </div>
  );
}