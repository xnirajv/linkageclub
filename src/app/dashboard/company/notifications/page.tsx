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
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Notifications</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Track new applications, updates, interviews, and platform alerts from one inbox.</p>
        </div>
        <Button variant="outline" onClick={() => void markAllAsRead()} disabled={unreadCount === 0}>
          Mark All Read
        </Button>
      </div>

      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardHeader>
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Recent Notifications ({unreadCount} unread)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <div className="rounded-[22px] bg-silver-50/70 p-4 text-sm text-charcoal-500">Loading notifications...</div>}
          {!isLoading && notifications.length === 0 && (
            <div className="rounded-[22px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500">
              No notifications yet.
            </div>
          )}
          {!isLoading && notifications.map((notification) => (
            <div key={notification._id} className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className={`mt-1 h-3 w-3 rounded-full ${notification.read ? 'bg-charcoal-300 dark:bg-charcoal-700' : 'bg-info-600'}`} />
                  <div>
                    <div className="font-semibold text-charcoal-950 dark:text-white">{notification.title}</div>
                    <div className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">{notification.message}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Recently'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!notification.read && (
                    <Button size="sm" variant="outline" onClick={() => void markAsRead(notification._id)}>
                      Mark Read
                    </Button>
                  )}
                  {notification.link && (
                    <Button asChild size="sm">
                      <Link href={notification.link}>Open</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
        <CardContent className="flex items-center gap-3 p-6">
          <Bell className="h-5 w-5" />
          <div className="text-sm text-white/85">Your notification center is now available from the company dashboard and mobile menu.</div>
        </CardContent>
      </Card>
    </div>
  );
}
