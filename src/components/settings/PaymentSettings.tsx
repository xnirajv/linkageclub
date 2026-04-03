'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayment } from '@/hooks/usePayment';
import { IndianRupee, Download, Wallet } from 'lucide-react';

export function PaymentSettings() {
  const { balance, transactions, isLoading } = usePayment();
  const [bankAccount, setBankAccount] = useState({ accountNumber: '', ifsc: '', name: '' });
  const [isSavingBank, setIsSavingBank] = useState(false);

  const handleSaveBank = async () => {
    setIsSavingBank(true);
    try {
      await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccount }),
      });
    } finally {
      setIsSavingBank(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance */}
      <Card>
        <CardHeader><CardTitle>Wallet Balance</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-success-50 rounded-lg">
              <p className="text-sm text-success-700">Available</p>
              <div className="flex items-center gap-1 text-2xl font-bold text-success-700 mt-1">
                <IndianRupee className="h-5 w-5" />
                {(balance?.available || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-warning-50 rounded-lg">
              <p className="text-sm text-warning-700">Pending</p>
              <div className="flex items-center gap-1 text-2xl font-bold text-warning-700 mt-1">
                <IndianRupee className="h-5 w-5" />
                {(balance?.pending || 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-charcoal-100/50 rounded-lg">
              <p className="text-sm text-charcoal-600">Total Earned</p>
              <div className="flex items-center gap-1 text-2xl font-bold mt-1">
                <IndianRupee className="h-5 w-5" />
                {(balance?.totalEarned || 0).toLocaleString()}
              </div>
            </div>
          </div>
          <Button className="mt-4 gap-2" disabled={!(balance?.available > 0)}>
            <Wallet className="h-4 w-4" />
            Withdraw Funds
          </Button>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader><CardTitle>Bank Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Account Holder Name</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={bankAccount.name}
              onChange={(e) => setBankAccount({ ...bankAccount, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={bankAccount.accountNumber}
              onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IFSC Code</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={bankAccount.ifsc}
              onChange={(e) => setBankAccount({ ...bankAccount, ifsc: e.target.value })}
            />
          </div>
          <Button onClick={handleSaveBank} isLoading={isSavingBank}>Save Bank Details</Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !transactions?.length ? (
            <p className="text-muted-foreground text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx: any) => (
                <div key={tx._id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{tx.purpose || tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'credit' ? 'text-success-600' : 'text-error-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </p>
                    <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm">
                      {tx.status}
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
