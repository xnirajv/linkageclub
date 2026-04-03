'use client';

import React from 'react';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import DashboardLayout from '../../layout';

export default function StudentSettingsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">Settings</h1>
                    <p className="text-charcoal-600 dark:text-charcoal-400">Manage your account settings and preferences</p>
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    <SettingsSidebar role="student" />
                    <div className="flex-1">
                        <ProfileSettings />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}