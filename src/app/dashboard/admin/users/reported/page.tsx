'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Flag,
  Search,
  Eye,
  CheckCircle,
  Shield,
  Ban,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/format';
import DashboardLayout from '@/app/dashboard/layout';
import { Input } from '@/components/ui/input';

// Mock data - replace with actual API
const reportedUsers = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatars/john.jpg',
    role: 'student',
    trustScore: 23,
    reports: [
      {
        id: 'r1',
        reason: 'Harassment',
        description: 'User was sending inappropriate messages',
        reportedBy: {
          id: 'u2',
          name: 'Riya Sharma',
        },
        context: {
          type: 'message',
          preview: 'You are so stupid...',
        },
        reportedAt: '2024-02-15T10:30:00',
        status: 'pending',
      },
      {
        id: 'r2',
        reason: 'Spam',
        description: 'Posting promotional content in comments',
        reportedBy: {
          id: 'u3',
          name: 'Amit Kumar',
        },
        context: {
          type: 'comment',
          preview: 'Check out my website for free money...',
        },
        reportedAt: '2024-02-14T14:20:00',
        status: 'pending',
      },
    ],
    reportCount: 2,
    previousWarnings: 1,
    joinedAt: '2024-01-10',
    lastActive: '2024-02-15T09:00:00',
  },
  {
    id: 'u4',
    name: 'SpamUser',
    email: 'spam@example.com',
    avatar: '/avatars/spam.jpg',
    role: 'student',
    trustScore: 5,
    reports: [
      {
        id: 'r3',
        reason: 'Spam',
        description: 'Posting spam links in multiple posts',
        reportedBy: {
          id: 'u5',
          name: 'Priya Patel',
        },
        context: {
          type: 'post',
          preview: 'Earn ₹50,000 per month working from home! Click here...',
        },
        reportedAt: '2024-02-13T09:15:00',
        status: 'pending',
      },
      {
        id: 'r4',
        reason: 'Scam',
        description: 'Promoting fraudulent investment scheme',
        reportedBy: {
          id: 'u6',
          name: 'Rahul Mehta',
        },
        context: {
          type: 'message',
          preview: 'Invest ₹10,000 and get ₹1,00,000 in 1 week!',
        },
        reportedAt: '2024-02-12T16:45:00',
        status: 'pending',
      },
      {
        id: 'r5',
        reason: 'Fake profile',
        description: 'Using fake identity and profile picture',
        reportedBy: {
          id: 'u7',
          name: 'Neha Singh',
        },
        context: {
          type: 'profile',
          preview: 'Profile picture appears to be stock photo',
        },
        reportedAt: '2024-02-11T11:30:00',
        status: 'pending',
      },
    ],
    reportCount: 3,
    previousWarnings: 2,
    joinedAt: '2024-02-01',
    lastActive: '2024-02-15T08:00:00',
  },
  {
    id: 'u8',
    name: 'TrollAccount',
    email: 'troll@example.com',
    avatar: '/avatars/troll.jpg',
    role: 'mentor',
    trustScore: 30,
    reports: [
      {
        id: 'r6',
        reason: 'Harassment',
        description: 'Bullying other users in comments',
        reportedBy: {
          id: 'u9',
          name: 'Vikram Singh',
        },
        context: {
          type: 'comment',
          preview: 'Your code is garbage, you should quit programming...',
        },
        reportedAt: '2024-02-10T10:00:00',
        status: 'pending',
      },
      {
        id: 'r7',
        reason: 'Inappropriate content',
        description: 'Sharing offensive memes',
        reportedBy: {
          id: 'u10',
          name: 'Anjali Gupta',
        },
        context: {
          type: 'post',
          preview: '[Image] offensive content',
        },
        reportedAt: '2024-02-09T14:30:00',
        status: 'pending',
      },
    ],
    reportCount: 2,
    previousWarnings: 0,
    joinedAt: '2024-01-15',
    lastActive: '2024-02-14T18:00:00',
  },
];

