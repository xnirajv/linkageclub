'use client';

import React from 'react';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { ProfileTabs } from './ProfileTabs';
import { ProfileSkills } from './ProfileSkills';
import { ProfileProjects } from './ProfileProjects';
import { ProfileReviews } from './ProfileReviews';

interface ProfileClientWrapperProps {
  user: any;
  mentorData: any;
}

export default function ProfileClientWrapper({ user, mentorData }: ProfileClientWrapperProps) {
  return (
    <>
      <ProfileHeader user={user} isOwnProfile={false} onEdit={() => {}} onShare={() => {}} />
      
      <div className="mt-8">
        <ProfileStats user={user} mentorData={mentorData} />
      </div>
      
      <div className="mt-8">
        <ProfileTabs user={user} />
      </div>

      <div className="mt-6 space-y-6">
        <div className="space-y-6">
          {user.bio && (
            <div className="bg-card dark:bg-charcoal-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-charcoal-600 dark:text-charcoal-400">{user.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.skills && user.skills.length > 0 && (
              <ProfileSkills skills={user.skills} />
            )}

            <div className="bg-card dark:bg-charcoal-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              {user.location && <p className="mb-2">📍 {user.location}</p>}
              {user.socialLinks?.linkedin && (
                <a href={user.socialLinks.linkedin} target="_blank" className="block">LinkedIn</a>
              )}
              {user.socialLinks?.github && (
                <a href={user.socialLinks.github} target="_blank" className="block">GitHub</a>
              )}
              {user.socialLinks?.portfolio && (
                <a href={user.socialLinks.portfolio} target="_blank" className="block">Portfolio</a>
              )}
            </div>
          </div>
        </div>

        <ProfileProjects userId={user._id} />
        <ProfileReviews userId={user._id} />

        {user.role === 'mentor' && mentorData && (
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Mentor Sessions</h3>
            <p>Coming soon...</p>
          </div>
        )}
      </div>
    </>
  );
}