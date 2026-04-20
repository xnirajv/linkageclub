'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Mail, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileClientWrapperProps {
  user: any;
  mentorData: any;
}

export default function ProfileClientWrapper({ user, mentorData }: ProfileClientWrapperProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header - Same as dashboard */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar src={user.avatar} alt={user.name} size="xl" />
          
          <div className="flex-1">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-500 text-sm">
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </p>
              </div>
              <Badge variant="outline">Trust Score: {user.trustScore || 0}%</Badge>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              {user.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {format(new Date(user.createdAt), 'dd MMM yyyy')}</span>
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-gray-700">{user.bio}</p>
            )}

            {/* Social Links */}
            {user.socialLinks && (
              <div className="flex gap-3 mt-4">
                {user.socialLinks.linkedin && (
                  <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline text-sm">LinkedIn</a>
                )}
                {user.socialLinks.github && (
                  <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer"
                     className="text-gray-700 hover:underline text-sm">GitHub</a>
                )}
                {user.socialLinks.portfolio && (
                  <a href={user.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                     className="text-green-600 hover:underline text-sm">Portfolio</a>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{user.stats?.projectsCompleted || 0}</p>
          <p className="text-xs text-gray-500">Projects</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{user.skills?.length || 0}</p>
          <p className="text-xs text-gray-500">Skills</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{mentorData?.stats?.completedSessions || 0}</p>
          <p className="text-xs text-gray-500">Sessions</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{user.trustScore || 0}%</p>
          <p className="text-xs text-gray-500">Trust Score</p>
        </Card>
      </div>

      {/* Skills Section */}
      {user.skills && user.skills.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill: any, idx: number) => (
              <Badge key={idx} variant="secondary">{skill.name}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Work Experience */}
      {user.experience && user.experience.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Work Experience</h2>
          {user.experience.map((exp: any, idx: number) => (
            <div key={idx} className="mb-4">
              <p className="font-medium">{exp.title}</p>
              <p className="text-sm text-gray-600">{exp.company}</p>
            </div>
          ))}
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Work Experience</h2>
          <p className="text-gray-500">No work experience added yet</p>
        </Card>
      )}

      {/* CTA - Message Button (instead of Edit) */}
      <div className="text-center">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Send Message
        </button>
      </div>
    </div>
  );
}