'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Briefcase, Eye, BarChart3 } from 'lucide-react';

const stats = [
  { icon: Briefcase, label: 'Active Projects', value: '0', color: 'text-blue-600' },
  { icon: Users, label: 'Total Applicants', value: '0', color: 'text-green-600' },
  { icon: Eye, label: 'Profile Views', value: '0', color: 'text-purple-600' },
  { icon: TrendingUp, label: 'Conversion', value: '0%', color: 'text-orange-600' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-gray-500">Track your hiring performance</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border border-dashed border-gray-200 dark:border-gray-800 shadow-none">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Analytics will appear as you post projects and receive applications.</p>
        </CardContent>
      </Card>
    </div>
  );
}