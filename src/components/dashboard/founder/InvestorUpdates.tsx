'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ExternalLink, Eye, Calendar } from 'lucide-react';

interface InvestorUpdate {
  _id: string;
  investor: string;
  type: 'view' | 'interest' | 'meeting';
  date: string;
}

export function InvestorUpdates() {
  const updates: InvestorUpdate[] = [
    { _id: '1', investor: 'Sequoia Capital', type: 'interest', date: '2024-02-20' },
    { _id: '2', investor: 'Accel Partners', type: 'view', date: '2024-02-19' },
    { _id: '3', investor: 'Blume Ventures', type: 'meeting', date: '2024-02-18' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'interest': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      default: return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          Investor Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {updates.map((update) => (
            <div key={update._id} className="flex items-center justify-between p-3 bg-charcoal-100/50 rounded-lg">
              <div>
                <p className="font-medium">{update.investor}</p>
                <p className="text-xs text-charcoal-500 mt-1">
                  {new Date(update.date).toLocaleDateString()}
                </p>
              </div>
              <Badge className={getTypeColor(update.type)} size="sm">
                {update.type}
              </Badge>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-4">
          <ExternalLink className="h-4 w-4 mr-1" />
          View All
        </Button>
      </CardContent>
    </Card>
  );
}