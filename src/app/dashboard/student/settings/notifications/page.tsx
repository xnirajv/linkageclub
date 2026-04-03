'use client';

import React from 'react';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import DashboardLayout from '@/app/dashboard/layout';

export default function StudentNotificationSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">Notification Preferences</h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">Control how and when you receive notifications</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <SettingsSidebar role="student" />
          <div className="flex-1">
            <NotificationSettings />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
