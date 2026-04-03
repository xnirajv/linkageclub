'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Flag,
  Search,
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2,
  MessageSquare,
  User,
  Clock,
  MoreVertical,
  Shield,
  Lock,
  Unlock,
  Link2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/app/dashboard/layout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReportedComment {
  id: string;
  content: string;
  postId: string;
  postTitle: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    trustScore: number;
  };
  reports: {
    id: string;
    reason: string;
    reportedBy: {
      id: string;
      name: string;
    };
    createdAt: string;
  }[];
  reportCount: number;
  status: 'active' | 'hidden' | 'deleted';
  createdAt: string;
  likes: number;
  replies: number;
}

interface Report {
  id: string;
  reason: string;
  reportedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

type ModerationAction = 'hide' | 'show' | 'delete' | 'warn';

export default function ModerationCommentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComment, setSelectedComment] = useState<ReportedComment | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<ModerationAction | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  // Mock data - replace with actual API
  const reportedComments: ReportedComment[] = [
    {
      id: 'c1',
      content: 'This is complete garbage. You don\'t know what you\'re talking about.',
      postId: 'p1',
      postTitle: 'How to learn React in 2024',
      author: {
        id: 'u1',
        name: 'TrollUser',
        avatar: '/avatars/troll.jpg',
        trustScore: 23,
      },
      reports: [
        {
          id: 'r1',
          reason: 'Harassment',
          reportedBy: { id: 'u2', name: 'Riya Sharma' },
          createdAt: '2024-02-15T10:30:00',
        },
        {
          id: 'r2',
          reason: 'Bullying',
          reportedBy: { id: 'u3', name: 'Amit Kumar' },
          createdAt: '2024-02-15T11:45:00',
        },
      ],
      reportCount: 2,
      status: 'active',
      createdAt: '2024-02-15T09:00:00',
      likes: 0,
      replies: 0,
    },
    {
      id: 'c2',
      content: 'Click here to get free money!!! http://scam-link.com',
      postId: 'p2',
      postTitle: 'Investment tips for beginners',
      author: {
        id: 'u4',
        name: 'Scammer123',
        avatar: '/avatars/scammer.jpg',
        trustScore: 5,
      },
      reports: [
        {
          id: 'r3',
          reason: 'Spam',
          reportedBy: { id: 'u5', name: 'Priya Patel' },
          createdAt: '2024-02-14T16:15:00',
        },
        {
          id: 'r4',
          reason: 'Phishing',
          reportedBy: { id: 'u6', name: 'Rahul Mehta' },
          createdAt: '2024-02-14T17:20:00',
        },
        {
          id: 'r5',
          reason: 'Scam',
          reportedBy: { id: 'u7', name: 'Neha Singh' },
          createdAt: '2024-02-14T18:30:00',
        },
      ],
      reportCount: 3,
      status: 'active',
      createdAt: '2024-02-14T15:00:00',
      likes: 0,
      replies: 1,
    },
    {
      id: 'c3',
      content: 'You should use TypeScript instead. It provides better type safety.',
      postId: 'p3',
      postTitle: 'JavaScript vs TypeScript',
      author: {
        id: 'u8',
        name: 'DevExpert',
        avatar: '/avatars/devexpert.jpg',
        trustScore: 92,
      },
      reports: [
        {
          id: 'r6',
          reason: 'Disagreement',
          reportedBy: { id: 'u9', name: 'John Doe' },
          createdAt: '2024-02-13T09:20:00',
        },
      ],
      reportCount: 1,
      status: 'active',
      createdAt: '2024-02-13T08:00:00',
      likes: 15,
      replies: 3,
    },
    {
      id: 'c4',
      content: 'Your startup idea is stupid and will never work.',
      postId: 'p4',
      postTitle: 'Need feedback on my startup idea',
      author: {
        id: 'u10',
        name: 'Hater',
        avatar: '/avatars/hater.jpg',
        trustScore: 30,
      },
      reports: [
        {
          id: 'r7',
          reason: 'Toxicity',
          reportedBy: { id: 'u11', name: 'Vikram Singh' },
          createdAt: '2024-02-12T14:20:00',
        },
        {
          id: 'r8',
          reason: 'Discouragement',
          reportedBy: { id: 'u12', name: 'Anjali Gupta' },
          createdAt: '2024-02-12T15:30:00',
        },
      ],
      reportCount: 2,
      status: 'active',
      createdAt: '2024-02-12T13:00:00',
      likes: 0,
      replies: 2,
    },
  ];

  const filteredComments = reportedComments.filter(comment =>
    comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.postTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModerate = (comment: ReportedComment, action: ModerationAction) => {
    setSelectedComment(comment);
    setActionType(action);
    setActionReason('');
    setWarningMessage('');
    setShowActionDialog(true);
  };

  const handleConfirmAction = () => {
    console.log('Moderation action:', {
      commentId: selectedComment?.id,
      action: actionType,
      reason: actionReason,
      warningMessage: actionType === 'warn' ? warningMessage : undefined,
    });
    setShowActionDialog(false);
    setSelectedComment(null);
    setActionReason('');
    setWarningMessage('');
    // API call to perform moderation
  };

  const handleViewPost = (postId: string) => {
    // Navigate to post
    console.log('View post:', postId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'hidden':
        return <Badge variant="warning">Hidden</Badge>;
      case 'deleted':
        return <Badge variant="error">Deleted</Badge>; // Changed from 'destructive' to 'error'
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950">Moderate Comments</h1>
          <p className="text-charcoal-600">Review and moderate reported comments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Reported</p>
            <p className="text-2xl font-bold">{reportedComments.length}</p>
          </Card>
          <Card className="p-4 bg-yellow-50">
            <p className="text-sm text-yellow-600">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reportedComments.filter(c => c.status === 'active').length}
            </p>
          </Card>
          <Card className="p-4 bg-red-50">
            <p className="text-sm text-red-600">High Priority</p>
            <p className="text-2xl font-bold text-red-600">
              {reportedComments.filter(c => c.reportCount >= 3).length}
            </p>
          </Card>
          <Card className="p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Unique Reporters</p>
            <p className="text-2xl font-bold text-blue-600">8</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search reported comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="high">High Priority (3+ reports)</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredComments.map((comment) => (
              <ModerationCommentCard
                key={comment.id}
                comment={comment}
                onModerate={(action: ModerationAction) => handleModerate(comment, action)}
                onViewPost={() => handleViewPost(comment.postId)}
                statusBadge={getStatusBadge(comment.status)}
              />
            ))}
          </TabsContent>

          <TabsContent value="high" className="space-y-4">
            {filteredComments
              .filter(c => c.reportCount >= 3)
              .map((comment) => (
                <ModerationCommentCard
                  key={comment.id}
                  comment={comment}
                  onModerate={(action: ModerationAction) => handleModerate(comment, action)}
                  onViewPost={() => handleViewPost(comment.postId)}
                  statusBadge={getStatusBadge(comment.status)}
                />
              ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredComments
              .filter(c => c.status === 'active')
              .map((comment) => (
                <ModerationCommentCard
                  key={comment.id}
                  comment={comment}
                  onModerate={(action: ModerationAction) => handleModerate(comment, action)}
                  onViewPost={() => handleViewPost(comment.postId)}
                  statusBadge={getStatusBadge(comment.status)}
                />
              ))}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <Card className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Resolved Reports</h3>
              <p className="text-charcoal-500">Resolved reports will appear here</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Moderation Action Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'hide' && 'Hide Comment'}
                {actionType === 'show' && 'Show Comment'}
                {actionType === 'delete' && 'Delete Comment'}
                {actionType === 'warn' && 'Warn User'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'hide' && 'This will hide the comment from public view.'}
                {actionType === 'show' && 'This will make the comment visible again.'}
                {actionType === 'delete' && 'This will permanently delete the comment. This action cannot be undone.'}
                {actionType === 'warn' && 'Send a warning to the user about this comment.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedComment && (
                <div className="p-3 bg-charcoal-100/50 rounded-lg">
                  <p className="text-sm text-charcoal-700">{selectedComment.content}</p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    On post: {selectedComment.postTitle}
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="reason" className="block text-sm font-medium mb-1">
                  Reason for action
                </label>
                <Input
                  id="reason"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason..."
                />
              </div>

              {actionType === 'warn' && (
                <div>
                  <label htmlFor="warning" className="block text-sm font-medium mb-1">
                    Warning message
                  </label>
                  <textarea
                    id="warning"
                    rows={3}
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Write warning message to user..."
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                Cancel
              </Button>
              <Button
                variant={
                  actionType === 'delete' ? 'destructive' :
                  actionType === 'warn' ? 'default' :
                  'default'
                }
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

// Moderation Comment Card Component
interface ModerationCommentCardProps {
  comment: ReportedComment;
  onModerate: (action: ModerationAction) => void;
  onViewPost: () => void;
  statusBadge: React.ReactNode;
}

function ModerationCommentCard({ comment, onModerate, onViewPost, statusBadge }: ModerationCommentCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <Flag className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">Comment by {comment.author.name}</h3>
                {statusBadge}
              </div>
              <p className="text-sm text-charcoal-700 bg-charcoal-100/50 p-2 rounded">
                {comment.content}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onViewPost}>
                <Eye className="mr-2 h-4 w-4" />
                View Post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onModerate('hide')}>
                <Lock className="mr-2 h-4 w-4" />
                Hide Comment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModerate('show')}>
                <Unlock className="mr-2 h-4 w-4" />
                Show Comment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModerate('warn')}>
                <Shield className="mr-2 h-4 w-4" />
                Warn User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onModerate('delete')} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Comment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Context */}
        <div className="flex items-center gap-2 text-sm text-charcoal-600 bg-charcoal-100/50 p-2 rounded">
          <Link2 className="h-4 w-4" />
          <span>On post:</span>
          <button
            onClick={onViewPost}
            className="text-primary-600 hover:underline"
          >
            {comment.postTitle}
          </button>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{comment.author.name}</span>
          <Badge variant={comment.author.trustScore > 70 ? 'success' : 'error'}>
            Trust: {comment.author.trustScore}%
          </Badge>
          <span className="text-xs text-charcoal-500">
            <Clock className="inline h-3 w-3 mr-1" />
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Reports */}
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-sm font-medium text-red-800 mb-2">
            {comment.reportCount} Report{comment.reportCount > 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {comment.reports.map((report: Report) => (
              <div key={report.id} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">{report.reason}</span>
                  <span className="text-xs text-charcoal-500 ml-2">
                    by {report.reportedBy.name} • {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-charcoal-500">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {comment.replies} replies
          </span>
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {comment.likes} likes
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="text-red-600" onClick={() => onModerate('hide')}>
            <Lock className="mr-2 h-4 w-4" />
            Hide
          </Button>
          <Button size="sm" variant="outline" className="text-yellow-600" onClick={() => onModerate('warn')}>
            <Shield className="mr-2 h-4 w-4" />
            Warn
          </Button>
          <Button size="sm" variant="outline" className="text-green-600" onClick={() => onModerate('show')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button size="sm" variant="outline" className="text-red-600" onClick={() => onModerate('delete')}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}