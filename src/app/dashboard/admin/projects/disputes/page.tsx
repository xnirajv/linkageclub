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
import { AlertTriangle, Search, Clock, MessageCircle, Eye, Scale, FileText, Calendar, DollarSign } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';

interface Dispute {
  id: string;
  projectId: string;
  projectTitle: string;
  raisedBy: { id: string; name: string; role: 'student' | 'company'; avatar: string };
  against: { id: string; name: string; role: 'student' | 'company' };
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  amount: number;
  createdAt: string;
  updatedAt: string;
  evidence?: string[];
  messages?: { id: string; userId: string; content: string; createdAt: string }[];
}

const disputes: Dispute[] = [
  { id: '1', projectId: 'p1', projectTitle: 'E-commerce Platform Development', raisedBy: { id: 's1', name: 'Riya Sharma', role: 'student', avatar: '/avatars/riya.jpg' }, against: { id: 'c1', name: 'TechCorp', role: 'company' }, reason: 'Payment Dispute', description: 'Client has not released payment for completed milestone.', status: 'pending', priority: 'high', amount: 15000, createdAt: '2024-02-10', updatedAt: '2024-02-10' },
  { id: '2', projectId: 'p2', projectTitle: 'Mobile App Design', raisedBy: { id: 'c2', name: 'DesignStudio', role: 'company', avatar: '/avatars/designstudio.jpg' }, against: { id: 's2', name: 'Amit Kumar', role: 'student' }, reason: 'Quality Issue', description: 'Delivered work does not match requirements.', status: 'investigating', priority: 'medium', amount: 25000, createdAt: '2024-02-09', updatedAt: '2024-02-11' },
  { id: '3', projectId: 'p3', projectTitle: 'Backend API Development', raisedBy: { id: 's3', name: 'Priya Patel', role: 'student', avatar: '/avatars/priya.jpg' }, against: { id: 'c3', name: 'StartupX', role: 'company' }, reason: 'Scope Creep', description: 'Client adding new requirements without adjusting budget.', status: 'resolved', priority: 'low', amount: 40000, createdAt: '2024-02-05', updatedAt: '2024-02-08' },
];

export default function DisputesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredDisputes = disputes.filter((d) =>
    d.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.raisedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.against.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingDisputes = filteredDisputes.filter((d) => d.status === 'pending');
  const investigatingDisputes = filteredDisputes.filter((d) => d.status === 'investigating');
  const resolvedDisputes = filteredDisputes.filter((d) => d.status === 'resolved');

  const getStatusColor = (status: string) => {
    switch (status) { case 'pending': return 'bg-yellow-100 text-yellow-800'; case 'investigating': return 'bg-blue-100 text-blue-800'; case 'resolved': return 'bg-green-100 text-green-800'; case 'rejected': return 'bg-red-100 text-red-800'; default: return 'bg-gray-100 text-gray-800'; }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) { case 'urgent': return 'bg-red-100 text-red-800'; case 'high': return 'bg-orange-100 text-orange-800'; case 'medium': return 'bg-yellow-100 text-yellow-800'; case 'low': return 'bg-blue-100 text-blue-800'; default: return 'bg-gray-100 text-gray-800'; }
  };

  const handleResolveDispute = () => { console.log('Resolving:', selectedDispute?.id, resolution, resolutionNotes); setShowResolutionDialog(false); setSelectedDispute(null); };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Project Disputes</h1><p className="text-gray-600">Manage and resolve disputes between parties</p></div>
          <Button variant="outline"><Scale className="mr-2 h-4 w-4" />Dispute Guidelines</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><p className="text-sm text-gray-500">Total Disputes</p><p className="text-2xl font-bold">{disputes.length}</p></Card>
          <Card className="p-4 bg-yellow-50"><p className="text-sm text-yellow-600">Pending</p><p className="text-2xl font-bold text-yellow-600">{pendingDisputes.length}</p></Card>
          <Card className="p-4 bg-blue-50"><p className="text-sm text-blue-600">Investigating</p><p className="text-2xl font-bold text-blue-600">{investigatingDisputes.length}</p></Card>
          <Card className="p-4 bg-green-50"><p className="text-sm text-green-600">Resolved</p><p className="text-2xl font-bold text-green-600">{resolvedDisputes.length}</p></Card>
        </div>

        <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search disputes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingDisputes.length})</TabsTrigger>
            <TabsTrigger value="investigating">Investigating ({investigatingDisputes.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedDisputes.length})</TabsTrigger>
            <TabsTrigger value="all">All ({filteredDisputes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingDisputes.map((dispute) => (
              <Card key={dispute.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-red-500" /><h3 className="text-lg font-semibold">{dispute.projectTitle}</h3><Badge className={getPriorityColor(dispute.priority)}>{dispute.priority} priority</Badge></div>
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarImage src={dispute.raisedBy.avatar} /><AvatarFallback>{dispute.raisedBy.name[0]}</AvatarFallback></Avatar><span>Raised by: {dispute.raisedBy.name}</span></div>
                      <div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback>{dispute.against.name[0]}</AvatarFallback></Avatar><span>Against: {dispute.against.name}</span></div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{dispute.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(dispute.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />₹{dispute.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedDispute(dispute)}><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline"><MessageCircle className="h-4 w-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="max-w-3xl">
            {selectedDispute && (
              <>
                <DialogHeader><DialogTitle>Dispute Details</DialogTitle><DialogDescription>Review and manage this dispute</DialogDescription></DialogHeader>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                  <div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">{selectedDispute.projectTitle}</h3><p className="text-sm text-gray-500">ID: {selectedDispute.id}</p></div><div className="flex gap-2"><Badge className={getStatusColor(selectedDispute.status)}>{selectedDispute.status}</Badge><Badge className={getPriorityColor(selectedDispute.priority)}>{selectedDispute.priority}</Badge></div></div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4"><p className="text-sm text-gray-500 mb-2">Raised By</p><div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarImage src={selectedDispute.raisedBy.avatar} /><AvatarFallback>{selectedDispute.raisedBy.name[0]}</AvatarFallback></Avatar><div><p className="font-medium">{selectedDispute.raisedBy.name}</p><Badge variant="skill" size="sm">{selectedDispute.raisedBy.role}</Badge></div></div></Card>
                    <Card className="p-4"><p className="text-sm text-gray-500 mb-2">Against</p><div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarFallback>{selectedDispute.against.name[0]}</AvatarFallback></Avatar><div><p className="font-medium">{selectedDispute.against.name}</p><Badge variant="skill" size="sm">{selectedDispute.against.role}</Badge></div></div></Card>
                  </div>
                  <Card className="p-4"><h4 className="font-medium mb-2">Reason: {selectedDispute.reason}</h4><p className="text-gray-700">{selectedDispute.description}</p></Card>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setSelectedDispute(null)}>Close</Button>
                  <Button onClick={() => setShowResolutionDialog(true)}><Scale className="mr-2 h-4 w-4" />Resolve Dispute</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showResolutionDialog} onOpenChange={setShowResolutionDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Resolve Dispute</DialogTitle><DialogDescription>Choose a resolution</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><label className="block text-sm font-medium mb-1">Resolution</label><select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full rounded-md border p-2"><option value="">Select...</option><option value="refund">Full Refund</option><option value="partial-refund">Partial Refund</option><option value="release-payment">Release Payment</option><option value="dismiss">Dismiss</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Notes</label><Textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Explain reasoning..." rows={4} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowResolutionDialog(false)}>Cancel</Button><Button onClick={handleResolveDispute}>Confirm</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}