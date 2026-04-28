'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Briefcase, DollarSign, Eye, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';

export default function AnalyticsPage() {
  const stats = [
    { icon: Briefcase, label: 'Active Projects', value: '0', color: 'text-blue-600' },
    { icon: Users, label: 'Total Applicants', value: '0', color: 'text-green-600' },
    { icon: Eye, label: 'Profile Views', value: '0', color: 'text-purple-600' },
    { icon: CheckCircle, label: 'Hired', value: '0', color: 'text-orange-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-gray-600">Track your hiring performance and project metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Hiring Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Analytics data will appear here as you post projects and receive applications.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}