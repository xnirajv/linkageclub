'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, IndianRupee, Receipt } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing & Payments</h1>
          <p className="text-gray-600">Manage your payment methods and view transaction history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-6 text-center"><IndianRupee className="h-8 w-8 text-green-600 mx-auto mb-2" /><p className="text-2xl font-bold">₹0.00</p><p className="text-sm text-gray-500">Current Balance</p></CardContent></Card>
          <Card><CardContent className="p-6 text-center"><Receipt className="h-8 w-8 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold">0</p><p className="text-sm text-gray-500">Total Invoices</p></CardContent></Card>
          <Card><CardContent className="p-6 text-center"><CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold">0</p><p className="text-sm text-gray-500">Payment Methods</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
              <Button variant="outline" className="mt-4"><Download className="mr-2 h-4 w-4" />Download Statement</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}