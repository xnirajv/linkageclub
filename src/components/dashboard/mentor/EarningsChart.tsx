'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { IndianRupee } from 'lucide-react';

interface EarningsChartProps {
  data: Array<{ month: string; earnings: number; sessions: number }>;
  totalEarned: number;
  available: number;
  pending: number;
}

export function EarningsChart({ data, totalEarned, available, pending }: EarningsChartProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: totalEarned, color: 'text-foreground' },
          { label: 'Available', value: available, color: 'text-success-600' },
          { label: 'Pending', value: pending, color: 'text-warning-600' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <div className={`flex items-center justify-center gap-0.5 text-xl font-bold ${color}`}>
                <IndianRupee className="h-4 w-4" />
                {(value || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Earnings</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Earnings']} />
                <Bar dataKey="earnings" fill="#344A86" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sessions Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#407794" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
