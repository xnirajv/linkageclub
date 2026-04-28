'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, IndianRupee, Receipt } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div><h1 className="text-2xl font-bold">Billing</h1><p className="text-gray-500">Manage payments and invoices</p></div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: IndianRupee, label: 'Balance', value: '₹0' },
          { icon: Receipt, label: 'Invoices', value: '0' },
          { icon: CreditCard, label: 'Methods', value: '0' },
        ].map((s) => (
          <Card key={s.label} className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-5 text-center"><s.icon className="h-6 w-6 text-gray-400 mx-auto mb-2" /><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-gray-500">{s.label}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-12 text-center">
          <Receipt className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No transactions yet</p>
        </CardContent>
      </Card>
    </div>
  );
}