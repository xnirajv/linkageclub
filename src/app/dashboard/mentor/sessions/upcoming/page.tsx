'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatCurrency } from '@/lib/utils/format';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import DashboardLayout from '@/app/dashboard/layout';
import { Calendar } from '@/components/ui/calendar';

// Mock data type
interface Session {
  id: string;
  student: {
    name: string;
    avatar?: string;
    topic: string;
  };
  date: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  meetingLink: string;
  amount: number;
}

export default function MentorUpcomingSessionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Mock data - replace with actual API
  const sessions: Session[] = [
    {
      id: '1',
      student: {
        name: 'Riya Sharma',
        avatar: '/avatars/riya.jpg',
        topic: 'React Performance Optimization',
      },
      date: '2024-02-15T10:00:00',
      duration: 60,
      status: 'scheduled',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      amount: 1500,
    },
    {
      id: '2',
      student: {
        name: 'Amit Kumar',
        avatar: '/avatars/amit.jpg',
        topic: 'System Design Interview Prep',
      },
      date: '2024-02-16T14:00:00',
      duration: 60,
      status: 'scheduled',
      meetingLink: 'https://meet.google.com/klm-nopq-rst',
      amount: 1500,
    },
    {
      id: '3',
      student: {
        name: 'Priya Patel',
        avatar: '/avatars/priya.jpg',
        topic: 'Career Growth Discussion',
      },
      date: '2024-02-17T11:00:00',
      duration: 45,
      status: 'scheduled',
      meetingLink: 'https://meet.google.com/uvw-xyz-123',
      amount: 1200,
    },
  ];

  const filteredSessions = sessions.filter(session =>
    session.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.student.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSessionDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      dayOfMonth: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  const handleReschedule = (sessionId: string) => {
    console.log('Reschedule session:', sessionId);
  };

  const handleCancel = (sessionId: string) => {
    console.log('Cancel session:', sessionId);
  };

  const handleStartSession = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  // Calculate stats
  const todaySessions = sessions.filter(s => {
    const today = new Date().toDateString();
    const sessionDate = new Date(s.date).toDateString();
    return sessionDate === today;
  }).length;

  const thisWeekSessions = sessions.filter(s => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    const sessionDate = new Date(s.date);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  }).length;

  const thisMonthSessions = sessions.filter(s => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const sessionDate = new Date(s.date);
    return sessionDate >= monthStart && sessionDate <= monthEnd;
  }).length;

  const totalEarnings = sessions.reduce((sum, s) => sum + s.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Upcoming Sessions</h1>
            <p className="text-charcoal-600">Manage your scheduled mentoring sessions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Today's Sessions</p>
            <p className="text-2xl font-bold">{todaySessions}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">This Week</p>
            <p className="text-2xl font-bold">{thisWeekSessions}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">This Month</p>
            <p className="text-2xl font-bold">{thisMonthSessions}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Earnings</p>
            <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <Input
              placeholder="Search by student name or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? selectedDate.toLocaleDateString() : 'Filter by Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
              {selectedDate && (
                <div className="p-3 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedDate(undefined)}
                    className="w-full"
                  >
                    Clear filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Sessions Display */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredSessions.length === 0 ? (
              <Card className="p-12 text-center">
                <CalendarIcon className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                <p className="text-charcoal-500">You don't have any scheduled sessions at the moment.</p>
              </Card>
            ) : (
              filteredSessions.map((session) => {
                const { date, time } = formatSessionDateTime(session.date);
                return (
                  <Card key={session.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.student.avatar} />
                        <AvatarFallback>{session.student.name[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{session.student.name}</h3>
                            <p className="text-charcoal-600">{session.student.topic}</p>
                          </div>
                          <Badge variant="success">Scheduled</Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
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
                          <Button size="sm" variant="default" onClick={() => handleStartSession(session.meetingLink)}>
                            <Video className="mr-2 h-4 w-4" />
                            Join Meeting
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReschedule(session.id)}>
                            Reschedule
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleCancel(session.id)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                        </div>

                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Preparation tip:</span> Review the student's goals and prepare relevant examples.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-charcoal-500 py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: 28 }).map((_, i) => {
                const day = i + 1;
                const sessionsOnDay = sessions.filter(s => new Date(s.date).getDate() === day);
                const hasSession = sessionsOnDay.length > 0;
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-24 p-2 border rounded-lg transition-colors cursor-pointer",
                      hasSession ? "bg-primary-50 border-primary-200 hover:bg-primary-100" : "hover:bg-charcoal-100/50"
                    )}
                    onClick={() => {
                      const date = new Date();
                      date.setDate(day);
                      setSelectedDate(date);
                      setViewMode('list');
                    }}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      hasSession && "text-primary-700"
                    )}>
                      {day}
                    </span>
                    {hasSession && (
                      <div className="mt-1 space-y-1">
                        {sessionsOnDay.slice(0, 2).map((s, idx) => (
                          <div key={idx} className="text-[10px] bg-card rounded px-1 py-0.5 truncate border border-primary-200">
                            {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ))}
                        {sessionsOnDay.length > 2 && (
                          <div className="text-[10px] text-primary-600 text-center">
                            +{sessionsOnDay.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}