'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ModerationItem {
  _id: string;
  type: 'post' | 'comment' | 'user';
  content: string;
  author: { name: string; avatar?: string };
  reportCount: number;
  reasons: string[];
  reportedAt: Date;
}

interface ModerationQueueProps {
  items: ModerationItem[];
  onApprove?: (id: string) => void;
  onRemove?: (id: string) => void;
  onView?: (id: string) => void;
  title?: string;
}

export function ModerationQueue({
  items,
  onApprove,
  onRemove,
  onView,
  title = 'Moderation Queue',
}: ModerationQueueProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning-600" />
            {title}
          </CardTitle>
          <Badge variant="warning">{items.length} pending</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">No items in moderation queue</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.author.avatar} />
                      <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{item.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.reportedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="error" size="sm">{item.reportCount} reports</Badge>
                    <Badge variant="outline" size="sm" className="capitalize">{item.type}</Badge>
                  </div>
                </div>

                <p className="text-sm text-charcoal-700 dark:text-charcoal-300 line-clamp-3">{item.content}</p>

                {item.reasons?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.reasons.map((reason, i) => (
                      <Badge key={i} variant="warning" size="sm">{reason}</Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {onView && (
                    <Button variant="outline" size="sm" onClick={() => onView(item._id)} className="gap-1">
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  )}
                  {onApprove && (
                    <Button variant="outline" size="sm" onClick={() => onApprove(item._id)} className="gap-1 text-success-600 border-success-200">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {onRemove && (
                    <Button variant="destructive" size="sm" onClick={() => onRemove(item._id)} className="gap-1">
                      <XCircle className="h-3.5 w-3.5" /> Remove
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
