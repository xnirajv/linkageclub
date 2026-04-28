'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Bell, Shield, CreditCard, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const settingsLinks = [
  { icon: Shield, label: 'Account', description: 'Manage your account settings', href: '/dashboard/company/settings/account' },
  { icon: Bell, label: 'Notifications', description: 'Configure notification preferences', href: '/dashboard/company/settings/notifications' },
  { icon: CreditCard, label: 'Billing', description: 'Payment methods and invoices', href: '/dashboard/company/billing' },
  { icon: Users, label: 'Team', description: 'Manage team members', href: '/dashboard/company/team' },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-500">Manage your preferences</p></div>
      <div className="space-y-2">
        {settingsLinks.map((link) => (
          <Link key={link.label} href={link.href}>
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><link.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" /></div>
                <div className="flex-1"><p className="font-medium text-sm">{link.label}</p><p className="text-xs text-gray-500">{link.description}</p></div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}