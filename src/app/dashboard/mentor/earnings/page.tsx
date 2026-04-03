'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePayments } from '@/hooks/usePayment';
import DashboardLayout from '../../layout';

export default function MentorEarningsPage() {
  const { balance, transactions } = usePayments();

  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', earnings: 15000 },
    { month: 'Feb', earnings: 18000 },
    { month: 'Mar', earnings: 22000 },
    { month: 'Apr', earnings: 25000 },
    { month: 'May', earnings: 28000 },
    { month: 'Jun', earnings: 32000 },
  ];

  const handleWithdraw = async () => {
    // Implement withdrawal logic
    console.log('Withdraw requested');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
              Earnings
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Track your income and withdraw earnings
            </p>
          </div>
          <Button onClick={handleWithdraw}>
            <Wallet className="mr-2 h-4 w-4" />
            Withdraw Funds
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Earned</p>
            <p className="text-2xl font-bold">₹{balance?.totalEarned?.toLocaleString() || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Available Balance</p>
            <p className="text-2xl font-bold text-green-600">₹{balance?.available?.toLocaleString() || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">₹{balance?.pending?.toLocaleString() || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Withdrawn</p>
            <p className="text-2xl font-bold">₹{balance?.withdrawn?.toLocaleString() || 0}</p>
          </Card>
        </div>

        {/* Monthly Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">This Month</p>
            <p className="text-2xl font-bold">₹{balance?.monthly?.thisMonth?.toLocaleString() || 0}</p>
            <p className="text-xs text-green-600 mt-1">
              +{balance?.monthly?.thisMonth && balance?.monthly?.lastMonth
                ? Math.round(((balance.monthly.thisMonth - balance.monthly.lastMonth) / balance.monthly.lastMonth) * 100)
                : 0}% from last month
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Last Month</p>
            <p className="text-2xl font-bold">₹{balance?.monthly?.lastMonth?.toLocaleString() || 0}</p>
          </Card>
        </div>

        {/* Earnings Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Earnings Overview</h3>
            <Tabs defaultValue="6months">
              <TabsList>
                <TabsTrigger value="30days">30 Days</TabsTrigger>
                <TabsTrigger value="6months">6 Months</TabsTrigger>
                <TabsTrigger value="1year">1 Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="earnings" stroke="#344A86" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Student</th>
                  <th className="text-left py-3 px-4">Session</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((tx: any) => (
                  <tr key={tx._id} className="border-b hover:bg-charcoal-100/50">
                    <td className="py-3 px-4">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{tx.user?.name}</td>
                    <td className="py-3 px-4">{tx.purpose}</td>
                    <td className="py-3 px-4 font-medium">₹{tx.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-8">
              <p className="text-charcoal-500">No transactions yet</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
