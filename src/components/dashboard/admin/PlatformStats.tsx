'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, FolderOpen, DollarSign, TrendingUp, UserCheck } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface PlatformStatsProps {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    totalJobs: number;
    activeJobs: number;
    totalProjects: number;
    activeProjects: number;
    totalRevenue: number;
    monthlyRevenue: number;
    verifiedUsers: number;
    activeSessions: number;
    userGrowth?: Array<{ month: string; users: number }>;
    revenueData?: Array<{ month: string; revenue: number }>;
  };
}

export function PlatformStats({ stats }: PlatformStatsProps) {
  const cards = [
    { label: 'Total Users', value: stats.totalUsers?.toLocaleString(), icon: Users, color: 'bg-blue-100', iconColor: 'text-blue-600', change: stats.newUsersThisMonth },
    { label: 'Active Jobs', value: stats.activeJobs?.toLocaleString(), icon: Briefcase, color: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Active Projects', value: stats.activeProjects?.toLocaleString(), icon: FolderOpen, color: 'bg-purple-100', iconColor: 'text-purple-600' },
    { label: 'Monthly Revenue', value: `₹${(stats.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    { label: 'Verified Users', value: stats.verifiedUsers?.toLocaleString(), icon: UserCheck, color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-orange-100', iconColor: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  {card.change && (
                    <span className="text-xs text-success-600 font-medium">+{card.change} this month</span>
                  )}
                </div>
                <p className="text-2xl font-bold">{card.value || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {stats.userGrowth && (
        <Card>
          <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#344A86" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.revenueData && (
        <Card>
          <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#C2964B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
