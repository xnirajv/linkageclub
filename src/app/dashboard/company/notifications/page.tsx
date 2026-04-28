'use client';

import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function timeAgo(date: string) {
  const hours = Math.round((Date.now() - new Date(date).getTime()) / 3600000);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-gray-500">{unreadCount} unread</p></div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>Mark all read</Button>}
      </div>

      {notifications.length === 0 ? (
        <Card className="border border-dashed border-gray-200 dark:border-gray-800 shadow-none"><CardContent className="p-12 text-center"><Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">No notifications</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <Card key={n._id} className={`border shadow-sm transition-all ${n.read ? 'border-gray-200 dark:border-gray-800' : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'}`}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="font-medium text-sm">{n.title}</p>{!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}</div>
                  <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => markAsRead(n._id)}>Mark read</Button>}
                  {n.link && <Button size="sm" variant="ghost" asChild><Link href={n.link}>View</Link></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}