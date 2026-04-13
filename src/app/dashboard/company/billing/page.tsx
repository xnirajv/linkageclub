'use client';

import React, { useState } from 'react';
import { CreditCard, Download, Receipt, Wallet, Plus, X, ArrowUpRight, ArrowDownLeft, TrendingUp, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Transaction {
  id: string;
  label: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description: string;
}

const transactions: Transaction[] = [
  { id: '1', label: 'Subscription Renewal', amount: 5000, type: 'debit', status: 'completed', date: 'Mar 1, 2025', description: 'Monthly subscription' },
  { id: '2', label: 'Wallet Funds', amount: 50000, type: 'credit', status: 'completed', date: 'Feb 25, 2025', description: 'Added via card' },
  { id: '3', label: 'Project Payment', amount: 15000, type: 'debit', status: 'completed', date: 'Feb 20, 2025', description: 'Released to freelancer' },
  { id: '4', label: 'Refund', amount: 2000, type: 'credit', status: 'completed', date: 'Feb 18, 2025', description: 'Project cancellation' },
  { id: '5', label: 'Featured Listing', amount: 1500, type: 'debit', status: 'completed', date: 'Feb 15, 2025', description: 'Job posting featured' },
];

const invoices = [
  { month: 'March 2025', amount: 5000, status: 'paid', date: '2025-03-01' },
  { month: 'February 2025', amount: 5000, status: 'paid', date: '2025-02-01' },
  { month: 'January 2025', amount: 0, status: 'waived', date: '2025-01-01' },
];

const paymentMethods = [
  { id: '1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
  { id: '2', type: 'upi', value: 'user@upi', isDefault: false },
];

const glassSurface = 'rounded-[18px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.52))] p-4 dark:border-white/10 dark:bg-charcoal-950/35';

export default function CompanyBillingPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const filteredTransactions = filterStatus === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === filterStatus);

  const monthlySpend = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const walletBalance = 50000;
  const pendingBalance = 120000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Billing & Payments</h1>
        <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">
          Manage your wallet, subscriptions, payment methods, and transaction history.
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Wallet Balance */}
        <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,_rgba(225,221,214,0.28),_transparent_34%),linear-gradient(135deg,_rgba(52,74,134,0.96),_rgba(64,119,148,0.94)_60%,_rgba(75,73,69,0.92))] text-white shadow-[0_24px_60px_rgba(52,74,134,0.24)]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm uppercase tracking-[0.16em] text-white/70">Wallet Balance</div>
                <div className="mt-3 text-3xl font-semibold">₹{walletBalance.toLocaleString()}</div>
              </div>
              <Wallet className="h-8 w-8 text-white/80" />
            </div>
            <div className="rounded-lg bg-white/10 p-3 mb-4 text-sm text-white/80">
              <p>Pending payouts: ₹{pendingBalance.toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-card text-charcoal-950 hover:bg-card/92">
                <Plus className="mr-1 h-4 w-4" />
                Add Funds
              </Button>
              <Button variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spend */}
        <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-charcoal-600 dark:text-charcoal-400">Monthly Spend</div>
                <div className="mt-2 text-3xl font-semibold text-charcoal-950 dark:text-white">₹{monthlySpend.toLocaleString()}</div>
              </div>
              <TrendingUp className="h-8 w-8 text-info-600" />
            </div>
            <div className="text-xs text-charcoal-500 dark:text-charcoal-400">3 transactions this month</div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-charcoal-600 dark:text-charcoal-400">Current Plan</div>
                <div className="mt-2 text-lg font-semibold text-charcoal-950 dark:text-white">Professional</div>
              </div>
              <CheckCircle className="h-8 w-8 text-info-600" />
            </div>
            <div className="text-xs text-charcoal-500 dark:text-charcoal-400">₹5,000/month • Active</div>
            <Button size="sm" variant="outline" className="mt-3 w-full">
              Manage Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Subscription Details */}
            <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
              <CardHeader>
                <CardTitle className="text-lg">Subscription Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={glassSurface}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-charcoal-950 dark:text-white">Professional Plan</span>
                    <span className="text-xs bg-info-100 text-info-700 px-2 py-1 rounded-full dark:bg-info-950/50 dark:text-info-300">Active</span>
                  </div>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-400">₹5,000/month</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-info-600 mt-0.5 flex-shrink-0" />
                    <span className="text-charcoal-700 dark:text-charcoal-300">20 job posts per month (12 used)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-info-600 mt-0.5 flex-shrink-0" />
                    <span className="text-charcoal-700 dark:text-charcoal-300">Priority AI matching</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-info-600 mt-0.5 flex-shrink-0" />
                    <span className="text-charcoal-700 dark:text-charcoal-300">Featured job listings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-info-600 mt-0.5 flex-shrink-0" />
                    <span className="text-charcoal-700 dark:text-charcoal-300">Candidate analytics</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-charcoal-200 dark:border-charcoal-800">
                  <p className="text-xs text-charcoal-600 dark:text-charcoal-400 mb-3">Next renewal: April 1, 2025</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">Upgrade Plan</Button>
                    <Button size="sm" variant="ghost" className="flex-1">Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download All Invoices
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Failed Payment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  View Billing History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Transaction History</CardTitle>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Filter */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'completed', 'pending', 'failed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      filterStatus === status
                        ? 'bg-primary-700 text-white'
                        : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200 dark:bg-charcoal-800 dark:text-charcoal-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                {filteredTransactions.map(transaction => (
                  <div key={transaction.id} className={`${glassSurface} flex items-center justify-between`}>
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'credit'
                          ? 'bg-info-100 text-info-600 dark:bg-info-950/50 dark:text-info-400'
                          : 'bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-charcoal-950 dark:text-white">{transaction.label}</p>
                        <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{transaction.date} • {transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'credit'
                          ? 'text-info-600'
                          : 'text-charcoal-950 dark:text-white'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                          transaction.status === 'completed'
                            ? 'bg-info-100 text-info-700 dark:bg-info-950/50 dark:text-info-400'
                            : transaction.status === 'pending'
                            ? 'bg-warning-100 text-warning-700 dark:bg-warning-950/50 dark:text-warning-400'
                            : 'bg-danger-100 text-danger-700 dark:bg-danger-950/50 dark:text-danger-400'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Methods */}
            <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map(method => (
                  <div key={method.id} className={`${glassSurface} flex items-center justify-between`}>
                    <div className="flex items-center gap-3 flex-1">
                      <CreditCard className="h-5 w-5 text-primary-700" />
                      <div>
                        <p className="font-medium text-charcoal-950 dark:text-white">
                          {method.type === 'card' ? `${method.brand} •••• ${method.last4}` : method.value}
                        </p>
                        {method.isDefault && (
                          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Default</p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
              <CardHeader>
                <CardTitle className="text-lg">Invoices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoices.map(invoice => (
                  <div key={invoice.month} className={`${glassSurface} flex items-center justify-between`}>
                    <div>
                      <p className="font-medium text-charcoal-950 dark:text-white">{invoice.month}</p>
                      <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                        ₹{invoice.amount.toLocaleString()} • {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </p>
                    </div>
                    {invoice.amount > 0 && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
