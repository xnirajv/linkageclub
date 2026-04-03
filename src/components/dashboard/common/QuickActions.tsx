'use client';

import React from 'react';
import { LucideIcon, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  description?: string;
  disabled?: boolean;
  badge?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

const colorStyles = {
  blue: { iconBg: 'bg-primary-100 dark:bg-primary-950/50', iconColor: 'text-primary-700 dark:text-info-300', badge: 'bg-primary-100 text-primary-700' },
  green: { iconBg: 'bg-info-100 dark:bg-info-950/50', iconColor: 'text-info-700 dark:text-info-300', badge: 'bg-info-100 text-info-700' },
  purple: { iconBg: 'bg-secondary-100 dark:bg-secondary-900/40', iconColor: 'text-secondary-800 dark:text-secondary-200', badge: 'bg-secondary-100 text-secondary-800' },
  orange: { iconBg: 'bg-charcoal-100 dark:bg-charcoal-800', iconColor: 'text-charcoal-700 dark:text-charcoal-100', badge: 'bg-charcoal-100 text-charcoal-700' },
  pink: { iconBg: 'bg-primary-50 dark:bg-primary-950/40', iconColor: 'text-primary-700 dark:text-info-300', badge: 'bg-primary-50 text-primary-700' },
};

export function QuickActions({ actions, title = 'Quick Actions', subtitle = 'Get started', isLoading = false }: QuickActionsProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-charcoal-100 rounded mb-2" />
            <div className="h-4 w-48 bg-charcoal-100 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse h-28 bg-charcoal-100 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="luxury-border overflow-hidden">
      <CardHeader className="border-b border-white/50 bg-card/55 dark:border-white/10 dark:bg-charcoal-900/35">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
            <Zap className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.slice(0, 4).map((action, index) => {
            const Icon = action.icon;
            const colors = colorStyles[action.color || 'blue'];
            
            return (
              <div
                key={index}
                onClick={action.disabled ? undefined : action.onClick}
                className={`group rounded-[24px] border border-white/55 bg-card/70 p-4 transition-all duration-300 dark:border-white/10 dark:bg-charcoal-900/60 ${!action.disabled ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:border-primary-100 dark:hover:border-info-800' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colors.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-4 w-4 ${colors.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal-950 dark:text-white group-hover:text-primary-600 transition-colors">
                      {action.label}
                    </p>
                    {action.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {action.description}
                      </p>
                    )}
                    {action.badge && (
                      <Badge variant="outline" className={`text-xs mt-1 ${colors.badge}`}>
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-600 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
