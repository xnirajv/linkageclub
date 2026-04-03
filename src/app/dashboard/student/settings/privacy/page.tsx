'use client';

import React from 'react';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { PrivacySettings } from '@/components/settings/PrivacySettings';
import DashboardLayout from '@/app/dashboard/layout';

export default function StudentPrivacySettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">Privacy Settings</h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">Control your profile visibility and data sharing</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <SettingsSidebar role="student" />
          <div className="flex-1">
            <PrivacySettings />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
