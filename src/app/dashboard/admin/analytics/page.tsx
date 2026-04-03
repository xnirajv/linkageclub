'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '../../layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/forms/Select';

// ==================== Types ====================
interface UserGrowthItem {
  month: string;
  students: number;
  companies: number;
  mentors: number;
  founders: number;
}

interface RevenueItem {
  month: string;
  revenue: number;
  fees: number;
}

interface MetricItem {
  name: string;
  value: number;
}

interface EngagementItem {
  day: string;
  pageViews: number;
  sessions: number;
  users: number;
}

interface TopSkill {
  name: string;
  count: number;
  growth: string;
}

interface LocationItem {
  location: string;
  users: number;
}

interface AnalyticsData {
  userGrowth: UserGrowthItem[];
  revenue: RevenueItem[];
  projectMetrics: MetricItem[];
  jobMetrics: MetricItem[];
  engagement: EngagementItem[];
  topSkills: TopSkill[];
  locations: LocationItem[];
}

// ==================== Mock Data (Replace with API calls) ====================
const MOCK_USER_GROWTH: UserGrowthItem[] = [
  { month: 'Jan', students: 1200, companies: 45, mentors: 32, founders: 18 },
  { month: 'Feb', students: 1350, companies: 52, mentors: 38, founders: 22 },
  { month: 'Mar', students: 1500, companies: 58, mentors: 45, founders: 25 },
  { month: 'Apr', students: 1800, companies: 65, mentors: 52, founders: 28 },
  { month: 'May', students: 2100, companies: 72, mentors: 58, founders: 32 },
  { month: 'Jun', students: 2500, companies: 80, mentors: 65, founders: 35 },
];

const MOCK_REVENUE: RevenueItem[] = [
  { month: 'Jan', revenue: 450000, fees: 45000 },
  { month: 'Feb', revenue: 520000, fees: 52000 },
  { month: 'Mar', revenue: 580000, fees: 58000 },
  { month: 'Apr', revenue: 650000, fees: 65000 },
  { month: 'May', revenue: 720000, fees: 72000 },
  { month: 'Jun', revenue: 850000, fees: 85000 },
];

const MOCK_PROJECT_METRICS: MetricItem[] = [
  { name: 'Web Dev', value: 145 },
  { name: 'Mobile', value: 98 },
  { name: 'AI/ML', value: 112 },
  { name: 'Data Science', value: 75 },
  { name: 'DevOps', value: 62 },
  { name: 'Design', value: 84 },
];

const MOCK_JOB_METRICS: MetricItem[] = [
  { name: 'Full-time', value: 234 },
  { name: 'Part-time', value: 56 },
  { name: 'Internship', value: 89 },
  { name: 'Contract', value: 45 },
  { name: 'Remote', value: 167 },
];

const MOCK_ENGAGEMENT: EngagementItem[] = [
  { day: 'Mon', pageViews: 12500, sessions: 3450, users: 2800 },
  { day: 'Tue', pageViews: 13200, sessions: 3600, users: 2950 },
  { day: 'Wed', pageViews: 14100, sessions: 3800, users: 3100 },
  { day: 'Thu', pageViews: 13800, sessions: 3750, users: 3050 },
  { day: 'Fri', pageViews: 12900, sessions: 3550, users: 2900 },
  { day: 'Sat', pageViews: 8900, sessions: 2450, users: 2100 },
  { day: 'Sun', pageViews: 7800, sessions: 2150, users: 1850 },
];

const MOCK_TOP_SKILLS: TopSkill[] = [
  { name: 'React', count: 1234, growth: '+15%' },
  { name: 'Node.js', count: 987, growth: '+12%' },
  { name: 'Python', count: 876, growth: '+18%' },
  { name: 'TypeScript', count: 765, growth: '+25%' },
  { name: 'MongoDB', count: 654, growth: '+8%' },
  { name: 'AWS', count: 543, growth: '+20%' },
];

const MOCK_LOCATIONS: LocationItem[] = [
  { location: 'Bangalore', users: 3450 },
  { location: 'Mumbai', users: 2800 },
  { location: 'Delhi NCR', users: 2650 },
  { location: 'Pune', users: 1850 },
  { location: 'Hyderabad', users: 1650 },
  { location: 'Chennai', users: 1450 },
];

const COLORS = ['#344A86', '#C2964B', '#407794', '#A3A3A3', '#4B4945', '#E1DDD6'];

