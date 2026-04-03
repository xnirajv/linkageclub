'use client';

import React from 'react';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { AccountSettings } from '@/components/settings/AccountSettings';
import DashboardLayout from '@/app/dashboard/layout';

export default function StudentAccountSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">Account Settings</h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">Manage your account credentials and security</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <SettingsSidebar role="student" />
          <div className="flex-1">
            <AccountSettings />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
