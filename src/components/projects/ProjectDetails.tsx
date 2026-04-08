'use client';

import React, { useState } from 'react';
import { Project, getCompanyName, getCompanyAvatar } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SaveButton } from './SaveButton';
import { ApplyModal } from './ApplyModal';
import {
  IndianRupee, Calendar, Users, CheckCircle, Building, Clock, Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectDetailsProps {
  project: Project;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);

  const budgetText = project.budget
    ? `₹${project.budget.min.toLocaleString()}–₹${project.budget.max.toLocaleString()} (${project.budget.type})`
    : 'Not specified';

  const companyName = getCompanyName(project);
  const companyAvatar = getCompanyAvatar(project);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={companyAvatar} />
              <AvatarFallback><Building className="h-8 w-8" /></AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-950 dark:text-white">{project.title}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{companyName}</p>
                </div>
                <div className="flex gap-2">
                  <SaveButton projectId={project._id} isSaved={project.isSaved} />
                  <Button
                    onClick={() => setShowApplyModal(true)}
                    disabled={project.hasApplied || project.status !== 'open'}
                  >
                    {project.hasApplied ? 'Applied' : project.status !== 'open' ? 'Closed' : 'Apply Now'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" /> {budgetText}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {project.duration} days
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {project.applicationsCount} applicants
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
                <Badge variant="outline" className="capitalize">{project.experienceLevel}</Badge>
                <Badge variant="outline">{project.category}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Project Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{project.description}</p>
        </CardContent>
      </Card>

      {project.requirements?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {project.requirements.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {project.milestones?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.milestones.map((milestone, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <span className="text-sm text-muted-foreground">₹{milestone.amount.toLocaleString()}</span>
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Due in {milestone.deadline} days</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {project.skills?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Skills Required</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <Badge key={skill.name} variant={skill.mandatory ? 'default' : 'secondary'}>
                  {skill.name} {skill.mandatory && '*'}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">* Mandatory</p>
          </CardContent>
        </Card>
      )}

      {project.tags?.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ApplyModal
        project={project}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />
    </div>
  );
}