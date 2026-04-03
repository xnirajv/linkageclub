'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Star, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useMentor } from '@/hooks/useMentors';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '../../layout';

export default function MentorStudentsPage() {
  const { user } = useAuth();
  const { mentor } = useMentor(user?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const students = mentor?.sessions?.reduce((acc: any[], session: any) => {
    if (!acc.find(s => s._id === session.studentId)) {
      const studentSessions = mentor.sessions.filter(
        (s: any) => s.studentId === session.studentId
      );
      acc.push({
        _id: session.studentId,
        name: session.student?.name,
        avatar: session.student?.avatar,
        totalSessions: studentSessions.length,
        completedSessions: studentSessions.filter((s: any) => s.status === 'completed').length,
        lastSession: Math.max(...studentSessions.map((s: any) => new Date(s.date).getTime())),
        averageRating: studentSessions
          .filter((s: any) => s.studentFeedback?.rating)
          .reduce((sum: number, s: any) => sum + s.studentFeedback.rating, 0) /
          studentSessions.filter((s: any) => s.studentFeedback?.rating).length || 0,
      });
    }
    return acc;
  }, []) || [];

  const filteredStudents = students.filter((student: any) =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStudentStatus = (student: any) => {
    const daysSinceLastSession = Math.floor(
      (Date.now() - student.lastSession) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastSession < 7) return 'active';
    if (daysSinceLastSession < 30) return 'inactive';
    return 'inactive';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            My Students
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Track your students' progress and sessions
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Students Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Students</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredStudents.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-charcoal-500">No students yet</p>
              </Card>
            ) : (
              filteredStudents.map((student: any) => (
                <Card key={student._id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name?.[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{student.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={getStudentStatus(student) === 'active' ? 'success' : 'secondary'}
                            >
                              {getStudentStatus(student) === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-sm text-charcoal-500">
                              {student.totalSessions} total sessions
                            </span>
                          </div>
                        </div>
                        {student.averageRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{student.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-charcoal-100/50 rounded-lg">
                          <p className="text-xs text-charcoal-500">Completed Sessions</p>
                          <p className="text-lg font-semibold">{student.completedSessions}</p>
                        </div>
                        <div className="p-3 bg-charcoal-100/50 rounded-lg">
                          <p className="text-xs text-charcoal-500">Last Session</p>
                          <p className="text-lg font-semibold">
                            {new Date(student.lastSession).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/mentor/students/${student._id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/messages?student=${student._id}`}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filteredStudents
              .filter((s: any) => getStudentStatus(s) === 'active')
              .map((student: any) => (
                <Card key={student._id} className="p-6">
                  {/* Same student card structure */}
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            {filteredStudents
              .filter((s: any) => getStudentStatus(s) === 'inactive')
              .map((student: any) => (
                <Card key={student._id} className="p-6">
                  {/* Same student card structure */}
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}