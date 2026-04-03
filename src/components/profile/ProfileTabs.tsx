'use client';

import React from 'react';
import { ProfileOverview } from './ProfileOverview';
import { ProfileProjects } from './ProfileProjects';
import { ProfileSkills } from './ProfileSkills';
import { ProfileBadges } from './ProfileBadges';
import { ProfileReviews } from './ProfileReviews';
import { User } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface ProfileTabsProps {
  user: User;
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', component: <ProfileOverview user={user} /> },
    { id: 'projects', label: 'Projects', component: <ProfileProjects userId={user._id} /> },
    { id: 'skills', label: 'Skills', component: <ProfileSkills skills={user.skills} /> },
    { id: 'badges', label: 'Badges', component: <ProfileBadges badges={user.badges} /> },
    { id: 'reviews', label: 'Reviews', component: <ProfileReviews userId={user._id} /> },
  ];

  return (
    <Tabs defaultValue="overview" className="mt-6">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
}