// ==================== Custom Hooks ====================
const useAnalyticsData = (dateRange: string): AnalyticsData => {
  const [data, setData] = useState<AnalyticsData>({
    userGrowth: [],
    revenue: [],
    projectMetrics: [],
    jobMetrics: [],
    engagement: [],
    topSkills: [],
    locations: [],
  });
  
  const [, setLoading] = useState(true);
  const [, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In production, replace with actual API call
        // const response = await fetch(`/api/analytics?range=${dateRange}`);
        // const result = await response.json();
        
        // Mock data with dateRange filter simulation
        let filteredUserGrowth = [...MOCK_USER_GROWTH];
        let filteredRevenue = [...MOCK_REVENUE];
        
        // Simulate filtering based on dateRange
        if (dateRange === '30d') {
          filteredUserGrowth = MOCK_USER_GROWTH.slice(-2);
          filteredRevenue = MOCK_REVENUE.slice(-2);
        } else if (dateRange === '3m') {
          filteredUserGrowth = MOCK_USER_GROWTH.slice(-3);
          filteredRevenue = MOCK_REVENUE.slice(-3);
        } else if (dateRange === '6m') {
          filteredUserGrowth = MOCK_USER_GROWTH;
          filteredRevenue = MOCK_REVENUE;
        }

        setData({
          userGrowth: filteredUserGrowth,
          revenue: filteredRevenue,
          projectMetrics: MOCK_PROJECT_METRICS,
          jobMetrics: MOCK_JOB_METRICS,
          engagement: MOCK_ENGAGEMENT,
          topSkills: MOCK_TOP_SKILLS,
          locations: MOCK_LOCATIONS,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]); // dateRange is now used as a dependency

  return data;
};

// ==================== Helper Functions ====================
const calculateGrowth = (current: number, previous: number): string => {
  if (previous === 0) return '0';
  return ((current - previous) / previous * 100).toFixed(1);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ==================== Component ====================
export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('6m');
  
  // Fetch data based on date range
  const {
    userGrowth,
    revenue,
    projectMetrics,
    jobMetrics,
    engagement,
    topSkills,
    locations,
  } = useAnalyticsData(dateRange);

  // Calculate metrics using useMemo for performance
  const metrics = useMemo(() => {
    // Handle empty data case
    if (userGrowth.length === 0 || revenue.length === 0) {
      return {
        totalUsers: 0,
        userGrowth: '0',
        totalRevenue: 0,
        revenueGrowth: '0',
        activeProjects: 0,
        projectGrowth: '0',
        engagementRate: 0,
        engagementGrowth: '0',
      };
    }

    const lastMonth = userGrowth[userGrowth.length - 1];
    const firstMonth = userGrowth[0];
    
    const totalUsers = lastMonth.students + lastMonth.companies + 
                      lastMonth.mentors + lastMonth.founders;
    
    const firstMonthTotal = firstMonth.students + firstMonth.companies + 
                           firstMonth.mentors + firstMonth.founders;
    
    const lastRevenue = revenue[revenue.length - 1].revenue;
    const firstRevenue = revenue[0].revenue;

    return {
      totalUsers,
      userGrowth: calculateGrowth(totalUsers, firstMonthTotal),
      totalRevenue: lastRevenue,
      revenueGrowth: calculateGrowth(lastRevenue, firstRevenue),
      activeProjects: 234, // This would come from API
      projectGrowth: '+12%',
      engagementRate: 78,
      engagementGrowth: '+5%',
    };
  }, [userGrowth, revenue]);

  // Show loading state if needed
  if (userGrowth.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-charcoal-600">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Platform Analytics</h1>
            <p className="text-charcoal-600">Comprehensive insights and metrics</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers.toLocaleString()}
            growth={metrics.userGrowth}
            icon={Users}
            iconColor="blue"
          />
          <MetricCard
            title="Active Projects"
            value={metrics.activeProjects.toString()}
            growth={metrics.projectGrowth}
            icon={Briefcase}
            iconColor="green"
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            growth={metrics.revenueGrowth}
            icon={DollarSign}
            iconColor="purple"
          />
          <MetricCard
            title="Engagement Rate"
            value={`${metrics.engagementRate}%`}
            growth={metrics.engagementGrowth}
            icon={TrendingUp}
            iconColor="orange"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects & Jobs</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab
              userGrowth={userGrowth}
              revenue={revenue}
              projectMetrics={projectMetrics}
              jobMetrics={jobMetrics}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersTab
              locations={locations}
              topSkills={topSkills}
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <ProjectsTab />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueTab revenue={revenue} />
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <EngagementTab engagement={engagement} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// ==================== Subcomponents ====================

interface MetricCardProps {
  title: string;
  value: string;
  growth: string;
  icon: React.ElementType;
  iconColor: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  growth, 
  icon: Icon, 
  iconColor 
}) => {
  const colorClasses = {
    blue: 'bg-primary-100 text-primary-700',
    green: 'bg-info-100 text-info-700',
    purple: 'bg-secondary-100 text-secondary-700',
    orange: 'bg-charcoal-100 text-charcoal-700',
  };

  const isPositive = !growth.startsWith('-');

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-charcoal-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[iconColor]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-2 flex items-center text-sm">
        {isPositive ? (
          <TrendingUp className="mr-1 h-4 w-4 text-info-600" />
        ) : (
          <TrendingDown className="mr-1 h-4 w-4 text-charcoal-600" />
        )}
        <span className={isPositive ? 'text-info-700' : 'text-charcoal-700'}>
          {growth}%
        </span>
        <span className="text-charcoal-500 ml-1">vs last period</span>
      </div>
    </Card>
  );
};

