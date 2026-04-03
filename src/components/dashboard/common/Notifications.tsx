'use client';

import React, { useState } from 'react';
import { Bell, X, Check, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Notification } from '@/types/notification';

interface NotificationsProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function Notifications({ 
  notifications = [], 
  onMarkAsRead, 
  onMarkAllAsRead,
  onDelete,
  isLoading = false 
}: NotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'project_milestone':
      case 'project_completed':
        return 'bg-primary-100 text-primary-700';
      case 'badge_earned':
      case 'trust_score_updated':
        return 'bg-secondary-100 text-secondary-800';
      case 'mentor_recommendation':
      case 'session_scheduled':
      case 'session_reminder':
      case 'session_completed':
        return 'bg-info-100 text-info-700';
      default: return 'bg-charcoal-100 text-charcoal-700';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="luxury-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-600" />
              <span>Notifications</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-charcoal-100 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="luxury-border overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            <span>Notifications</span>
            {unreadCount > 0 && (
                <Badge variant="warning" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && onMarkAllAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs h-8"
              >
                Mark all read
              </Button>
            )}
            
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <select
                className="text-xs bg-transparent border-none focus:outline-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              When you get notifications, they'll appear here
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No notifications match your filter</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.slice(0, 5).map((notification) => (
              <div
                key={notification._id}
                className={`group flex items-start justify-between rounded-[20px] p-3 transition-colors cursor-pointer ${
                  !notification.read ? 'border border-primary-100 bg-primary-50/80 dark:border-primary-900/60 dark:bg-primary-950/20' : 'bg-muted/30'
                }`}
                onClick={() => {
                  if (!notification.read && onMarkAsRead) {
                    onMarkAsRead(notification._id);
                  }
                  if (notification.link) {
                    window.location.assign(notification.link);
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {notification.type && (
                      <Badge variant="outline" className={`text-xs ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </Badge>
                    )}
                    {notification.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && onMarkAsRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification._id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-charcoal-100 hover:text-charcoal-700 dark:hover:bg-charcoal-800 dark:hover:text-charcoal-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification._id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
