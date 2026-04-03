'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Mail } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
  email?: string;
}

export function TeamMembers() {
  // Mock data
  const members: TeamMember[] = [
    { _id: '1', name: 'Rohan Mehta', role: 'CTO', email: 'rohan@example.com' },
    { _id: '2', name: 'Priya Singh', role: 'CMO', email: 'priya@example.com' },
    { _id: '3', name: 'Amit Kumar', role: 'Lead Developer', email: 'amit@example.com' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary-600" />
          Team Members
        </CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Invite
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member._id} className="flex items-center justify-between p-2 hover:bg-charcoal-100/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {member.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-charcoal-500">{member.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}