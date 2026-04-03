'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ChevronRight,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useMentor } from '@/hooks/useMentors';
import { useAuth } from '@/hooks/useAuth';
import { EarningsChart } from './EarningsChart';

interface EarningsOverviewProps {
  showViewAll?: boolean;
}

export function EarningsOverview({ showViewAll = true }: EarningsOverviewProps) {
  const { user } = useAuth() as { user: { id: string } | null };
  const { mentor, isLoading } = useMentor(user?.id || '');

  // Mock monthly data - replace with actual API data
  const monthlyData = [
    { month: 'Jan', earnings: 4500, sessions: 3 },
    { month: 'Feb', earnings: 6000, sessions: 4 },
    { month: 'Mar', earnings: 7500, sessions: 5 },
    { month: 'Apr', earnings: 8200, sessions: 6 },
    { month: 'May', earnings: 9800, sessions: 7 },
    { month: 'Jun', earnings: 11200, sessions: 8 },
  ];

  const totalEarned = mentor?.stats?.totalEarnings || 0;
  const completedSessions = mentor?.stats?.completedSessions || 0;
  
  // Mock data for available and pending
  const available = Math.round(totalEarned * 0.7);
  const pending = totalEarned - available;

  // Calculate growth
  const lastMonthEarnings = monthlyData[monthlyData.length - 1]?.earnings || 0;
  const previousMonthEarnings = monthlyData[monthlyData.length - 2]?.earnings || 0;
  const growthPercentage = previousMonthEarnings > 0 
    ? ((lastMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100 
    : 0;
  const isGrowthPositive = growthPercentage >= 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary-600" />
          Earnings Overview
        </CardTitle>
        {showViewAll && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/mentor/earnings">
              View Details <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Growth Indicator */}
        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
          <div>
            <p className="text-xs text-primary-600">This Month</p>
            <p className="text-2xl font-bold text-primary-700">₹{lastMonthEarnings.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Badge variant={isGrowthPositive ? 'success' : 'error'} className="flex items-center gap-1">
                {isGrowthPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(growthPercentage).toFixed(1)}%
              </Badge>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">vs last month</p>
          </div>
        </div>

        {/* Earnings Chart Component */}
        <EarningsChart 
          data={monthlyData}
          totalEarned={totalEarned}
          available={available}
          pending={pending}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-green-600" />
              <p className="text-xs text-charcoal-500">Withdrawable</p>
            </div>
            <p className="text-lg font-bold text-green-600">₹{available.toLocaleString()}</p>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-1">
              Withdraw
            </Button>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-charcoal-500">Pending Clearance</p>
            </div>
            <p className="text-lg font-bold text-yellow-600">₹{pending.toLocaleString()}</p>
            <p className="text-xs text-charcoal-400 mt-1">Est. available in 3 days</p>
          </div>
        </div>

        {/* Session Stats */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal-500">Average per session</span>
            <span className="font-medium">
              ₹{completedSessions > 0 ? Math.round(totalEarned / completedSessions).toLocaleString() : 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-charcoal-500">Total sessions</span>
            <span className="font-medium">{completedSessions}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-charcoal-500">This month sessions</span>
            <span className="font-medium">{monthlyData[monthlyData.length - 1]?.sessions || 0}</span>
          </div>
        </div>

        {/* Payout Schedule */}
        <div className="mt-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Next payout</p>
              <p className="text-xs text-charcoal-500">Sessions completed before 20th</p>
            </div>
            <div className="text-right">
              <p className="font-medium">25 Mar 2024</p>
              <p className="text-xs text-green-600">₹{(available * 0.5).toLocaleString()} estimated</p>
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="pt-2 text-center">
          <Button variant="link" size="sm" asChild>
            <Link href="/dashboard/mentor/earnings/history">
              View complete payout history
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}