interface OverviewTabProps {
  userGrowth: UserGrowthItem[];
  revenue: RevenueItem[];
  projectMetrics: MetricItem[];
  jobMetrics: MetricItem[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  userGrowth,
  revenue,
  projectMetrics,
  jobMetrics,
}) => (
  <>
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">User Growth</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="students" stroke="#344A86" />
            <Line type="monotone" dataKey="companies" stroke="#407794" />
            <Line type="monotone" dataKey="mentors" stroke="#C2964B" />
            <Line type="monotone" dataKey="founders" stroke="#A3A3A3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>

    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1" 
              stroke="#344A86" 
              fill="#344A86" 
              fillOpacity={0.3} 
            />
            <Area 
              type="monotone" 
              dataKey="fees" 
              stackId="1" 
              stroke="#407794" 
              fill="#407794" 
              fillOpacity={0.3} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PieChartCard 
        title="Projects by Category" 
        data={projectMetrics} 
        colors={COLORS}
      />
      <PieChartCard 
        title="Jobs by Type" 
        data={jobMetrics} 
        colors={COLORS}
      />
    </div>
  </>
);

interface PieChartCardProps {
  title: string;
  data: MetricItem[];
  colors: string[];
}

const PieChartCard: React.FC<PieChartCardProps> = ({ title, data, colors }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

interface UsersTabProps {
  locations: LocationItem[];
  topSkills: TopSkill[];
}

const UsersTab: React.FC<UsersTabProps> = ({ locations, topSkills }) => (
  <>
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">User Distribution by Location</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={locations} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="location" />
            <Tooltip />
            <Bar dataKey="users" fill="#344A86" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>

    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top Skills on Platform</h3>
      <div className="space-y-4">
        {topSkills.map((skill, index) => (
          <SkillBar key={index} skill={skill} maxCount={1500} />
        ))}
      </div>
    </Card>
  </>
);

interface SkillBarProps {
  skill: TopSkill;
  maxCount: number;
}

const SkillBar: React.FC<SkillBarProps> = ({ skill, maxCount }) => (
  <div className="flex items-center">
    <span className="w-32 text-sm font-medium">{skill.name}</span>
    <div className="flex-1 mx-4">
      <div className="h-2 bg-charcoal-100 rounded-full">
        <div
          className="h-2 bg-primary-600 rounded-full"
          style={{ width: `${(skill.count / maxCount) * 100}%` }}
        />
      </div>
    </div>
    <span className="w-20 text-sm font-medium text-right">{skill.count}</span>
    <span className="w-16 text-xs text-info-700 text-right">{skill.growth}</span>
  </div>
);

const ProjectsTab: React.FC = () => (
  <>
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Project Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard label="Open" value="156" color="green" />
        <StatusCard label="In Progress" value="89" color="blue" />
        <StatusCard label="Completed" value="234" color="purple" />
        <StatusCard label="Cancelled" value="23" color="yellow" />
      </div>
    </Card>

    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Job Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard label="Published" value="312" color="green" />
        <StatusCard label="Filled" value="89" color="blue" />
        <StatusCard label="Draft" value="45" color="gray" />
        <StatusCard label="Closed" value="34" color="red" />
      </div>
    </Card>
  </>
);

interface StatusCardProps {
  label: string;
  value: string;
  color: 'green' | 'blue' | 'purple' | 'yellow' | 'gray' | 'red';
}

const StatusCard: React.FC<StatusCardProps> = ({ label, value, color }) => {
  const colorClasses = {
    green: 'bg-info-50 text-info-700',
    blue: 'bg-primary-50 text-primary-700',
    purple: 'bg-secondary-50 text-secondary-700',
    yellow: 'bg-secondary-100 text-secondary-800',
    gray: 'bg-charcoal-100 text-charcoal-700',
    red: 'bg-charcoal-100 text-charcoal-700',
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <p className="text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

interface RevenueTabProps {
  revenue: RevenueItem[];
}

const RevenueTab: React.FC<RevenueTabProps> = ({ revenue }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenue}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#C2964B" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

interface EngagementTabProps {
  engagement: EngagementItem[];
}

const EngagementTab: React.FC<EngagementTabProps> = ({ engagement }) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Daily Engagement</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={engagement}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pageViews" stroke="#344A86" />
          <Line type="monotone" dataKey="sessions" stroke="#407794" />
          <Line type="monotone" dataKey="users" stroke="#C2964B" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
