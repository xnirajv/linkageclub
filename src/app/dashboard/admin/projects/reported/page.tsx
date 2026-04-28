'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Flag, Search, Eye, CheckCircle, Shield, Trash2, Ban } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import DashboardLayout from '@/app/dashboard/layout';

interface Report {
  id: string; reason: string; description: string;
  reportedBy: { id: string; name: string }; reportedAt: string; status: string;
}

interface ReportedProject {
  id: string; title: string;
  company: { id: string; name: string; avatar: string; trustScore: number };
  reports: Report[]; reportCount: number; status: string;
  budget: { min: number; max: number }; applications: number; createdAt: string;
}

const reportedProjects: ReportedProject[] = [
  { id: '1', title: 'E-commerce Platform Development', company: { id: 'c1', name: 'TechCorp', avatar: '/avatars/techcorp.jpg', trustScore: 92 }, reports: [{ id: 'r1', reason: 'Fraudulent project', description: 'Company asking for free work', reportedBy: { id: 'u1', name: 'Riya Sharma' }, reportedAt: '2024-02-15T10:30:00', status: 'pending' }, { id: 'r2', reason: 'Misleading budget', description: 'Budget much higher than actual', reportedBy: { id: 'u2', name: 'Amit Kumar' }, reportedAt: '2024-02-14T14:20:00', status: 'pending' }], reportCount: 2, status: 'open', budget: { min: 50000, max: 70000 }, applications: 12, createdAt: '2024-02-10' },
  { id: '2', title: 'Mobile App Development', company: { id: 'c2', name: 'AppWorks', avatar: '/avatars/appworks.jpg', trustScore: 45 }, reports: [{ id: 'r3', reason: 'Scam', description: 'History of not paying', reportedBy: { id: 'u3', name: 'Priya Patel' }, reportedAt: '2024-02-13T09:15:00', status: 'pending' }], reportCount: 1, status: 'open', budget: { min: 30000, max: 50000 }, applications: 5, createdAt: '2024-02-08' },
];

export default function ReportedProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ReportedProject | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'hide' | 'warn' | 'delete' | 'dismiss' | null>(null);
  const [actionReason, setActionReason] = useState('');

  const filteredProjects = reportedProjects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityLevel = (count: number) => { if (count >= 5) return 'critical'; if (count >= 3) return 'high'; if (count >= 2) return 'medium'; return 'low'; };
  const getPriorityColor = (p: string) => { switch (p) { case 'critical': return 'bg-red-100 text-red-800'; case 'high': return 'bg-orange-100 text-orange-800'; case 'medium': return 'bg-yellow-100 text-yellow-800'; default: return 'bg-blue-100 text-blue-800'; } };

  const handleAction = (project: ReportedProject, action: 'hide' | 'warn' | 'delete' | 'dismiss') => { setSelectedProject(project); setActionType(action); setShowActionDialog(true); };
  const handleConfirmAction = () => { console.log('Action:', selectedProject?.id, actionType, actionReason); setShowActionDialog(false); setSelectedProject(null); setActionReason(''); };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Reported Projects</h1><p className="text-gray-600">Review and moderate reported projects</p></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><p className="text-sm text-gray-500">Total Reported</p><p className="text-2xl font-bold">{reportedProjects.length}</p></Card>
          <Card className="p-4 bg-red-50"><p className="text-sm text-red-600">Critical (5+)</p><p className="text-2xl font-bold text-red-600">{reportedProjects.filter((p) => getPriorityLevel(p.reportCount) === 'critical').length}</p></Card>
          <Card className="p-4 bg-orange-50"><p className="text-sm text-orange-600">High Priority</p><p className="text-2xl font-bold text-orange-600">{reportedProjects.filter((p) => getPriorityLevel(p.reportCount) === 'high').length}</p></Card>
          <Card className="p-4 bg-yellow-50"><p className="text-sm text-yellow-600">Medium</p><p className="text-2xl font-bold text-yellow-600">{reportedProjects.filter((p) => getPriorityLevel(p.reportCount) === 'medium').length}</p></Card>
        </div>

        <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search reported projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>

        <Tabs defaultValue="pending">
          <TabsList><TabsTrigger value="pending">Pending Review</TabsTrigger><TabsTrigger value="all">All Reports</TabsTrigger></TabsList>
          <TabsContent value="pending" className="space-y-4">
            {filteredProjects.map((project) => {
              const priority = getPriorityLevel(project.reportCount);
              return (
                <Card key={project.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-full"><Flag className="h-4 w-4 text-red-600" /></div>
                        <div>
                          <div className="flex items-center gap-2 mb-1"><h3 className="text-lg font-semibold">{project.title}</h3><Badge className={getPriorityColor(priority)}>{priority.toUpperCase()}</Badge></div>
                          <div className="flex items-center gap-2"><Avatar className="h-5 w-5"><AvatarImage src={project.company.avatar} /><AvatarFallback>{project.company.name[0]}</AvatarFallback></Avatar><span className="text-sm text-gray-600">{project.company.name}</span><Badge variant={project.company.trustScore > 70 ? 'success' : 'error'} size="sm">Trust: {project.company.trustScore}%</Badge></div>
                        </div>
                      </div>
                      <Badge variant="error">{project.reportCount} Reports</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm"><div><p className="text-gray-500">Budget</p><p className="font-medium">{formatCurrency(project.budget.min)} - {formatCurrency(project.budget.max)}</p></div><div><p className="text-gray-500">Applications</p><p className="font-medium">{project.applications}</p></div><div><p className="text-gray-500">Posted</p><p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p></div></div>
                    <div className="bg-red-50 rounded-lg p-4 space-y-3"><p className="text-sm font-medium text-red-800">Reports</p>{project.reports.map((report) => (<div key={report.id} className="flex items-start gap-2 text-sm border-l-2 border-red-300 pl-3"><div className="flex-1"><p className="font-medium">{report.reason}</p><p className="text-xs text-gray-600 mt-1">{report.description}</p><div className="flex items-center gap-2 mt-1 text-xs text-gray-500"><span>By {report.reportedBy.name}</span><span>•</span><span>{formatRelativeTime(report.reportedAt)}</span></div></div></div>))}</div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" asChild><Link href={`/dashboard/admin/projects/${project.id}`}><Eye className="mr-2 h-4 w-4" />View</Link></Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(project, 'warn')}><Shield className="mr-2 h-4 w-4" />Warn</Button>
                      <Button size="sm" variant="outline" className="text-yellow-600" onClick={() => handleAction(project, 'hide')}><Ban className="mr-2 h-4 w-4" />Hide</Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleAction(project, 'delete')}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleAction(project, 'dismiss')}><CheckCircle className="mr-2 h-4 w-4" />Dismiss</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{actionType === 'hide' ? 'Hide' : actionType === 'warn' ? 'Warn' : actionType === 'delete' ? 'Delete' : 'Dismiss'} Project</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              {selectedProject && <div className="p-3 bg-gray-100 rounded-lg"><p className="font-medium">{selectedProject.title}</p><p className="text-sm text-gray-600">by {selectedProject.company.name}</p></div>}
              <div><label className="block text-sm font-medium mb-1">Reason</label><Textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Enter reason..." rows={3} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowActionDialog(false)}>Cancel</Button><Button variant={actionType === 'delete' ? 'destructive' : 'default'} onClick={handleConfirmAction}>Confirm</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
