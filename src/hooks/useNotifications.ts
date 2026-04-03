import useSWR from 'swr';
import { useCallback, useEffect, useState } from 'react';
import { fetcher } from '@/lib/api/client';
import { useAuth } from './useAuth';
import type { Notification } from '@/types/notification';

interface NotificationsResponse {
  notifications?: Notification[];
  unreadCount?: number;
  pagination?: any;
}

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data, error, mutate } = useSWR<NotificationsResponse>(
    isAuthenticated ? '/api/notifications' : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  useEffect(() => {
    if (data?.unreadCount !== undefined) {
      setUnreadCount(data.unreadCount);
    }
  }, [data]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      setUnreadCount(prev => Math.max(0, prev - 1));
      mutate(); // Refresh notifications
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      setUnreadCount(0);
      mutate(); // Refresh notifications
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      if (data?.notifications) {
        const wasUnread = data.notifications.find(
          (n: any) => n._id === notificationId && !n.read
        );
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }

      mutate(); // Refresh notifications
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [mutate, data]);

  return {
    notifications: data?.notifications || [],
    unreadCount,
    pagination: data?.pagination,
    isLoading: !error && !data,
    isError: error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    mutate,
  };
}
