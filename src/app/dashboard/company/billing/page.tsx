'use client';

import { CreditCard, Download, Receipt, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const transactions = [
  { id: '1', label: 'Subscription', amount: '-Rs5,000', status: 'Paid', date: 'Mar 1, 2025' },
  { id: '2', label: 'Funds Added', amount: '+Rs50,000', status: 'Success', date: 'Feb 25, 2025' },
  { id: '3', label: 'Project Payment', amount: '-Rs15,000', status: 'Released', date: 'Feb 20, 2025' },
];

const glassSurface =
  'rounded-[22px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.52))] p-4 dark:border-white/10 dark:bg-charcoal-950/35';

export default function CompanyBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Billing & Payments</h1>
        <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">
          Track company balance, subscription usage, invoices, transaction history, and payment methods in one premium billing workspace.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,_rgba(225,221,214,0.28),_transparent_34%),linear-gradient(135deg,_rgba(52,74,134,0.96),_rgba(64,119,148,0.94)_60%,_rgba(75,73,69,0.92))] text-white shadow-[0_24px_60px_rgba(52,74,134,0.24)]">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.16em] text-white/70">Wallet Balance</div>
                <div className="mt-3 text-4xl font-semibold">Rs50,000</div>
                <div className="mt-3 text-sm text-white/82">Pending projects: Rs1,20,000</div>
              </div>
              <Wallet className="h-8 w-8 text-white/80" />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button className="bg-card text-charcoal-950 hover:bg-card/92">Add Funds</Button>
              <Button variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card/15">
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/82 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
            <div className={glassSurface}>Professional Plan | Rs5,000/month</div>
            <div className={glassSurface}>20 free job posts/month | 12 used</div>
            <div className={glassSurface}>Priority AI matching | Featured listings included</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-none bg-card/82 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Transaction History</CardTitle>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className={glassSurface}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-charcoal-950 dark:text-white">{transaction.label}</div>
                    <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{transaction.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-charcoal-950 dark:text-white">{transaction.amount}</div>
                    <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{transaction.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none bg-card/82 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
            <CardHeader>
              <CardTitle className="text-xl text-charcoal-950 dark:text-white">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className={glassSurface}>
                <CreditCard className="mr-2 inline h-4 w-4 text-primary-700" />
                Razorpay UPI | default
              </div>
              <Button>Add Credit / Debit Card</Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/82 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
            <CardHeader>
              <CardTitle className="text-xl text-charcoal-950 dark:text-white">Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['March 2025 - Rs5,000', 'February 2025 - Rs5,000', 'January 2025 - Rs0'].map((invoice) => (
                <div key={invoice} className={`${glassSurface} flex items-center justify-between gap-3`}>
                  <div className="flex items-center gap-3 text-sm text-charcoal-700 dark:text-charcoal-300">
                    <Receipt className="h-4 w-4 text-secondary-700" />
                    {invoice}
                  </div>
                  <Button size="sm" variant="outline">
                    Download PDF
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
