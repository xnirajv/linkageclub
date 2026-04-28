'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';

export default function TeamPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Team Management</h1><p className="text-gray-600">Manage your team members and permissions</p></div>
          <Button><Plus className="mr-2 h-4 w-4" />Invite Member</Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No team members yet. Invite your team to collaborate.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}