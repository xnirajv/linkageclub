'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  MessageCircle,  
  Loader2, 
  User,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';
import { User as UserType } from '@/types/user';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// API response type
interface UserResponse {
  user: UserType;
}

// Custom fetcher with proper typing
const fetchUser = async (url: string): Promise<UserResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

export default function MentorStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;
  
  // ✅ FIX: Use the custom fetchUser function instead of fetcher
  const { data, error, isLoading } = useSWR<UserResponse>(
    studentId ? `/api/users/${studentId}` : null,
    fetchUser, // Using custom fetcher instead of generic fetcher
    {
      onError: (err) => {
        console.error('Error fetching student:', err);
      }
    }
  );
  
  const user = data?.user;

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
  if (error) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-10">
          <CardContent className="py-10 text-center">
            <div className="p-3 bg-red-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <User className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Student</h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Failed to load student profile'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Not found state
  if (!user) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-10">
          <CardContent className="py-10 text-center">
            <div className="p-3 bg-charcoal-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <User className="h-6 w-6 text-charcoal-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Student Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The student you're looking for doesn't exist or you don't have permission to view them.
            </p>
            <Button asChild>
              <Link href="/dashboard/mentor/students">Back to Students</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format trust score color
  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Mock session data - replace with actual API call
  const mockSessions = [
    {
      _id: '1',
      topic: 'React Performance Optimization',
      date: '2024-02-15',
      status: 'completed',
      rating: 5
    },
    {
      _id: '2',
      topic: 'System Design Interview Prep',
      date: '2024-02-10',
      status: 'completed',
      rating: 4
    },
    {
      _id: '3',
      topic: 'Career Growth Discussion',
      date: '2024-02-20',
      status: 'scheduled',
      rating: null
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">Student Profile</h1>
              <p className="text-charcoal-600 dark:text-charcoal-400">
                View student details and progress
              </p>
            </div>
          </div>
          <Button asChild className="gap-2" variant="default">
            <Link href={`/messages?user=${studentId}`}>
              <MessageCircle className="h-4 w-4" />
              Message Student
            </Link>
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24 border-4 border-white -mt-12">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" /> {user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize px-3 py-1">
                    {user.role}
                  </Badge>
                </div>
                
                {user.bio && (
                  <p className="text-sm text-muted-foreground mt-3 bg-charcoal-100/50 p-3 rounded-lg">
                    {user.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  {user.location && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {user.location}
                    </span>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-4 w-4" /> {user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> 
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`flex items-center gap-1 font-medium ${getTrustScoreColor(user.trustScore)}`}>
                    <Star className="h-4 w-4 fill-current" />
                    Trust Score: {user.trustScore}%
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
                    <Briefcase className="h-4 w-4 mx-auto text-primary-600 mb-1" />
                    <p className="text-xs text-charcoal-500">Projects</p>
                    <p className="text-lg font-semibold">{user.stats?.projectsCompleted || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
                    <TrendingUp className="h-4 w-4 mx-auto text-primary-600 mb-1" />
                    <p className="text-xs text-charcoal-500">Earnings</p>
                    <p className="text-lg font-semibold">₹{(user.stats?.totalEarnings || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
                    <Star className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
                    <p className="text-xs text-charcoal-500">Rating</p>
                    <p className="text-lg font-semibold">{user.stats?.averageRating?.toFixed(1) || '0.0'}</p>
                  </div>
                  <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
                    <GraduationCap className="h-4 w-4 mx-auto text-primary-600 mb-1" />
                    <p className="text-xs text-charcoal-500">Sessions</p>
                    <p className="text-lg font-semibold">{user.stats?.sessionsAttended || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Badges Tabs */}
        <Tabs defaultValue="skills">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="skills">Skills & Expertise</TabsTrigger>
            <TabsTrigger value="badges">Earned Badges</TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                {user.skills && user.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant={skill.verified ? 'success' : 'skill'} 
                        className="capitalize px-3 py-1 text-sm"
                      >
                        {skill.name}
                        {skill.level && (
                          <span className="ml-1 text-xs opacity-75">· {skill.level}</span>
                        )}
                        {skill.verified && (
                          <span className="ml-1 text-xs">✓</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-charcoal-500 py-4">No skills added yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary-600" />
                  <CardTitle>Earned Badges</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {user.badges && user.badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {user.badges.map((badge, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-charcoal-100/50 rounded-lg">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Star className="h-4 w-4 text-yellow-600 fill-current" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-charcoal-500">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-charcoal-500 py-4">No badges earned yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Session History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {mockSessions.length > 0 ? (
              <div className="space-y-3">
                {mockSessions.map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-charcoal-100/50 transition-colors">
                    <div>
                      <h4 className="font-medium">{session.topic}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-charcoal-500">
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                        <Badge 
                          variant={
                            session.status === 'completed' ? 'success' : 
                            session.status === 'scheduled' ? 'warning' : 'outline'
                          }
                          size="sm"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      {session.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{session.rating}.0</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => router.push(`/dashboard/mentor/sessions/${session._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-charcoal-500 py-8">No sessions with this student yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}