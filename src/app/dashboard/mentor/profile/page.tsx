'use client';

import React from 'react';
import { MentorProfile } from '@/components/mentors/MentorProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useMentor } from '@/hooks/useMentors';
import Link from 'next/link';
import { Edit, User, Loader2 } from 'lucide-react';
import DashboardLayout from '../../layout';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  bio?: string;
}

export default function MentorProfilePage() {
  const { user } = useAuth() as { user: User | null };
  
  // ✅ Use useMentor hook for single mentor
  const { 
    mentor, 
    isLoading, 
    isError 
  } = useMentor(user?.id || '');

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-10">
          <CardContent className="py-10 text-center">
            <div className="p-3 bg-red-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <User className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading your mentor profile.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">My Profile</h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">How students see your public profile</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/dashboard/mentor/profile/edit">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>

        {/* Mentor Profile or Empty State */}
        {mentor ? (
          <MentorProfile mentor={mentor} />
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="p-4 bg-primary-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Mentor Profile Found</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't set up your mentor profile yet. Create your profile to start mentoring students.
              </p>
              <Button asChild size="lg">
                <Link href="/dashboard/mentor/profile/edit">Set Up Your Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Tips for New Mentors */}
        {!mentor && (
          <Card className="bg-primary-50 border-primary-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-primary-800 mb-2">✨ Tips for a Great Mentor Profile</h3>
              <ul className="space-y-2 text-sm text-primary-700">
                <li>• Add a professional photo to build trust</li>
                <li>• List your expertise areas clearly</li>
                <li>• Set competitive hourly rates (₹500-₹3000 recommended)</li>
                <li>• Define your availability to get more bookings</li>
                <li>• Write a detailed bio about your experience</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}