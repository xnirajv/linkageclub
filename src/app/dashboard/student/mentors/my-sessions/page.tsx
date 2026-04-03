'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils/format';
import {
  Calendar,
  Clock,
  Video,
  Star,
  MessageCircle,
  Search,
  XCircle,
  CheckCircle,
  Clock as ClockIcon,
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';

export default function MySessionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with actual API call
  const sessions = [
    {
      id: '1',
      mentor: {
        name: 'Vikram Singh',
        avatar: '/avatars/vikram.jpg',
        role: 'Senior Engineer at Google',
      },
      topic: 'System Design Interview Preparation',
      date: '2024-02-15T10:00:00',
      duration: 60,
      status: 'scheduled',
      amount: 1500,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '2',
      mentor: {
        name: 'Priya Patel',
        avatar: '/avatars/priya.jpg',
        role: 'Tech Lead at Amazon',
      },
      topic: 'React Performance Optimization',
      date: '2024-02-10T14:00:00',
      duration: 60,
      status: 'completed',
      amount: 1200,
      feedback: {
        rating: 5,
        comment: 'Great session! Very helpful insights.',
      },
    },
    {
      id: '3',
      mentor: {
        name: 'Rahul Mehta',
        avatar: '/avatars/rahul.jpg',
        role: 'Engineering Manager at Microsoft',
      },
      topic: 'Career Growth in Tech',
      date: '2024-02-05T11:00:00',
      duration: 60,
      status: 'cancelled',
      amount: 2000,
      cancellationReason: 'Mentor had an emergency',
    },
  ];

  const filteredSessions = sessions.filter(session =>
    session.mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingSessions = filteredSessions.filter(s => s.status === 'scheduled');
  const completedSessions = filteredSessions.filter(s => s.status === 'completed');
  const cancelledSessions = filteredSessions.filter(s => s.status === 'cancelled');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-charcoal-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  const formatSessionDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950">My Mentor Sessions</h1>
          <p className="text-charcoal-600">Track your booked and past mentoring sessions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Sessions</p>
            <p className="text-2xl font-bold">{sessions.length}</p>
          </Card>
          <Card className="p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Upcoming</p>
            <p className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</p>
          </Card>
          <Card className="p-4 bg-green-50">
            <p className="text-sm text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedSessions.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Spent</p>
            <p className="text-2xl font-bold">
              {formatCurrency(sessions.reduce((sum, s) => sum + s.amount, 0))}
            </p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search sessions by mentor or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sessions Tabs */}
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedSessions.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledSessions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                <p className="text-charcoal-500 mb-4">Book a session with a mentor to get started</p>
                <Button asChild>
                  <Link href="/dashboard/student/mentors">Find Mentors</Link>
                </Button>
              </Card>
            ) : (
              upcomingSessions.map((session) => {
                const { date, time } = formatSessionDateTime(session.date);
                return (
                  <Card key={session.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.mentor.avatar} />
                        <AvatarFallback>{session.mentor.name[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{session.topic}</h3>
                            <p className="text-charcoal-600">{session.mentor.name} • {session.mentor.role}</p>
                          </div>
                          <Badge className={getStatusColor(session.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(session.status)}
                              {session.status}
                            </span>
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {time} ({session.duration} min)
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            Video Call
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/student/mentors/${session.id}`}>
                              View Details
                            </Link>
                          </Button>
                          {session.meetingLink && (
                            <Button size="sm" asChild>
                              <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                                <Video className="mr-2 h-4 w-4" />
                                Join Meeting
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedSessions.map((session) => {
              const { date } = formatSessionDateTime(session.date);
              return (
                <Card key={session.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={session.mentor.avatar} />
                      <AvatarFallback>{session.mentor.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{session.topic}</h3>
                          <p className="text-charcoal-600">{session.mentor.name}</p>
                        </div>
                        <Badge className={getStatusColor(session.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(session.status)}
                            {session.status}
                          </span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {date}
                        </span>
                      </div>

                      {session.feedback && (
                        <div className="mt-3 p-3 bg-charcoal-100/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{session.feedback.rating}/5</span>
                          </div>
                          <p className="text-sm text-charcoal-700">{session.feedback.comment}</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          View Recording
                        </Button>
                        <Button size="sm" variant="outline">
                          Book Again
                        </Button>
                        <Button size="sm" variant="outline">
                          Leave Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledSessions.map((session) => (
              <Card key={session.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={session.mentor.avatar} />
                    <AvatarFallback>{session.mentor.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{session.topic}</h3>
                        <p className="text-charcoal-600">{session.mentor.name}</p>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(session.status)}
                          {session.status}
                        </span>
                      </Badge>
                    </div>

                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">Cancellation reason:</span> {session.cancellationReason}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Amount will be refunded within 5-7 business days
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Book with Another Mentor
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}