'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export interface Stat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: { value: number; isPositive: boolean };
  color?: string;
  link?: string;
}

interface StatsGridProps {
  stats: Stat[];
  columns?: number;
  isLoading?: boolean;
}

const colorGradients = {
  blue: 'from-primary-50 to-primary-100 dark:from-primary-950/40 dark:to-primary-900/20 border-primary-200 dark:border-primary-800',
  green: 'from-info-50 to-info-100 dark:from-info-950/40 dark:to-info-900/20 border-info-200 dark:border-info-800',
  purple: 'from-secondary-50 to-secondary-100 dark:from-secondary-950/30 dark:to-secondary-900/20 border-secondary-200 dark:border-secondary-800',
  yellow: 'from-gray-50 to-gray-100 dark:from-charcoal-900/60 dark:to-charcoal-800/60 border-charcoal-200 dark:border-charcoal-800',
  red: 'from-gray-100 to-gray-200 dark:from-charcoal-900/70 dark:to-charcoal-800/60 border-charcoal-300 dark:border-charcoal-700',
};

const iconColors = {
  blue: 'text-primary-700 dark:text-info-300',
  green: 'text-info-700 dark:text-info-300',
  purple: 'text-secondary-800 dark:text-secondary-200',
  yellow: 'text-charcoal-700 dark:text-charcoal-100',
  red: 'text-charcoal-700 dark:text-charcoal-100',
};

export function StatsGrid({ stats, columns = 4, isLoading = false }: StatsGridProps) {
  const router = useRouter();

  const getGridCols = () => {
    const cols = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' };
    return cols[columns as keyof typeof cols] || cols[4];
  };

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${getGridCols()}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 bg-charcoal-100 rounded-xl" />
                  <div className="h-6 w-12 bg-charcoal-100 rounded" />
                </div>
                <div className="mt-4">
                  <div className="h-8 w-16 bg-charcoal-100 rounded" />
                  <div className="h-4 w-24 bg-charcoal-100 rounded mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${getGridCols()}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const gradient = colorGradients[stat.color as keyof typeof colorGradients] || colorGradients.blue;
        
        return (
          <Card 
            key={index} 
            className={`group bg-gradient-to-br ${gradient} border shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden`}
            onClick={() => stat.link && router.push(stat.link)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-card/50 dark:bg-card/10 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 ${iconColors[stat.color as keyof typeof iconColors] || iconColors.blue}`} />
                </div>
                {stat.change && (
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.change.isPositive ? 'bg-info-100 text-info-700 dark:bg-info-950/30 dark:text-info-300' : 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-200'}`}>
                    {stat.change.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{stat.change.isPositive ? '+' : ''}{stat.change.value}%</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-charcoal-950 dark:text-white">{stat.value}</p>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mt-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
