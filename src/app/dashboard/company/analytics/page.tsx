'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { useApplications } from '@/hooks/useApplications';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Target, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Rocket,
  Crown,
  ThumbsUp,
  Activity,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const COLORS = ['#344A86', '#C2964B', '#407794', '#A3A3A3', '#4B4945', '#E1DDD6'];

export default function CompanyAnalyticsPage() {
  const router = useRouter();
  
  const { projects = [], isLoading: projectsLoading } = useProjects({});
  const { applications = [], isLoading: applicationsLoading } = useApplications({ role: 'company' });

  if (projectsLoading || applicationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto" />
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="mt-4 text-charcoal-600 dark:text-charcoal-400 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeApplications = Array.isArray(applications) ? applications : [];

  // Calculate metrics
  const totalProjects = safeProjects.length;
  const totalApplications = safeApplications.length;
  const acceptedCount = safeApplications.filter(a => a?.status === 'accepted').length;
  const pendingCount = safeApplications.filter(a => a?.status === 'pending').length;
  const shortlistedCount = safeApplications.filter(a => a?.status === 'shortlisted').length;
  const rejectedCount = safeApplications.filter(a => a?.status === 'rejected').length;
  const hiringRate = totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0;
  const activeProjects = safeProjects.filter(p => p?.status === 'open' || p?.status === 'in_progress').length;
  
  // Mock growth data (can be replaced with real API data)
  const growthData = {
    projects: { value: 12, isPositive: true },
    applications: { value: 23, isPositive: true },
    hiringRate: { value: 5, isPositive: true },
    active: { value: 8, isPositive: true }
  };

  // Project status distribution
  const projectStatusData = [
    { name: 'Open', value: safeProjects.filter(p => p?.status === 'open').length, color: '#344A86' },
    { name: 'In Progress', value: safeProjects.filter(p => p?.status === 'in_progress').length, color: '#407794' },
    { name: 'Completed', value: safeProjects.filter(p => p?.status === 'completed').length, color: '#C2964B' },
    { name: 'Cancelled', value: safeProjects.filter(p => p?.status === 'cancelled').length, color: '#4B4945' },
  ].filter(item => item.value > 0);

  // Application status distribution
  const applicationStatusData = [
    { name: 'Pending', value: pendingCount, color: '#C2964B' },
    { name: 'Reviewed', value: safeApplications.filter(a => a?.status === 'reviewed').length, color: '#344A86' },
    { name: 'Shortlisted', value: shortlistedCount, color: '#407794' },
    { name: 'Interview', value: safeApplications.filter(a => a?.status === 'interview_scheduled').length, color: '#A3A3A3' },
    { name: 'Accepted', value: acceptedCount, color: '#344A86' },
    { name: 'Rejected', value: rejectedCount, color: '#4B4945' },
  ].filter(item => item.value > 0);

  // Monthly applications data (mock for now)
  const monthlyData = [
    { month: 'Jan', applications: 12, hires: 2 },
    { month: 'Feb', applications: 19, hires: 3 },
    { month: 'Mar', applications: 15, hires: 4 },
    { month: 'Apr', applications: 22, hires: 5 },
    { month: 'May', applications: 28, hires: 6 },
    { month: 'Jun', applications: 25, hires: 5 },
  ];

  // Skills demand data
  const skillsData = [
    { name: 'React', count: 45 },
    { name: 'Node.js', count: 38 },
    { name: 'Python', count: 32 },
    { name: 'TypeScript', count: 28 },
    { name: 'MongoDB', count: 25 },
  ];

  // Hiring funnel data
  const funnelData = [
    { stage: 'Total Applications', count: totalApplications, color: '#344A86' },
    { stage: 'Shortlisted', count: shortlistedCount, color: '#407794' },
    { stage: 'Interviewed', count: safeApplications.filter(a => a?.interview?.scheduled).length, color: '#A3A3A3' },
    { stage: 'Hired', count: acceptedCount, color: '#C2964B' },
  ].filter(item => item.count > 0);

  return (
    <div className="app-shell min-h-screen">
      {/* Premium Background Pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-info-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-600 to-info-600 blur-lg opacity-50" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-info-600 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-charcoal-950 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
                  Track your hiring performance and trends
                </p>
              </div>
            </div>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-charcoal-100 dark:bg-charcoal-800/50 rounded-2xl p-1">
              {['Week', 'Month', 'Year'].map((range) => (
                <button
                  key={range}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    range === 'Month'
                      ? 'bg-card dark:bg-charcoal-700 shadow-md text-primary-600 dark:text-primary-400'
                      : 'text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="p-2.5 rounded-xl bg-card dark:bg-charcoal-800 shadow-md hover:shadow-lg transition-all duration-300">
              <Calendar className="h-5 w-5 text-charcoal-600 dark:text-charcoal-400" />
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { 
              label: 'Total Projects', 
              value: totalProjects, 
              icon: Briefcase, 
              color: 'blue',
              growth: growthData.projects,
              prefix: ''
            },
            { 
              label: 'Total Applications', 
              value: totalApplications, 
              icon: Users, 
              color: 'purple',
              growth: growthData.applications,
              prefix: ''
            },
            { 
              label: 'Hiring Rate', 
              value: hiringRate, 
              icon: Target, 
              color: 'green',
              growth: growthData.hiringRate,
              prefix: '',
              suffix: '%'
            },
            { 
              label: 'Active Projects', 
              value: activeProjects, 
              icon: Rocket, 
              color: 'amber',
              growth: growthData.active,
              prefix: ''
            },
          ].map((stat, i) => {
            const colorMap = {
              blue: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600',
              purple: 'bg-secondary-50 dark:bg-secondary-950/40 text-secondary-600',
              green: 'bg-info-50 dark:bg-info-950/40 text-info-600',
              amber: 'bg-charcoal-100 dark:bg-charcoal-800/70 text-charcoal-700 dark:text-charcoal-300',
            };
            
            return (
              <Card key={i} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card dark:bg-charcoal-900/80 backdrop-blur-sm">
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${colorMap[stat.color].split(' ')[0]} rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700`} />
                <div className="relative p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${colorMap[stat.color]} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      stat.growth.isPositive 
                        ? 'bg-info-100 dark:bg-info-950/50 text-info-700 dark:text-info-400' 
                        : 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300'
                    }`}>
                      {stat.growth.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.growth.value}%
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-charcoal-950 dark:text-white tracking-tight">
                    {stat.value}{stat.suffix || ''}
                  </p>
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1 font-medium">{stat.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Premium Employer Badge Section */}
        <div className="mb-8">
          <div className="rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-500/10 via-info-500/10 to-secondary-500/10 p-6 backdrop-blur-sm dark:border-primary-800/50 dark:from-primary-950/30 dark:via-info-950/20 dark:to-secondary-950/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 p-3 shadow-lg">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal-950 dark:text-white">Premium Employer</h3>
                  <p className="text-charcoal-600 dark:text-charcoal-400 text-sm">You&apos;re in the top 5% of employers on our platform</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">Top 5%</p>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Ranking</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-5 w-5 fill-current text-info-500" />
                    <p className="text-2xl font-bold text-info-600 dark:text-info-400">4.9</p>
                  </div>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Employer Rating</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-primary-200 text-primary-600 hover:bg-primary-50 dark:border-primary-800"
                  onClick={() => router.push('/dashboard/company/applications')}
                >
                  Review Applications
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-charcoal-100 dark:bg-charcoal-800/50 p-1 rounded-2xl">
            <TabsTrigger 
              value="overview" 
              className="rounded-xl data-[state=active]:bg-card dark:data-[state=active]:bg-charcoal-700 data-[state=active]:shadow-md px-6 py-2.5"
            >
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className="rounded-xl data-[state=active]:bg-card dark:data-[state=active]:bg-charcoal-700 data-[state=active]:shadow-md px-6 py-2.5"
            >
              <Users className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger 
              value="skills" 
              className="rounded-xl data-[state=active]:bg-card dark:data-[state=active]:bg-charcoal-700 data-[state=active]:shadow-md px-6 py-2.5"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Skills Demand
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Applications Chart */}
              <Card className="border-0 shadow-xl overflow-hidden bg-card dark:bg-charcoal-900/80 backdrop-blur-sm">
                <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-950/50">
                        <TrendingUp className="h-4 w-4 text-primary-600" />
                      </div>
                      <h3 className="font-semibold text-charcoal-950 dark:text-white">Monthly Applications</h3>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-info-600 dark:text-info-400">
                      <TrendingUp className="h-3 w-3" />
                      +23% vs last month
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#CDC8C0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            backgroundColor: 'white'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="applications" 
                          stroke="#344A86" 
                          strokeWidth={3}
                          dot={{ fill: '#344A86', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="hires" 
                          stroke="#407794" 
                          strokeWidth={3}
                          dot={{ fill: '#407794', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              {/* Project Status Distribution */}
              <Card className="border-0 shadow-xl overflow-hidden bg-card dark:bg-charcoal-900/80 backdrop-blur-sm">
                <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-secondary-100 p-1.5 dark:bg-secondary-950/50">
                      <PieChartIcon className="h-4 w-4 text-secondary-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-950 dark:text-white">Project Status Distribution</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => 
                            percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                          }
                          outerRadius={100}
                          fill="#344A86"
                          dataKey="value"
                        >
                          {projectStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Status Distribution */}
              <Card className="border-0 shadow-xl overflow-hidden bg-card dark:bg-charcoal-900/80 backdrop-blur-sm">
                <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-950/50">
                      <Users className="h-4 w-4 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-950 dark:text-white">Application Status</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={applicationStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => 
                            percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                          }
                          outerRadius={100}
                          fill="#407794"
                          dataKey="value"
                        >
                          {applicationStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>

              {/* Conversion Funnel */}
              <Card className="border-0 shadow-xl overflow-hidden bg-card dark:bg-charcoal-900/80 backdrop-blur-sm">
                <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-info-100 p-1.5 dark:bg-info-950/50">
                      <Target className="h-4 w-4 text-info-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-950 dark:text-white">Hiring Funnel</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="stage" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#344A86" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills">
            <Card className="border-0 shadow-xl overflow-hidden bg-card dark:bg-charcoal-900/80 backdrop-blur-sm">
              <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-secondary-100 p-1.5 dark:bg-secondary-950/50">
                      <TrendingUp className="h-4 w-4 text-secondary-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal-950 dark:text-white">Most In-Demand Skills</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillsData} layout="vertical" margin={{ left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#407794" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Applications Table */}
        {safeApplications.length > 0 && (
          <Card className="mt-6 border-0 shadow-xl overflow-hidden bg-card dark:bg-charcoal-900/80 backdrop-blur-sm">
            <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60 dark:bg-charcoal-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-950/50">
                    <Activity className="h-4 w-4 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal-950 dark:text-white">Recent Applications</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-600"
                  onClick={() => router.push('/dashboard/company/applications')}
                >
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-charcoal-100/50 dark:bg-charcoal-800/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Project/Job</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Applicant</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Type</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-800">
                  {safeApplications.slice(0, 5).map((app) => {
                    const title = app.type === 'project' 
                      ? app.projectId?.title 
                      : app.jobId?.title;
                    
                    const statusColors = {
                      pending: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-950/50 dark:text-secondary-400',
                      reviewed: 'bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400',
                      shortlisted: 'bg-info-100 text-info-700 dark:bg-info-950/50 dark:text-info-400',
                      interview_scheduled: 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-300',
                      accepted: 'bg-info-100 text-info-700 dark:bg-info-950/50 dark:text-info-400',
                      rejected: 'bg-charcoal-200 text-charcoal-900 dark:bg-charcoal-800 dark:text-charcoal-300',
                      withdrawn: 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-400',
                    };
                    
                    return (
                      <tr key={app._id} className="hover:bg-charcoal-100/50 dark:hover:bg-charcoal-800/50 transition-colors cursor-pointer">
                        <td className="py-4 px-6 text-sm text-charcoal-600 dark:text-charcoal-400">
                          {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-charcoal-950 dark:text-white">
                          {title || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-sm text-charcoal-600 dark:text-charcoal-400">
                          {app.applicantId?.name || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-sm capitalize text-charcoal-600 dark:text-charcoal-400">
                          {app.type || 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusColors[app.status as keyof typeof statusColors] || statusColors.pending
                          }`}>
                            {app.status?.replace('_', ' ') || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {safeApplications.length === 0 && safeProjects.length === 0 && (
          <Card className="p-12 text-center border-0 shadow-xl bg-card dark:bg-charcoal-900/80 backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-charcoal-400" />
            </div>
            <p className="text-charcoal-500 dark:text-charcoal-400 font-medium">No analytics data available yet</p>
            <p className="text-xs text-charcoal-400 dark:text-charcoal-400 mt-1">Start posting projects to see your analytics</p>
            <Button variant="outline" size="sm" className="mt-4 rounded-xl" asChild>
              <Link href="/dashboard/company/post-project">
                Post Your First Project
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
