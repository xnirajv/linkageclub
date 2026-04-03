'use client';

import Link from 'next/link';
import React from 'react';
import { Award, BarChart3, Briefcase, Calendar, DollarSign, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyAnalyticsProps {
  data?: {
    applicationsByMonth?: Array<{ month: string; count: number }>;
    applicantsByStatus?: Array<{ status: string; count: number }>;
    jobPerformance?: Array<{ title: string; views: number; applications: number }>;
    conversionRate?: number;
    avgTimeToHire?: number;
    totalHires?: number;
    totalRevenue?: number;
  };
}

const COLORS = ['#344A86', '#C2964B', '#407794', '#A3A3A3', '#4B4945', '#E1DDD6'];

const KPI_CONFIG = [
  {
    label: 'Total Hires',
    icon: Award,
    valueKey: 'totalHires',
    change: '+12%',
    cardClass: 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/40 dark:to-primary-900/20',
    iconClass: 'text-primary-700',
    changeClass: 'text-info-700',
  },
  {
    label: 'Conversion Rate',
    icon: TrendingUp,
    valueKey: 'conversionRate',
    change: '+5%',
    cardClass: 'bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-950/40 dark:to-secondary-900/20',
    iconClass: 'text-secondary-700',
    changeClass: 'text-info-700',
  },
  {
    label: 'Avg Time to Hire',
    icon: Calendar,
    valueKey: 'avgTimeToHire',
    change: '-2 days',
    cardClass: 'bg-gradient-to-br from-info-50 to-info-100 dark:from-info-950/40 dark:to-info-900/20',
    iconClass: 'text-info-700',
    changeClass: 'text-charcoal-700',
  },
  {
    label: 'Total Revenue',
    icon: DollarSign,
    valueKey: 'totalRevenue',
    change: '+18%',
    cardClass: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-charcoal-950/50 dark:to-gray-800/40',
    iconClass: 'text-charcoal-700',
    changeClass: 'text-info-700',
  },
] as const;

export function CompanyAnalytics({ data = {} }: CompanyAnalyticsProps) {
  const {
    applicationsByMonth = [],
    applicantsByStatus = [],
    jobPerformance = [],
    conversionRate = 0,
    avgTimeToHire = 0,
    totalHires = 0,
    totalRevenue = 0,
  } = data;

  const metricValues = {
    totalHires,
    conversionRate: `${conversionRate}%`,
    avgTimeToHire: `${avgTimeToHire} days`,
    totalRevenue: `${new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(totalRevenue / 1000)}K`,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="bg-gradient-to-r from-charcoal-900 to-primary-700 bg-clip-text text-2xl font-bold text-transparent md:text-3xl dark:from-white dark:to-gray-300">
          Analytics Dashboard
        </h1>
        <p className="mt-1 flex items-center gap-2 text-charcoal-500 dark:text-charcoal-400">
          <BarChart3 className="h-4 w-4" />
          Track your hiring performance and metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CONFIG.map(({ label, icon: Icon, valueKey, change, cardClass, iconClass, changeClass }) => (
          <Card
            key={label}
            className={`group overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${cardClass}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-charcoal-950 dark:text-white">{metricValues[valueKey]}</p>
                  <p className={`mt-1 text-xs ${changeClass}`}>{change} from last month</p>
                </div>
                <div className="rounded-xl bg-card/50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-card/10">
                  <Icon className={`h-6 w-6 ${iconClass}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {applicationsByMonth.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-charcoal-100 bg-charcoal-100/60 dark:border-charcoal-800">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              Applications Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicationsByMonth}>
                  <CartesianGrid stroke="#CDC8C0" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Line
                    activeDot={{ r: 6 }}
                    dataKey="count"
                    dot={{ fill: '#344A86', strokeWidth: 2, r: 4 }}
                    stroke="#344A86"
                    strokeWidth={3}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {applicantsByStatus.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-charcoal-100 bg-charcoal-100/60 dark:border-charcoal-800">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary-600" />
                Pipeline Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={applicantsByStatus}
                      dataKey="count"
                      label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                      nameKey="status"
                      outerRadius={80}
                    >
                      {applicantsByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {jobPerformance.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-charcoal-100 bg-charcoal-100/60 dark:border-charcoal-800">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-600" />
                Job Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobPerformance} layout="vertical" margin={{ left: 100 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="title" tick={{ fontSize: 12 }} type="category" width={100} />
                    <Tooltip />
                    <Bar barSize={20} dataKey="applications" fill="#407794" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {applicationsByMonth.length === 0 && applicantsByStatus.length === 0 && (
        <Card className="border-0 p-12 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-charcoal-100 dark:bg-charcoal-800">
            <TrendingUp className="h-10 w-10 text-charcoal-400" />
          </div>
          <p className="text-muted-foreground">No analytics data available yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Start posting projects to see your analytics</p>
          <Button asChild className="mt-4" size="sm" variant="outline">
            <Link href="/dashboard/company/post-project">Post Your First Project</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
