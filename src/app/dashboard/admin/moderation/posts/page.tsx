'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface ReportedPost {
  id: string;
  title: string;
  content: string;
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
  category: string;
  tags: string[];
  likes: number;
  comments: number;
}

type ModerationAction = 'hide' | 'show' | 'delete' | 'warn';

export default function ModerationPostsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<ReportedPost | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'hide' | 'show' | 'delete' | 'warn' | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Mock data - replace with actual API
  const reportedPosts: ReportedPost[] = [
    {
      id: '1',
      title: 'How to hack Instagram accounts?',
      content: 'I found a way to hack Instagram...',
      author: {
        id: 'u1',
        name: 'Hacker123',
        avatar: '/avatars/hacker.jpg',
        trustScore: 12,
      },
      reports: [
        {
          id: 'r1',
          reason: 'Inappropriate content',
          reportedBy: { id: 'u2', name: 'Riya Sharma' },
          createdAt: '2024-02-15T10:30:00',
        },
        {
          id: 'r2',
          reason: 'Against community guidelines',
          reportedBy: { id: 'u3', name: 'Amit Kumar' },
          createdAt: '2024-02-15T11:45:00',
        },
        {
          id: 'r3',
          reason: 'Spam',
          reportedBy: { id: 'u4', name: 'Priya Patel' },
          createdAt: '2024-02-15T14:20:00',
        },
      ],
      reportCount: 3,
      status: 'active',
      createdAt: '2024-02-15T09:00:00',
      category: 'General',
      tags: ['hacking', 'instagram'],
      likes: 0,
      comments: 2,
    },
    {
      id: '2',
      title: 'Looking for collaborators for ML project',
      content: 'We are building an AI that can predict stock market...',
      author: {
        id: 'u5',
        name: 'ML_Enthusiast',
        avatar: '/avatars/ml.jpg',
        trustScore: 85,
      },
      reports: [
        {
          id: 'r4',
          reason: 'Suspicious activity',
          reportedBy: { id: 'u6', name: 'Rahul Mehta' },
          createdAt: '2024-02-14T16:15:00',
        },
      ],
      reportCount: 1,
      status: 'active',
      createdAt: '2024-02-14T10:00:00',
      category: 'Projects',
      tags: ['machine-learning', 'collaboration'],
      likes: 15,
      comments: 8,
    },
    {
      id: '3',
      title: 'Get rich quick scheme - 100% guaranteed!',
      content: 'Invest ₹10,000 and get ₹1,00,000 in 1 week...',
      author: {
        id: 'u7',
        name: 'RichQuick',
        avatar: '/avatars/rich.jpg',
        trustScore: 5,
      },
      reports: [
        {
          id: 'r5',
          reason: 'Scam',
          reportedBy: { id: 'u8', name: 'Neha Singh' },
          createdAt: '2024-02-13T09:20:00',
        },
        {
          id: 'r6',
          reason: 'Fraudulent',
          reportedBy: { id: 'u9', name: 'Vikram Singh' },
          createdAt: '2024-02-13T10:30:00',
        },
        {
          id: 'r7',
          reason: 'Spam',
          reportedBy: { id: 'u10', name: 'Anjali Gupta' },
          createdAt: '2024-02-13T11:45:00',
        },
        {
          id: 'r8',
          reason: 'Misleading',
          reportedBy: { id: 'u11', name: 'Raj Patel' },
          createdAt: '2024-02-13T14:20:00',
        },
      ],
      reportCount: 4,
      status: 'active',
      createdAt: '2024-02-13T08:00:00',
      category: 'General',
      tags: ['money', 'investment'],
      likes: 0,
      comments: 5,
    },
  ];

  const filteredPosts = reportedPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModerate = (post: ReportedPost, action: 'hide' | 'show' | 'delete' | 'warn') => {
    setSelectedPost(post);
    setActionType(action);
    setShowActionDialog(true);
  };

  const handleConfirmAction = () => {
    console.log('Moderation action:', {
      postId: selectedPost?.id,
      action: actionType,
      reason: actionReason,
    });
    setShowActionDialog(false);
    setSelectedPost(null);
    setActionReason('');
    // API call to perform moderation
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'hidden':
        return <Badge variant="warning">Hidden</Badge>;
      case 'deleted':
        return <Badge variant="error">Deleted</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950">Moderate Posts</h1>
          <p className="text-charcoal-600">Review and moderate reported community posts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Reported</p>
            <p className="text-2xl font-bold">{reportedPosts.length}</p>
          </Card>
          <Card className="p-4 bg-yellow-50">
            <p className="text-sm text-yellow-600">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reportedPosts.filter(p => p.status === 'active').length}
            </p>
          </Card>
          <Card className="p-4 bg-red-50">
            <p className="text-sm text-red-600">High Priority</p>
            <p className="text-2xl font-bold text-red-600">
              {reportedPosts.filter(p => p.reportCount >= 3).length}
            </p>
          </Card>
          <Card className="p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Unique Reporters</p>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search reported posts..."
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
            {filteredPosts.map((post) => (
              <ModerationPostCard
                key={post.id}
                post={post}
                onModerate={(action: ModerationAction) => handleModerate(post, action)}
                statusBadge={getStatusBadge(post.status)}
              />
            ))}
          </TabsContent>

          <TabsContent value="high" className="space-y-4">
            {filteredPosts
              .filter(p => p.reportCount >= 3)
              .map((post) => (
                <ModerationPostCard
                  key={post.id}
                  post={post}
                  onModerate={(action : ModerationAction) => handleModerate(post, action)}
                  statusBadge={getStatusBadge(post.status)}
                />
              ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredPosts
              .filter(p => p.status === 'active')
              .map((post) => (
                <ModerationPostCard
                  key={post.id}
                  post={post}
                  onModerate={(action : ModerationAction) => handleModerate(post, action)}
                  statusBadge={getStatusBadge(post.status)}
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
                {actionType === 'hide' && 'Hide Post'}
                {actionType === 'show' && 'Show Post'}
                {actionType === 'delete' && 'Delete Post'}
                {actionType === 'warn' && 'Warn User'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'hide' && 'This will hide the post from public view. The user can still see it.'}
                {actionType === 'show' && 'This will make the post visible again.'}
                {actionType === 'delete' && 'This will permanently delete the post. This action cannot be undone.'}
                {actionType === 'warn' && 'Send a warning to the user about this post.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedPost && (
                <div className="p-3 bg-charcoal-100/50 rounded-lg">
                  <p className="font-medium mb-1">{selectedPost.title}</p>
                  <p className="text-sm text-charcoal-600 line-clamp-2">{selectedPost.content}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Reason for action</label>
                <Input
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason..."
                />
              </div>

              {actionType === 'warn' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Warning message</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
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

// Moderation Post Card Component
function ModerationPostCard({ post, onModerate, statusBadge }: any) {
  const [expanded, setExpanded] = useState(false);

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
                <h3 className="font-semibold">{post.title}</h3>
                {statusBadge}
              </div>
              <p className="text-sm text-charcoal-600 line-clamp-2">{post.content}</p>
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
              <DropdownMenuItem onClick={() => setExpanded(!expanded)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onModerate('hide')}>
                <Lock className="mr-2 h-4 w-4" />
                Hide Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModerate('show')}>
                <Unlock className="mr-2 h-4 w-4" />
                Show Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModerate('warn')}>
                <Shield className="mr-2 h-4 w-4" />
                Warn User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onModerate('delete')} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{post.author.name}</span>
          <Badge variant={post.author.trustScore > 70 ? 'success' : 'error'} size="sm">
            Trust: {post.author.trustScore}%
          </Badge>
          <span className="text-xs text-charcoal-500">
            <Clock className="inline h-3 w-3 mr-1" />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Reports */}
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-sm font-medium text-red-800 mb-2">
            {post.reportCount} Report{post.reportCount > 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {post.reports.slice(0, expanded ? undefined : 2).map((report: any) => (
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
            {post.reports.length > 2 && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="text-xs text-red-600 hover:underline mt-1"
              >
                + {post.reports.length - 2} more reports
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-charcoal-500">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {post.comments} comments
          </span>
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.category}
          </span>
          <div className="flex gap-1">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="skill" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
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