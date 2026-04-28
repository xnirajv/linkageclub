'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';

export default function CompanySettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your company profile and preferences</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Settings2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Company settings coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}