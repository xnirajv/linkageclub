'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface Student {
  _id: string;
  name: string;
  avatar?: string;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  lastSession: Date | number;
  isActive: boolean;
}

interface StudentListProps {
  students: Student[];
}

export function StudentList({ students }: StudentListProps) {
  return (
    <Card>
      <CardHeader><CardTitle>My Students</CardTitle></CardHeader>
      <CardContent>
        {!students.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">No students yet</p>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student._id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    <Badge variant={student.isActive ? 'success' : 'secondary'} size="sm">
                      {student.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{student.completedSessions} sessions</span>
                    {student.averageRating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {student.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href={`/dashboard/mentor/students/${student._id}`}>
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
