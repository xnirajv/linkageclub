'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input'; // Fixed import path
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'; // Fixed import path
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  Briefcase,
  Award,
  Users,
} from 'lucide-react'; // Added missing imports
import DashboardLayout from '@/app/dashboard/layout';
import { Textarea } from '@/components/forms/Textarea';

interface RefundRequest {
  id: string;
  transactionId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  amount: number;
  currency: string;
  reason: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  type: 'project' | 'assessment' | 'mentorship' | 'subscription';
  projectId?: string;
  projectTitle?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  evidence?: string[];
}

interface RefundCardProps {
  refund: RefundRequest;
  onProcess?: (action: 'approve' | 'reject') => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getTypeIcon: (type: string) => React.ReactNode;
  readonly?: boolean;
}

export default function RefundsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processAction, setProcessAction] = useState<'approve' | 'reject' | null>(null);
  const [processNotes, setProcessNotes] = useState('');

  // Mock data - replace with actual API
  const refundRequests: RefundRequest[] = [
    {
      id: 'ref1',
      transactionId: 'TXN240215001',
      user: {
        id: 'u1',
        name: 'Riya Sharma',
        email: 'riya@example.com',
        avatar: '/avatars/riya.jpg',
      },
      amount: 199,
      currency: 'INR',
      reason: 'Technical Issue',
      description: 'I was unable to complete the assessment due to technical glitches. The questions were not loading properly.',
      status: 'pending',
      type: 'assessment',
      requestedAt: '2024-02-15T10:30:00',
      evidence: ['/evidence/screenshot1.png'],
    },
    {
      id: 'ref2',
      transactionId: 'TXN240214002',
      user: {
        id: 'u2',
        name: 'TechCorp',
        email: 'accounts@techcorp.com',
        avatar: '/avatars/techcorp.jpg',
      },
      amount: 15000,
      currency: 'INR',
      reason: 'Unsatisfied with work',
      description: 'The freelancer did not deliver the work as per requirements. We have tried to resolve with them but no success.',
      status: 'pending',
      type: 'project',
      projectId: 'p1',
      projectTitle: 'E-commerce Platform Development',
      requestedAt: '2024-02-14T14:20:00',
      evidence: ['/evidence/chat-logs.pdf', '/evidence/requirements.pdf'],
    },
    {
      id: 'ref3',
      transactionId: 'TXN240213003',
      user: {
        id: 'u3',
        name: 'Amit Kumar',
        email: 'amit@example.com',
        avatar: '/avatars/amit.jpg',
      },
      amount: 1500,
      currency: 'INR',
      reason: 'Mentor no-show',
      description: 'The mentor did not show up for the scheduled session. I waited for 30 minutes but they never joined.',
      status: 'approved',
      type: 'mentorship',
      requestedAt: '2024-02-13T09:00:00',
      processedAt: '2024-02-14T11:30:00',
      processedBy: 'admin@internhub.com',
      notes: 'Verified with mentor calendar - confirmed no-show. Processing refund.',
    },
    {
      id: 'ref4',
      transactionId: 'TXN240212004',
      user: {
        id: 'u4',
        name: 'Priya Patel',
        email: 'priya@example.com',
        avatar: '/avatars/priya.jpg',
      },
      amount: 499,
      currency: 'INR',
      reason: 'Duplicate charge',
      description: 'I was charged twice for the same subscription. Please refund one of the charges.',
      status: 'rejected',
      type: 'subscription',
      requestedAt: '2024-02-12T16:45:00',
      processedAt: '2024-02-13T10:15:00',
      processedBy: 'admin@internhub.com',
      notes: 'Only one charge found in payment gateway logs. Request rejected.',
    },
    {
      id: 'ref5',
      transactionId: 'TXN240211005',
      user: {
        id: 'u5',
        name: 'Rahul Mehta',
        email: 'rahul@example.com',
        avatar: '/avatars/rahul.jpg',
      },
      amount: 3000,
      currency: 'INR',
      reason: 'Project cancelled',
      description: 'The project was cancelled by mutual agreement before starting.',
      status: 'processed',
      type: 'project',
      projectId: 'p2',
      projectTitle: 'Mobile App Design',
      requestedAt: '2024-02-11T11:20:00',
      processedAt: '2024-02-12T09:30:00',
      processedBy: 'admin@internhub.com',
      notes: 'Refund processed to original payment method.',
    },
  ];

  const filteredRefunds = refundRequests.filter(refund =>
    refund.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    refund.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    refund.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRefunds = filteredRefunds.filter(r => r.status === 'pending');
  const approvedRefunds = filteredRefunds.filter(r => r.status === 'approved');
  const processedRefunds = filteredRefunds.filter(r => r.status === 'processed');
  const rejectedRefunds = filteredRefunds.filter(r => r.status === 'rejected');

  const totalPendingAmount = pendingRefunds.reduce((sum, r) => sum + r.amount, 0);
  const totalProcessedAmount = processedRefunds.reduce((sum, r) => sum + r.amount, 0);

  const handleProcessRefund = (refund: RefundRequest, action: 'approve' | 'reject') => {
    setSelectedRefund(refund);
    setProcessAction(action);
    setShowProcessDialog(true);
  };

  const handleConfirmProcess = () => {
    console.log('Processing refund:', {
      refundId: selectedRefund?.id,
      action: processAction,
      notes: processNotes,
    });
    setShowProcessDialog(false);
    setSelectedRefund(null);
    setProcessNotes('');
    // API call to process refund
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline">Approved</Badge>;
      case 'processed':
        return <Badge variant="success">Processed</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Briefcase className="h-4 w-4" />;
      case 'assessment':
        return <Award className="h-4 w-4" />;
      case 'mentorship':
        return <Users className="h-4 w-4" />;
      case 'subscription':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Refund Management</h1>
            <p className="text-charcoal-600">Process and manage refund requests</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Pending Requests</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingRefunds.length}</p>
            <p className="text-xs text-charcoal-500 mt-1">Amount: ₹{totalPendingAmount.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Approved</p>
            <p className="text-2xl font-bold text-blue-600">{approvedRefunds.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Processed</p>
            <p className="text-2xl font-bold text-green-600">{processedRefunds.length}</p>
            <p className="text-xs text-charcoal-500 mt-1">Amount: ₹{totalProcessedAmount.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{rejectedRefunds.length}</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search refunds by user, transaction ID, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingRefunds.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedRefunds.length})</TabsTrigger>
            <TabsTrigger value="processed">Processed ({processedRefunds.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedRefunds.length})</TabsTrigger>
            <TabsTrigger value="all">All ({filteredRefunds.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRefunds.map((refund) => (
              <RefundCard
                key={refund.id}
                refund={refund}
                onProcess={(action: 'approve' | 'reject') => handleProcessRefund(refund, action)}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
              />
            ))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedRefunds.map((refund) => (
              <RefundCard
                key={refund.id}
                refund={refund}
                onProcess={(action: 'approve' | 'reject') => handleProcessRefund(refund, action)}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
                readonly
              />
            ))}
          </TabsContent>

          <TabsContent value="processed" className="space-y-4">
            {processedRefunds.map((refund) => (
              <RefundCard
                key={refund.id}
                refund={refund}
                onProcess={(action: 'approve' | 'reject') => handleProcessRefund(refund, action)}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
                readonly
              />
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedRefunds.map((refund) => (
              <RefundCard
                key={refund.id}
                refund={refund}
                onProcess={(action: 'approve' | 'reject') => handleProcessRefund(refund, action)}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
                readonly
              />
            ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filteredRefunds.map((refund) => (
              <RefundCard
                key={refund.id}
                refund={refund}
                onProcess={(action: 'approve' | 'reject') => handleProcessRefund(refund, action)}
                getStatusBadge={getStatusBadge}
                getTypeIcon={getTypeIcon}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Process Refund Dialog */}
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {processAction === 'approve' ? 'Approve Refund' : 'Reject Refund'}
              </DialogTitle>
              <DialogDescription>
                {processAction === 'approve'
                  ? 'This will process the refund to the user\'s original payment method.'
                  : 'This will reject the refund request.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedRefund && (
                <div className="p-3 bg-charcoal-100/50 rounded-lg">
                  <p className="font-medium mb-1">Refund Details</p>
                  <p className="text-sm">Transaction: {selectedRefund.transactionId}</p>
                  <p className="text-sm">Amount: ₹{selectedRefund.amount}</p>
                  <p className="text-sm">Reason: {selectedRefund.reason}</p>
                </div>
              )}

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Admin Notes
                </label>
                <Textarea
                  id="notes"
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  placeholder="Add notes about this decision..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={processAction === 'approve' ? 'default' : 'destructive'}
                onClick={handleConfirmProcess}
              >
                {processAction === 'approve' ? 'Approve Refund' : 'Reject Refund'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Refund Card Component
function RefundCard({ 
  refund, 
  onProcess, 
  getStatusBadge, 
  getTypeIcon, 
  readonly = false 
}: RefundCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <RefreshCw className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Refund Request #{refund.id}</h3>
                {getStatusBadge(refund.status)}
              </div>
              <p className="text-sm text-charcoal-600">Transaction: {refund.transactionId}</p>
            </div>
          </div>
          {!readonly && refund.status === 'pending' && onProcess && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-600" 
                onClick={() => onProcess('approve')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600" 
                onClick={() => onProcess('reject')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={refund.user.avatar} />
            <AvatarFallback>{refund.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{refund.user.name}</p>
            <p className="text-sm text-charcoal-500">{refund.user.email}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-charcoal-500">Amount</p>
            <p className="font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-charcoal-400" />
              ₹{refund.amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-charcoal-500">Type</p>
            <p className="font-medium flex items-center gap-1">
              {getTypeIcon(refund.type)}
              <span className="capitalize">{refund.type}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-charcoal-500">Requested</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4 text-charcoal-400" />
              {new Date(refund.requestedAt).toLocaleDateString()}
            </p>
          </div>
          {refund.processedAt && (
            <div>
              <p className="text-xs text-charcoal-500">Processed</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-4 w-4 text-charcoal-400" />
                {new Date(refund.processedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Reason */}
        <div>
          <p className="text-sm font-medium mb-1">Reason: {refund.reason}</p>
          <p className="text-sm text-charcoal-700">{refund.description}</p>
        </div>

        {/* Project Context */}
        {refund.projectTitle && (
          <div className="p-3 bg-charcoal-100/50 rounded-lg">
            <p className="text-sm font-medium mb-1">Project</p>
            <p className="text-sm">{refund.projectTitle}</p>
          </div>
        )}

        {/* Evidence */}
        {refund.evidence && refund.evidence.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              {refund.evidence.length} evidence file(s)
            </button>
            {expanded && (
              <div className="mt-2 space-y-1">
                {refund.evidence.map((file: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="h-3 w-3 text-charcoal-400" />
                    <span>{file}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin Notes */}
        {refund.notes && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium mb-1">Admin Notes</p>
            <p className="text-sm text-charcoal-700">{refund.notes}</p>
            {refund.processedBy && (
              <p className="text-xs text-charcoal-500 mt-1">Processed by: {refund.processedBy}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}