'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

export default function TeamPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Team</h1><p className="text-gray-500">Manage team members</p></div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Invite</Button>
      </div>
      <Card className="border border-dashed border-gray-200 dark:border-gray-800 shadow-none">
        <CardContent className="p-12 text-center">
          <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No team members yet. Invite your team to collaborate.</p>
        </CardContent>
      </Card>
    </div>
  );
}