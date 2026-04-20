import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import User from '@/lib/db/models/user';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import { Container } from '@/components/layout/Container';
import { User as UserType } from '@/types';
import ProfileClientWrapper from '@/components/profile/ProfileClientWrapper';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getUser(username: string): Promise<UserType | null> {
  await connectDB();
  const cleanUsername = username.replace('@', '').toLowerCase();
  const user = await User.findOne({ username: cleanUsername }).lean();
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
    preferences: user.preferences || {},
    verification: user.verification || {},
    stats: user.stats || {},
    lastActive: user.lastActive || new Date(),
    updatedAt: user.updatedAt || new Date(),
    emailVerified: user.emailVerified || false,
  } as UserType;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);
  if (!user) return { title: 'User Not Found' };
  return { title: `${user.name} - Profile | InternHub` };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUser(username);
  if (!user) notFound();

  let mentorData = null;
  if (user.role === 'mentor') {
    const mentor = await Mentor.findOne({ userId: user._id }).lean();
    if (mentor) mentorData = JSON.parse(JSON.stringify(mentor));
  }

  // Pass data to client wrapper
  return (
    <Container size="lg" className="py-8">
      <ProfileClientWrapper user={user} mentorData={mentorData} />
    </Container>
  );
}