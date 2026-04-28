import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  href?: string;
  colorClass?: string;
}

export function StatCard({ icon, label, value, change, href, colorClass }: StatCardProps) {
  const content = (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
            {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
          </div>
          {colorClass && (
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorClass)}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}