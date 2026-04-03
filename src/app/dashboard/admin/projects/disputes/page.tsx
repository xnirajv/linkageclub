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
  AlertTriangle,
  Search,
  Clock,
  MessageCircle,
  Eye,
  Scale,
  FileText,
  Calendar,
  DollarSign,
} from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';

interface Dispute {
  id: string;
  projectId: string;
  projectTitle: string;
  raisedBy: {
    id: string;
    name: string;
    role: 'student' | 'company';
    avatar: string;
  };
  against: {
    id: string;
    name: string;
    role: 'student' | 'company';
  };
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  amount: number;
  createdAt: string;
  updatedAt: string;
  evidence?: string[];
  messages?: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
  }[];
}

export default function DisputesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Mock data - replace with actual API
  const disputes: Dispute[] = [
    {
      id: '1',
      projectId: 'p1',
      projectTitle: 'E-commerce Platform Development',
      raisedBy: {
        id: 's1',
        name: 'Riya Sharma',
        role: 'student',
        avatar: '/avatars/riya.jpg',
      },
      against: {
        id: 'c1',
        name: 'TechCorp',
        role: 'company',
      },
      reason: 'Payment Dispute',
      description: `Client has not released payment for completed milestone. I submitted the work 5 days ago but they haven't approved or responded.`,
      status: 'pending',
      priority: 'high',
      amount: 15000,
      createdAt: '2024-02-10',
      updatedAt: '2024-02-10',
      evidence: ['/evidence/screenshot1.png', '/evidence/chat-log.pdf'],
      messages: [
        {
          id: 'm1',
          userId: 's1',
          content: 'I need help with this payment issue.',
          createdAt: '2024-02-10T10:00:00',
        },
      ],
    },
    {
      id: '2',
      projectId: 'p2',
      projectTitle: 'Mobile App Design',
      raisedBy: {
        id: 'c2',
        name: 'DesignStudio',
        role: 'company',
        avatar: '/avatars/designstudio.jpg',
      },
      against: {
        id: 's2',
        name: 'Amit Kumar',
        role: 'student',
      },
      reason: 'Quality Issue',
      description: 'Delivered work does not match the requirements specified in the project brief. Multiple revisions requested but issues persist.',
      status: 'investigating',
      priority: 'medium',
      amount: 25000,
      createdAt: '2024-02-09',
      updatedAt: '2024-02-11',
    },
    {
      id: '3',
      projectId: 'p3',
      projectTitle: 'Backend API Development',
      raisedBy: {
        id: 's3',
        name: 'Priya Patel',
        role: 'student',
        avatar: '/avatars/priya.jpg',
      },
      against: {
        id: 'c3',
        name: 'StartupX',
        role: 'company',
      },
      reason: 'Scope Creep',
      description: 'Client keeps adding new requirements without adjusting budget. Original scope was clearly defined but they expect additional features for free.',
      status: 'resolved',
      priority: 'low',
      amount: 40000,
      createdAt: '2024-02-05',
      updatedAt: '2024-02-08',
    },
  ];

  const filteredDisputes = disputes.filter(dispute =>
    dispute.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispute.raisedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dispute.against.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingDisputes = filteredDisputes.filter(d => d.status === 'pending');
  const investigatingDisputes = filteredDisputes.filter(d => d.status === 'investigating');
  const resolvedDisputes = filteredDisputes.filter(d => d.status === 'resolved');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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

  const handleResolveDispute = () => {
    console.log('Resolving dispute:', selectedDispute?.id, { resolution, resolutionNotes });
    setShowResolutionDialog(false);
    setSelectedDispute(null);
    // API call to resolve dispute
  };

  const handleAssignToTeam = (disputeId: string) => {
    console.log('Assign dispute to team:', disputeId);
  };

  const handleContactParties = (disputeId: string) => {
    console.log('Contact parties for dispute:', disputeId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Project Disputes</h1>
            <p className="text-charcoal-600">Manage and resolve disputes between parties</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Scale className="mr-2 h-4 w-4" />
              Dispute Guidelines
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Disputes</p>
            <p className="text-2xl font-bold">{disputes.length}</p>
          </Card>
          <Card className="p-4 bg-yellow-50">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingDisputes.length}</p>
          </Card>
          <Card className="p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Investigating</p>
            <p className="text-2xl font-bold text-blue-600">{investigatingDisputes.length}</p>
          </Card>
          <Card className="p-4 bg-green-50">
            <p className="text-sm text-green-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{resolvedDisputes.length}</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search disputes by project or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingDisputes.length})</TabsTrigger>
            <TabsTrigger value="investigating">Investigating ({investigatingDisputes.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedDisputes.length})</TabsTrigger>
            <TabsTrigger value="all">All ({filteredDisputes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                onView={() => setSelectedDispute(dispute)}
                onAssign={() => handleAssignToTeam(dispute.id)}
                onContact={() => handleContactParties(dispute.id)}
              />
            ))}
          </TabsContent>

          <TabsContent value="investigating" className="space-y-4">
            {investigatingDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                onView={() => setSelectedDispute(dispute)}
                onAssign={() => handleAssignToTeam(dispute.id)}
                onContact={() => handleContactParties(dispute.id)}
              />
            ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                onView={() => setSelectedDispute(dispute)}
                resolved
              />
            ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                onView={() => setSelectedDispute(dispute)}
                onAssign={() => handleAssignToTeam(dispute.id)}
                onContact={() => handleContactParties(dispute.id)}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Dispute Detail Modal */}
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="max-w-3xl">
            {selectedDispute && (
              <>
                <DialogHeader>
                  <DialogTitle>Dispute Details</DialogTitle>
                  <DialogDescription>
                    Review and manage this dispute
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Dispute Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedDispute.projectTitle}</h3>
                      <p className="text-sm text-charcoal-500">Dispute ID: {selectedDispute.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(selectedDispute.status)}>
                        {selectedDispute.status}
                      </Badge>
                      <Badge className={getPriorityColor(selectedDispute.priority)}>
                        {selectedDispute.priority} priority
                      </Badge>
                    </div>
                  </div>

                  {/* Parties Involved */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <p className="text-sm text-charcoal-500 mb-2">Raised By</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedDispute.raisedBy.avatar} />
                          <AvatarFallback>{selectedDispute.raisedBy.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedDispute.raisedBy.name}</p>
                          <Badge variant="skill" size="sm">
                            {selectedDispute.raisedBy.role}
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <p className="text-sm text-charcoal-500 mb-2">Against</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{selectedDispute.against.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedDispute.against.name}</p>
                          <Badge variant="skill" size="sm">
                            {selectedDispute.against.role}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Dispute Details */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Reason: {selectedDispute.reason}</h4>
                    <p className="text-charcoal-700">{selectedDispute.description}</p>
                  </Card>

                  {/* Evidence */}
                  {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Evidence</h4>
                      <div className="space-y-2">
                        {selectedDispute.evidence.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-charcoal-400" />
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Timeline */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-charcoal-400" />
                        <span>Created: {new Date(selectedDispute.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-charcoal-400" />
                        <span>Last Updated: {new Date(selectedDispute.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Messages */}
                  {selectedDispute.messages && selectedDispute.messages.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Communication</h4>
                      <div className="space-y-3">
                        {selectedDispute.messages.map((msg) => (
                          <div key={msg.id} className="flex gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{msg.userId[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs text-charcoal-500">
                                {new Date(msg.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setSelectedDispute(null)}>
                    Close
                  </Button>
                  <Button variant="outline" onClick={() => handleContactParties(selectedDispute.id)}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Parties
                  </Button>
                  <Button onClick={() => setShowResolutionDialog(true)}>
                    <Scale className="mr-2 h-4 w-4" />
                    Resolve Dispute
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Resolution Dialog */}
        <Dialog open={showResolutionDialog} onOpenChange={setShowResolutionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Dispute</DialogTitle>
              <DialogDescription>
                Choose a resolution and provide notes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                >
                  <option value="">Select resolution...</option>
                  <option value="refund">Full Refund to Client</option>
                  <option value="partial-refund">Partial Refund</option>
                  <option value="release-payment">Release Payment to Freelancer</option>
                  <option value="dismiss">Dismiss Dispute</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resolution Notes</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain the reasoning behind this resolution..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResolutionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleResolveDispute}>
                Confirm Resolution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Dispute Card Component
function DisputeCard({ dispute, onView, onAssign, onContact, resolved = false }: any) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
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
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-lg font-semibold">{dispute.projectTitle}</h3>
            <Badge className={getPriorityColor(dispute.priority)}>
              {dispute.priority} priority
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={dispute.raisedBy.avatar} />
                <AvatarFallback>{dispute.raisedBy.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">
                <span className="text-charcoal-500">Raised by:</span> {dispute.raisedBy.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{dispute.against.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">
                <span className="text-charcoal-500">Against:</span> {dispute.against.name}
              </span>
            </div>
          </div>

          <p className="text-sm text-charcoal-700 mb-3 line-clamp-2">{dispute.description}</p>

          <div className="flex items-center gap-4 text-sm text-charcoal-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(dispute.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              ₹{dispute.amount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          {!resolved && (
            <>
              <Button size="sm" variant="outline" onClick={onAssign}>
                Assign
              </Button>
              <Button size="sm" variant="outline" onClick={onContact}>
                <MessageCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}