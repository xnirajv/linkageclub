'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '../../layout';

// Mock data - replace with actual API
const transactions = [
  {
    id: '1',
    transactionId: 'TXN240120001',
    user: 'Riya Sharma',
    type: 'Assessment',
    amount: 199,
    status: 'completed',
    date: '2024-01-20',
  },
  {
    id: '2',
    transactionId: 'TXN240120002',
    user: 'TechCorp',
    type: 'Project Payment',
    amount: 55000,
    status: 'completed',
    date: '2024-01-20',
  },
  {
    id: '3',
    transactionId: 'TXN240120003',
    user: 'Vikram Singh',
    type: 'Mentor Session',
    amount: 1500,
    status: 'pending',
    date: '2024-01-20',
  },
];

const withdrawals = [
  {
    id: '1',
    user: 'Vikram Singh',
    amount: 15000,
    method: 'Bank Transfer',
    status: 'pending',
    requestedAt: '2024-01-20',
  },
  {
    id: '2',
    user: 'Priya Patel',
    amount: 25000,
    method: 'UPI',
    status: 'completed',
    requestedAt: '2024-01-19',
  },
];

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-charcoal-100 text-charcoal-900';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            Payment Management
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Monitor transactions and manage withdrawals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Total Revenue</p>
                <p className="text-xl font-bold">₹12,45,678</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Platform Fees</p>
                <p className="text-xl font-bold">₹1,24,568</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Total Transactions</p>
                <p className="text-xl font-bold">1,234</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">This Month</p>
                <p className="text-xl font-bold">₹2,34,567</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search transactions by ID or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.length})</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{tx.transactionId}</TableCell>
                      <TableCell>{tx.user}</TableCell>
                      <TableCell>{tx.type}</TableCell>
                      <TableCell className="font-medium">₹{tx.amount}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.status)}`}>
                          {tx.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((wd) => (
                    <TableRow key={wd.id}>
                      <TableCell>{wd.user}</TableCell>
                      <TableCell className="font-medium">₹{wd.amount}</TableCell>
                      <TableCell>{wd.method}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(wd.status)}`}>
                          {wd.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(wd.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        {wd.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 mr-2">
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}