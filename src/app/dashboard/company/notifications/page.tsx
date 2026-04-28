'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompanyNotificationsPage() {
  const { notifications, unreadCount, isLoading, markAllAsRead, markAsRead } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <p className="mt-2 text-sm text-gray-500">Track new applications, updates, interviews, and platform alerts.</p>
        </div>
        <Button variant="outline" onClick={() => void markAllAsRead()} disabled={unreadCount === 0}>
          Mark All Read
        </Button>
      </div>

      <Card className="border-none bg-card/80 shadow-lg">
        <CardHeader><CardTitle>Recent Notifications ({unreadCount} unread)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="rounded-2xl bg-gray-50 p-4 text-sm">Loading notifications...</div>}
          {!isLoading && notifications.length === 0 && (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">No notifications yet.</div>
          )}
          {!isLoading && notifications.map((notification) => (
            <div key={notification._id} className="rounded-2xl border bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className={`mt-1 h-3 w-3 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-blue-600'}`} />
                  <div>
                    <div className="font-semibold">{notification.title}</div>
                    <div className="mt-1 text-sm text-gray-600">{notification.message}</div>
                    <div className="mt-2 text-xs uppercase tracking-wider text-gray-500">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Recently'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <Button size="sm" variant="outline" onClick={() => void markAsRead(notification._id)}>Mark Read</Button>
                  )}
                  {notification.link && (
                    <Button asChild size="sm"><Link href={notification.link}>Open</Link></Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-primary-700 to-info-500 text-white">
        <CardContent className="flex items-center gap-3 p-6">
          <Bell className="h-5 w-5" />
          <div className="text-sm text-white/85">Notification center available from the company dashboard and mobile menu.</div>
        </CardContent>
      </Card>
    </div>
  );
}