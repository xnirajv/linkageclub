'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, IndianRupee } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  _id: string;
  userId: { name: string; avatar?: string };
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purpose: string;
  createdAt: Date;
}

interface TransactionListProps {
  transactions: Transaction[];
  onExport?: () => void;
  title?: string;
}

const STATUS_VARIANTS: Record<string, any> = {
  pending: 'pending',
  completed: 'success',
  failed: 'error',
  refunded: 'warning',
};

export function TransactionList({ transactions, onExport, title = 'Transactions' }: TransactionListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3 text-sm font-medium">User</th>
                <th className="py-2 px-3 text-sm font-medium">Purpose</th>
                <th className="py-2 px-3 text-sm font-medium">Amount</th>
                <th className="py-2 px-3 text-sm font-medium">Status</th>
                <th className="py-2 px-3 text-sm font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={tx.userId?.avatar} />
                        <AvatarFallback>{tx.userId?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{tx.userId?.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-sm text-muted-foreground">{tx.purpose}</td>
                  <td className="py-2 px-3">
                    <span className={`text-sm font-medium flex items-center gap-0.5 ${tx.type === 'credit' ? 'text-success-600' : 'text-error-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}
                      <IndianRupee className="h-3.5 w-3.5" />
                      {tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant={STATUS_VARIANTS[tx.status]} size="sm" className="capitalize">
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!transactions.length && (
            <p className="text-center py-8 text-muted-foreground text-sm">No transactions found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
