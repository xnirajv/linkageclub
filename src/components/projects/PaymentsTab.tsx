'use client';

import React from 'react';
import { DollarSign, TrendingUp, Download, Plus, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PaymentsTabProps {
  project: any;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

export function PaymentsTab({ project }: PaymentsTabProps) {
  const ps = project?.paymentSummary || {};
  const totalBudget = ps.totalBudget || project?.budget?.max || 0;
  const released = ps.released || 0;
  const pending = totalBudget - released;
  const platformFee = ps.platformFee || Math.round(totalBudget * 0.1);
  const releasePercentage = totalBudget > 0 ? Math.round((released / totalBudget) * 100) : 0;

  const milestones = project?.milestones || [];
  const transactions = ps.transactions || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalBudget)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Released</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(released)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{formatCurrency(pending)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Platform Fee</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(platformFee)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Release Progress */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-sm">Payment Progress</h3>
          </div>
          <CardContent className="p-5">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Released</span>
                  <span className="font-medium">{releasePercentage}%</span>
                </div>
                <Progress value={releasePercentage} className="h-3" />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{formatCurrency(released)} of {formatCurrency(totalBudget)}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-2">
                <Plus className="h-4 w-4 mr-1" />Add Funds
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Milestone Payments */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-sm">Milestone Payments</h3>
          </div>
          <CardContent className="p-5 space-y-3">
            {milestones.map((m: any) => (
              <div key={m._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{m.title}</p>
                  <p className="text-xs text-gray-500">{m.status?.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(m.amount)}</p>
                  <Badge
                    variant={m.status === 'approved' ? 'success' : m.status === 'submitted' ? 'warning' : 'secondary'}
                    className="text-[10px] mt-1"
                  >
                    {m.status === 'approved' ? 'Paid' : m.status === 'submitted' ? 'Pending' : 'Locked'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Transaction History</h3>
          <Button size="sm" variant="ghost" className="text-xs">
            <Download className="h-4 w-4 mr-1" />Export
          </Button>
        </div>
        <CardContent className="p-5">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn: any) => (
                <div
                  key={txn._id}
                  className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        txn.type === 'milestone_release' || txn.type === 'credit'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {txn.type === 'milestone_release' || txn.type === 'credit' ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {txn.milestone || txn.type?.replace('_', ' ') || 'Transaction'}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium text-sm ${
                        txn.type === 'milestone_release' || txn.type === 'credit'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {txn.type === 'milestone_release' || txn.type === 'credit' ? '-' : '+'}
                      {formatCurrency(txn.amount)}
                    </p>
                    <Badge variant={txn.status === 'completed' ? 'success' : 'secondary'} className="text-[10px]">
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}