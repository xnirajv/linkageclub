'use client';

import React from 'react';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { PaymentSettings } from '@/components/settings/PaymentSettings';
import DashboardLayout from '@/app/dashboard/layout';

export default function StudentPaymentSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">Payment Settings</h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">Manage your wallet, withdrawals, and transaction history</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <SettingsSidebar role="student" />
          <div className="flex-1">
            <PaymentSettings />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