export default function ReportedUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'warn' | 'ban' | 'delete' | 'dismiss' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [banDuration, setBanDuration] = useState('7');

  const filteredUsers = reportedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (user: any, action: 'warn' | 'ban' | 'delete' | 'dismiss') => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionDialog(true);
  };

  const handleConfirmAction = () => {
    console.log('Action:', {
      userId: selectedUser?.id,
      action: actionType,
      reason: actionReason,
      banDuration: actionType === 'ban' ? banDuration : undefined,
    });
    setShowActionDialog(false);
    setSelectedUser(null);
    setActionReason('');
  };

  const getPriorityLevel = (reportCount: number, previousWarnings: number) => {
    const total = reportCount + previousWarnings;
    if (total >= 5) return 'critical';
    if (total >= 3) return 'high';
    if (total >= 2) return 'medium';
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
          <h1 className="text-2xl font-bold text-charcoal-950">Reported Users</h1>
          <p className="text-charcoal-600">Review and moderate reported user accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Reported</p>
            <p className="text-2xl font-bold">{reportedUsers.length}</p>
          </Card>
          <Card className="p-4 bg-red-50">
            <p className="text-sm text-red-600">Critical</p>
            <p className="text-2xl font-bold text-red-600">
              {reportedUsers.filter(u => getPriorityLevel(u.reportCount, u.previousWarnings) === 'critical').length}
            </p>
          </Card>
          <Card className="p-4 bg-orange-50">
            <p className="text-sm text-orange-600">High Priority</p>
            <p className="text-2xl font-bold text-orange-600">
              {reportedUsers.filter(u => getPriorityLevel(u.reportCount, u.previousWarnings) === 'high').length}
            </p>
          </Card>
          <Card className="p-4 bg-yellow-50">
            <p className="text-sm text-yellow-600">Previous Warnings</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reportedUsers.reduce((sum, u) => sum + u.previousWarnings, 0)}
            </p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search reported users..."
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
            {filteredUsers.map((user) => {
              const priority = getPriorityLevel(user.reportCount, user.previousWarnings);
              return (
                <Card key={user.id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                          <Flag className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{user.name}</h3>
                            <Badge className={getPriorityColor(priority)}>
                              {priority.toUpperCase()} PRIORITY
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-charcoal-600">{user.email}</span>
                            <Badge variant="skill" size="sm">
                              {user.role}
                            </Badge>
                            <Badge variant={user.trustScore > 70 ? 'success' : 'error'} size="sm">
                              Trust: {user.trustScore}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge variant="error">{user.reportCount} Reports</Badge>
                    </div>

                    {/* User Stats */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-charcoal-500">Joined</p>
                        <p className="font-medium">{new Date(user.joinedAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-charcoal-500">Last Active</p>
                        <p className="font-medium">{formatRelativeTime(user.lastActive)}</p>
                      </div>
                      <div>
                        <p className="text-charcoal-500">Previous Warnings</p>
                        <p className="font-medium text-yellow-600">{user.previousWarnings}</p>
                      </div>
                    </div>

                    {/* Reports List */}
                    <div className="bg-red-50 rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium text-red-800">Reports</p>
                      {user.reports.map((report: any) => (
                        <div key={report.id} className="space-y-2 border-l-2 border-red-300 pl-3">
                          <div className="flex items-start justify-between">
                            <p className="font-medium text-sm">{report.reason}</p>
                            <span className="text-xs text-charcoal-500">
                              {formatRelativeTime(report.reportedAt)}
                            </span>
                          </div>
                          <p className="text-xs text-charcoal-600">{report.description}</p>
                          {report.context && (
                            <div className="bg-card p-2 rounded text-xs">
                              <span className="font-medium">Context ({report.context.type}):</span>
                              <p className="text-charcoal-600 mt-1 italic">"{report.context.preview}"</p>
                            </div>
                          )}
                          <p className="text-xs text-charcoal-500">
                            Reported by: {report.reportedBy.name}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/admin/users/${user.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(user, 'warn')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Send Warning
                      </Button>
                      <Button size="sm" variant="outline" className="text-yellow-600" onClick={() => handleAction(user, 'ban')}>
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleAction(user, 'delete')}>
                        <UserX className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleAction(user, 'dismiss')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Dismiss
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
                {actionType === 'warn' && 'Send Warning'}
                {actionType === 'ban' && 'Ban User'}
                {actionType === 'delete' && 'Delete Account'}
                {actionType === 'dismiss' && 'Dismiss Reports'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'warn' && 'This will send a warning to the user.'}
                {actionType === 'ban' && 'This will restrict the user from accessing the platform.'}
                {actionType === 'delete' && 'This will permanently delete the user account. This action cannot be undone.'}
                {actionType === 'dismiss' && 'This will dismiss all reports and mark them as resolved.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedUser && (
                <div className="p-3 bg-charcoal-100/50 rounded-lg">
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-charcoal-600">{selectedUser.email}</p>
                </div>
              )}

              {actionType === 'ban' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Ban Duration</label>
                  <select
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="permanent">Permanent</option>
                  </select>
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