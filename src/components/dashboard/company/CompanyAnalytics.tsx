'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react';

interface CompanyAnalyticsProps {
  data?: {
    totalHires?: number;
    conversionRate?: number;
    avgTimeToHire?: number;
    totalRevenue?: number;
  };
}

export function CompanyAnalytics({ data = {} }: CompanyAnalyticsProps) {
  const metrics = [
    { icon: Award, label: 'Total Hires', value: data.totalHires || 0, change: '+12%', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { icon: TrendingUp, label: 'Conversion', value: `${data.conversionRate || 0}%`, change: '+5%', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { icon: Calendar, label: 'Time to Hire', value: `${data.avgTimeToHire || 0}d`, change: '-2d', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { icon: DollarSign, label: 'Revenue', value: '₹0', change: '+18%', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{m.label}</p>
                  <p className="text-2xl font-bold mt-1">{m.value}</p>
                  <p className="text-xs text-green-600 mt-1">{m.change}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color}`}>
                  <m.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}