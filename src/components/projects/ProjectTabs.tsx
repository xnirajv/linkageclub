'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ProjectTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges?: Record<string, number>;
}

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'candidate', label: 'Candidate' },
  { key: 'communication', label: 'Communication' },
  { key: 'payments', label: 'Payments' },
];

export function ProjectTabs({ activeTab, onTabChange, badges = {} }: ProjectTabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="flex gap-0 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'px-5 py-3 text-sm font-medium border-b-2 transition-colors relative',
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
            {badges[tab.key] > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {badges[tab.key]}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}