'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  // AlertTriangle,
  Flag,
  Search,
  Eye,
  CheckCircle,
  Shield,
  Trash2,
  Ban,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import DashboardLayout from '@/app/dashboard/layout';

// Mock data - replace with actual API
const reportedProjects = [
  {
    id: '1',
    title: 'E-commerce Platform Development',
    company: {
      id: 'c1',
      name: 'TechCorp',
      avatar: '/avatars/techcorp.jpg',
      trustScore: 92,
    },
    reports: [
      {
        id: 'r1',
        reason: 'Fraudulent project',
        description: 'The company is asking for free work before payment',
        reportedBy: {
          id: 'u1',
          name: 'Riya Sharma',
        },
        reportedAt: '2024-02-15T10:30:00',
        status: 'pending',
      },
      {
        id: 'r2',
        reason: 'Misleading budget',
        description: 'The budget mentioned is much higher than what they actually offer',
        reportedBy: {
          id: 'u2',
          name: 'Amit Kumar',
        },
        reportedAt: '2024-02-14T14:20:00',
        status: 'pending',
      },
    ],
    reportCount: 2,
    status: 'open',
    budget: { min: 50000, max: 70000 },
    applications: 12,
    createdAt: '2024-02-10',
  },
  {
    id: '2',
    title: 'Mobile App Development',
    company: {
      id: 'c2',
      name: 'AppWorks',
      avatar: '/avatars/appworks.jpg',
      trustScore: 45,
    },
    reports: [
      {
        id: 'r3',
        reason: 'Scam',
        description: 'This company has a history of not paying freelancers',
        reportedBy: {
          id: 'u3',
          name: 'Priya Patel',
        },
        reportedAt: '2024-02-13T09:15:00',
        status: 'pending',
      },
      {
        id: 'r4',
        reason: 'Fake company',
        description: 'The company details seem fabricated',
        reportedBy: {
          id: 'u4',
          name: 'Rahul Mehta',
        },
        reportedAt: '2024-02-12T16:45:00',
        status: 'pending',
      },
      {
        id: 'r5',
        reason: 'Harassment',
        description: 'The company representatives were rude and unprofessional',
        reportedBy: {
          id: 'u5',
          name: 'Neha Singh',
        },
        reportedAt: '2024-02-11T11:30:00',
        status: 'pending',
      },
    ],
    reportCount: 3,
    status: 'open',
    budget: { min: 30000, max: 50000 },
    applications: 5,
    createdAt: '2024-02-08',
  },
];

export default function ReportedProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'hide' | 'warn' | 'delete' | 'dismiss' | null>(null);
  const [actionReason, setActionReason] = useState('');

  const filteredProjects = reportedProjects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (project: any, action: 'hide' | 'warn' | 'delete' | 'dismiss') => {
    setSelectedProject(project);
    setActionType(action);
    setShowActionDialog(true);
  };

  const handleConfirmAction = () => {
    console.log('Action:', {
      projectId: selectedProject?.id,
      action: actionType,
      reason: actionReason,
    });
    setShowActionDialog(false);
    setSelectedProject(null);
    setActionReason('');
  };

  const getPriorityLevel = (reportCount: number) => {
    if (reportCount >= 5) return 'critical';
    if (reportCount >= 3) return 'high';
    if (reportCount >= 2) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950">Reported Projects</h1>
          <p className="text-charcoal-600">Review and moderate reported projects</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Reported</p>
            <p className="text-2xl font-bold">{reportedProjects.length}</p>
          </Card>
          <Card className="p-4 bg-red-50">
            <p className="text-sm text-red-600">Critical (5+ reports)</p>
            <p className="text-2xl font-bold text-red-600">
              {reportedProjects.filter(p => getPriorityLevel(p.reportCount) === 'critical').length}
            </p>
          </Card>
          <Card className="p-4 bg-orange-50">
            <p className="text-sm text-orange-600">High Priority</p>
            <p className="text-2xl font-bold text-orange-600">
              {reportedProjects.filter(p => getPriorityLevel(p.reportCount) === 'high').length}
            </p>
          </Card>
          <Card className="p-4 bg-yellow-50">
            <p className="text-sm text-yellow-600">Medium Priority</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reportedProjects.filter(p => getPriorityLevel(p.reportCount) === 'medium').length}
            </p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search reported projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="investigating">Investigating</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {filteredProjects.map((project) => {
              const priority = getPriorityLevel(project.reportCount);
              return (
                <Card key={project.id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                          <Flag className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{project.title}</h3>
                            <Badge className={getPriorityColor(priority)}>
                              {priority.toUpperCase()} PRIORITY
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={project.company.avatar} />
                              <AvatarFallback>{project.company.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-charcoal-600">{project.company.name}</span>
                            <Badge variant={project.company.trustScore > 70 ? 'success' : 'error'} size="sm">
                              Trust: {project.company.trustScore}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge variant="error">{project.reportCount} Reports</Badge>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-charcoal-500">Budget</p>
                        <p className="font-medium">{formatCurrency(project.budget.min)} - {formatCurrency(project.budget.max)}</p>
                      </div>
                      <div>
                        <p className="text-charcoal-500">Applications</p>
                        <p className="font-medium">{project.applications}</p>
                      </div>
                      <div>
                        <p className="text-charcoal-500">Posted</p>
                        <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Reports List */}
                    <div className="bg-red-50 rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium text-red-800">Reports</p>
                      {project.reports.map((report: any) => (
                        <div key={report.id} className="flex items-start gap-2 text-sm border-l-2 border-red-300 pl-3">
                          <div className="flex-1">
                            <p className="font-medium">{report.reason}</p>
                            <p className="text-xs text-charcoal-600 mt-1">{report.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-charcoal-500">
                              <span>Reported by {report.reportedBy.name}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(report.reportedAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/admin/projects/${project.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Project
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(project, 'warn')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Warn Company
                      </Button>
                      <Button size="sm" variant="outline" className="text-yellow-600" onClick={() => handleAction(project, 'hide')}>
                        <Ban className="mr-2 h-4 w-4" />
                        Hide Project
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleAction(project, 'delete')}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </Button>
                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleAction(project, 'dismiss')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Dismiss Reports
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          {/* Other tabs follow similar pattern */}
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'hide' && 'Hide Project'}
                {actionType === 'warn' && 'Warn Company'}
                {actionType === 'delete' && 'Delete Project'}
                {actionType === 'dismiss' && 'Dismiss Reports'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'hide' && 'This will hide the project from public view.'}
                {actionType === 'warn' && 'Send a warning to the company about this project.'}
                {actionType === 'delete' && 'This will permanently delete the project. This action cannot be undone.'}
                {actionType === 'dismiss' && 'This will dismiss all reports and mark them as resolved.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedProject && (
                <div className="p-3 bg-charcoal-100/50 rounded-lg">
                  <p className="font-medium">{selectedProject.title}</p>
                  <p className="text-sm text-charcoal-600">by {selectedProject.company.name}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason for this action..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'delete' ? 'destructive' : 'default'}
                onClick={handleConfirmAction}
              >
                Confirm {actionType}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}