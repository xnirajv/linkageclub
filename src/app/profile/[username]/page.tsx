'use client';

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import User from '@/lib/db/models/user';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileSkills } from '@/components/profile/ProfileSkills';
import { ProfileProjects } from '@/components/profile/ProfileProjects';
import { ProfileReviews } from '@/components/profile/ProfileReviews';
import { Container } from '@/components/layout/Container';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { User as UserType } from '@/types';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

async function getUser(username: string): Promise<UserType | null> {
  await connectDB();

  // Remove @ if present and convert to lowercase
  const cleanUsername = username.replace('@', '').toLowerCase();

  const query = {
    $or: [
      { username: cleanUsername },  // Case-insensitive already handled by toLowerCase
      { email: username }            // Backward compatibility
    ]
  };

  const user = await User.findOne(query).lean();

  if (!user) return null;

  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    trustScore: user.trustScore || 0,
    createdAt: user.createdAt || new Date(),
    skills: user.skills || [],
    badges: user.badges || [],
    socialLinks: user.socialLinks || {},
    preferences: user.preferences || {
      emailNotifications: true,
      pushNotifications: true,
      newsletter: false,
      theme: 'system',
    },
    verification: user.verification || {
      email: false,
      phone: false,
      id: false,
      linkedin: false,
      github: false,
    },
    stats: user.stats || {
      projectsCompleted: 0,
      totalEarnings: 0,
      averageRating: 0,
      reviewsCount: 0,
      sessionsAttended: 0,
      daysActive: 0,
    },
    lastActive: user.lastActive || new Date(),
    updatedAt: user.updatedAt || new Date(),
    emailVerified: user.emailVerified || false,
  } as UserType;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const user = await getUser(params.username);

  if (!user) {
    return {
      title: 'User Not Found',
    };
  }

  return {
    title: `${user.name} - Profile | InternHub`,
    description: user.bio || `View ${user.name}'s profile on InternHub`,
    openGraph: {
      title: `${user.name} - InternHub Profile`,
      description: user.bio || `View ${user.name}'s profile`,
      images: [user.avatar || '/default-avatar.png'],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getUser(params.username);

  if (!user) {
    notFound();
  }

  // Get mentor data if user is a mentor
  let mentorData: Record<string, unknown> | null = null;
  if (user.role === 'mentor') {
    const mentor = await Mentor.findOne({ userId: user._id }).lean();
    if (mentor) {
      mentorData = {
        ...mentor,
        _id: mentor._id.toString(),
        userId: mentor.userId.toString(),
      };
    }
  }

  return (
    <Container size="lg" className="py-8">
      {/* Profile Header */}
      <ProfileHeader
        user={user}
        isOwnProfile={false}
        onEdit={() => { }}
        onShare={() => { }}
      />

      {/* Profile Stats */}
      <div className="mt-8">
        <ProfileStats user={user} mentorData={mentorData} />
      </div>

      {/* ✅ FIX: ProfileTabs - children hata diya, ab sirf user pass karo */}
      <div className="mt-8">
        <ProfileTabs user={user} />
      </div>

      {/* ✅ Tab content alag se render karo ProfileTabs ke BAHAR */}
      <div className="mt-6 space-y-6">
        {/* Overview Tab Content */}
        <div className="space-y-6">
          {user.bio && (
            <div className="bg-card dark:bg-charcoal-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-charcoal-600 dark:text-charcoal-400">{user.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <ProfileSkills skills={user.skills} />
            )}

            {/* Location & Social */}
            <div className="bg-card dark:bg-charcoal-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              {user.location && (
                <p className="text-charcoal-600 dark:text-charcoal-400 mb-2">
                  📍 {user.location}
                </p>
              )}
              {user.socialLinks && (
                <div className="space-y-2">
                  {user.socialLinks.linkedin && (
                    <a
                      href={user.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-charcoal-600 hover:text-primary-600"
                    >
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {user.socialLinks.github && (
                    <a
                      href={user.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-charcoal-600 hover:text-primary-600"
                    >
                      <span>GitHub</span>
                    </a>
                  )}
                  {user.socialLinks.portfolio && (
                    <a
                      href={user.socialLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-charcoal-600 hover:text-primary-600"
                    >
                      <span>Portfolio</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projects Tab Content */}
        <ProfileProjects userId={user._id} />

        {/* Reviews Tab Content */}
        <ProfileReviews userId={user._id} />

        {/* Mentor Sessions Tab Content */}
        {user.role === 'mentor' && mentorData && (
          <div className="bg-card dark:bg-charcoal-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Mentor Sessions</h3>
            <p className="text-charcoal-600">Coming soon...</p>
          </div>
        )}
      </div>
    </Container>
  );
}
