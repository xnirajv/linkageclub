'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Briefcase, DollarSign, Shield, UserPlus, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHero, DashboardMetricGrid, DashboardSection } from '@/components/dashboard/common/PremiumDashboard';
import { Notifications } from '@/components/dashboard/common/Notifications';
import { QuickActions } from '@/components/dashboard/common/QuickActions';
import { RecentActivity } from '@/components/dashboard/common/RecentActivity';
import { TrustScore } from '@/components/dashboard/common/TrustScore';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';

const COLORS = ['#344A86', '#C2964B', '#407794', '#A3A3A3', '#4B4945'];

const userGrowthData = [
  { month: 'Jan', students: 1200, companies: 45, mentors: 32 },
  { month: 'Feb', students: 1350, companies: 52, mentors: 38 },
  { month: 'Mar', students: 1500, companies: 58, mentors: 45 },
  { month: 'Apr', students: 1800, companies: 65, mentors: 52 },
  { month: 'May', students: 2100, companies: 72, mentors: 58 },
  { month: 'Jun', students: 2500, companies: 80, mentors: 65 },
];

const revenueData = [
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 520000 },
  { month: 'Mar', revenue: 580000 },
  { month: 'Apr', revenue: 650000 },
  { month: 'May', revenue: 720000 },
  { month: 'Jun', revenue: 850000 },
];

const projectCategories = [
  { name: 'Web Dev', value: 45 },
  { name: 'Mobile', value: 28 },
  { name: 'AI/ML', value: 32 },
  { name: 'Data Science', value: 25 },
  { name: 'DevOps', value: 18 },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const router = useRouter();

  const metrics = [
    { label: 'Total users', value: '15,234', icon: Users, accent: 'primary' as const, meta: '+12% this month' },
    { label: 'Active projects', value: '234', icon: Briefcase, accent: 'secondary' as const, meta: '+8 active this week' },
    { label: 'Revenue (MTD)', value: '₹8.5L', icon: DollarSign, accent: 'info' as const, meta: '+15% growth' },
    { label: 'Pending verifications', value: '28', icon: Shield, accent: 'charcoal' as const, meta: 'Needs review today' },
    { label: 'Reported content', value: '12', icon: AlertTriangle, accent: 'secondary' as const, meta: 'Moderation queue' },
    { label: 'New signups', value: '89', icon: UserPlus, accent: 'primary' as const, meta: 'Past 24 hours' },
  ];

  const quickActions = [
    { label: 'Manage users', icon: Users, onClick: () => router.push('/dashboard/admin/users') },
    { label: 'Verify users', icon: Shield, onClick: () => router.push('/dashboard/admin/users/pending') },
    { label: 'Moderate content', icon: AlertTriangle, onClick: () => router.push('/dashboard/admin/moderation') },
    { label: 'View payments', icon: DollarSign, onClick: () => router.push('/dashboard/admin/payments') },
  ];

  const activities = [
    {
      id: '1',
      user: { name: 'TechCorp' },
      action: 'New company registered',
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      user: { name: 'User123' },
      action: 'Project reported for inappropriate content',
      timestamp: new Date(Date.now() - 15 * 60000),
    },
    {
      id: '3',
      user: { name: 'System' },
      action: 'Large withdrawal request logged for review',
      timestamp: new Date(Date.now() - 60 * 60000),
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Admin workspace"
        title="Platform command center"
        description="Monitor platform health, moderation, growth, and payouts through a premium operations surface built for clarity."
        actions={[
          { label: 'Manage users', href: '/dashboard/admin/users', variant: 'default' },
          { label: 'Open analytics', href: '/dashboard/admin/analytics' },
        ]}
        stats={[
          { label: 'Users', value: '15.2k' },
          { label: 'Revenue', value: '₹8.5L' },
          { label: 'Alerts', value: '12' },
        ]}
        accent="info"
      />

      <DashboardMetricGrid metrics={metrics} columns={6} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <DashboardSection title="User growth" subtitle="Multi-sided ecosystem growth across students, companies, and mentors.">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid stroke="#CDC8C0" strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="students" stroke="#344A86" />
                  <Line type="monotone" dataKey="companies" stroke="#407794" />
                  <Line type="monotone" dataKey="mentors" stroke="#C2964B" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardSection>

          <DashboardSection title="Monthly revenue" subtitle="A premium high-level read on recent platform revenue movement.">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid stroke="#CDC8C0" strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#C2964B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardSection>
        </div>

        <div className="space-y-6">
          <TrustScore
            score={user?.trustScore || 95}
            trend={5}
            factors={[
              { label: 'Account Age', value: 100, description: 'Platform maturity and operational continuity' },
              { label: 'Verification', value: 100, description: 'Critical channels and admin security posture' },
              { label: 'Activity', value: 95, description: 'Consistent platform-level engagement' },
              { label: 'Reviews', value: 92, description: 'Internal quality and stakeholder confidence' },
            ]}
          />

          <DashboardSection title="Quick actions" subtitle="Fast paths for high-priority operations work.">
            <QuickActions actions={quickActions} title="Admin actions" />
          </DashboardSection>

          <DashboardSection title="Projects by category" subtitle="Where marketplace demand is concentrated right now.">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {projectCategories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DashboardSection>

          <Notifications
            notifications={notifications}
            isLoading={isLoading}
            onMarkAsRead={(id) => {
              void markAsRead(id);
            }}
            onMarkAllAsRead={() => {
              void markAllAsRead();
            }}
            onDelete={(id) => {
              void deleteNotification(id);
            }}
          />

          <DashboardSection title="Recent activity" subtitle="Fresh platform-level activity requiring awareness.">
            <RecentActivity activities={activities} />
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
