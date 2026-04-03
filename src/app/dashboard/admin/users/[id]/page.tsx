'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  Users,
  Star,
  Shield,
  AlertTriangle,
  CheckCircle,
  Ban,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/forms/Textarea';
import DashboardLayout from '@/app/dashboard/layout';

// Mock data - replace with actual API
const userData = {
  id: '1',
  name: 'Riya Sharma',
  email: 'riya@example.com',
  role: 'student',
  avatar: '/avatars/riya.jpg',
  status: 'active',
  verified: true,
  trustScore: 92,
  location: 'Mumbai, India',
  phone: '+91 98765 43210',
  joinedAt: '2024-01-15',
  lastActive: '2024-02-15T10:30:00',
  bio: 'Final year CS student passionate about web development. Looking for internship opportunities in full-stack development.',
  skills: [
    { name: 'React', level: 'advanced', verified: true },
    { name: 'Node.js', level: 'intermediate', verified: true },
    { name: 'MongoDB', level: 'beginner', verified: false },
    { name: 'TypeScript', level: 'intermediate', verified: true },
  ],
  badges: [
    { name: 'React Expert', earnedAt: '2024-01-20' },
    { name: 'Project Star', earnedAt: '2024-02-01' },
  ],
  stats: {
    projectsCompleted: 5,
    totalEarnings: 75000,
    averageRating: 4.8,
    reviewsCount: 12,
    sessionsAttended: 8,
    daysActive: 45,
  },
  activity: [
    { type: 'project', action: 'Applied to E-commerce Platform', date: '2024-02-14' },
    { type: 'assessment', action: 'Completed React Assessment', date: '2024-02-13' },
    { type: 'badge', action: 'Earned React Expert Badge', date: '2024-02-12' },
    { type: 'session', action: 'Attended mentoring session', date: '2024-02-11' },
  ],
  reports: [
    { id: '1', reason: 'Inappropriate behavior', date: '2024-02-10', status: 'pending' },
  ],
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showBanDialog, setShowBanDialog] = React.useState(false);
  const [banReason, setBanReason] = React.useState('');
  const [banDuration, setBanDuration] = React.useState('permanent');

  // In real app, fetch user data based on params.id
  const user = userData;

  const handleVerifyUser = () => {
    console.log('Verify user:', params.id);
    // API call to verify user
  };

  const handleBanUser = () => {
    console.log('Ban user:', params.id, { reason: banReason, duration: banDuration });
    setShowBanDialog(false);
    // API call to ban user
  };

  const handleDeleteUser = () => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log('Delete user:', params.id);
      // API call to delete user
      router.push('/dashboard/admin/users');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-charcoal-100 text-charcoal-900',
    };
    return colors[status as keyof typeof colors] || 'bg-charcoal-100 text-charcoal-900';
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      company: 'bg-purple-100 text-purple-800',
      mentor: 'bg-green-100 text-green-800',
      founder: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role as keyof typeof colors] || 'bg-charcoal-100 text-charcoal-900';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-charcoal-950">User Details</h1>
              <p className="text-charcoal-600">View and manage user information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleVerifyUser}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify User
            </Button>
            <Button variant="outline" className="text-yellow-600" onClick={() => setShowBanDialog(true)}>
              <Ban className="mr-2 h-4 w-4" />
              Ban User
            </Button>
            <Button variant="outline" className="text-red-600" onClick={handleDeleteUser}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </div>
        </div>

        {/* Ban Dialog */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                This will restrict the user from accessing the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ban Duration</label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                >
                  <option value="temporary-7">7 days</option>
                  <option value="temporary-30">30 days</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Ban</label>
                <Textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for banning this user..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBanDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBanUser}>
                Confirm Ban
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Profile Card */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <Badge className={getRoleBadge(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getStatusBadge(user.status)}>
                      {user.status}
                    </Badge>
                    {user.verified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </div>
                  <p className="text-charcoal-600">{user.email}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg">
                    <Shield className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-charcoal-500">Trust Score</p>
                      <p className="text-2xl font-bold text-primary-600">{user.trustScore}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-charcoal-600">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user.joinedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Last active {new Date(user.lastActive).toLocaleDateString()}
                </span>
              </div>

              {user.bio && (
                <p className="mt-4 text-charcoal-700">{user.bio}</p>
              )}
            </div>
          </div>
        </Card>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Projects Completed</p>
            <p className="text-2xl font-bold">{user.stats.projectsCompleted}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Earnings</p>
            <p className="text-2xl font-bold">₹{user.stats.totalEarnings.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Average Rating</p>
            <p className="text-2xl font-bold">{user.stats.averageRating}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Days Active</p>
            <p className="text-2xl font-bold">{user.stats.daysActive}</p>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills & Badges</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-charcoal-400" />
                    <a href={`mailto:${user.email}`} className="text-primary-600 hover:underline">
                      {user.email}
                    </a>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-charcoal-400" />
                      <a href={`tel:${user.phone}`} className="text-charcoal-700">
                        {user.phone}
                      </a>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-charcoal-400" />
                      <span className="text-charcoal-700">{user.location}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Verification Status */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-600">Email Verified</span>
                    {user.verified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-600">Phone Verified</span>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-600">ID Verified</span>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Skills</h3>
                <div className="space-y-4">
                  {user.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="skill" size="sm" className="ml-2">
                          {skill.level}
                        </Badge>
                      </div>
                      {skill.verified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Badges */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Badges</h3>
                <div className="grid grid-cols-2 gap-4">
                  {user.badges.map((badge, index) => (
                    <div key={index} className="text-center p-3 border rounded-lg">
                      <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className="text-xs text-charcoal-500">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {user.activity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                    <div className="p-2 bg-charcoal-100 rounded-full">
                      {item.type === 'project' && <Briefcase className="h-4 w-4" />}
                      {item.type === 'assessment' && <Award className="h-4 w-4" />}
                      {item.type === 'badge' && <Star className="h-4 w-4" />}
                      {item.type === 'session' && <Users className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-charcoal-500">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reports Against User</h3>
              {user.reports.length > 0 ? (
                <div className="space-y-4">
                  {user.reports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-medium">Report #{report.id}</span>
                        </div>
                        <Badge variant="warning">{report.status}</Badge>
                      </div>
                      <p className="text-sm text-charcoal-700 mb-2">{report.reason}</p>
                      <p className="text-xs text-charcoal-500">
                        Reported on {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-charcoal-500 py-4">No reports against this user</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}