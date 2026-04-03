'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Users, UserPlus, Briefcase, X } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '../../layout';

export default function TeamBuildingPage() {
  const [showPostForm, setShowPostForm] = useState(false);
  const [teamRequirements] = useState([
    {
      id: '1',
      role: 'Full Stack Developer',
      type: 'Co-founder',
      skills: ['React', 'Node.js', 'MongoDB'],
      description: 'Looking for a technical co-founder to lead product development',
      applications: 3,
      status: 'open',
    },
    {
      id: '2',
      role: 'Marketing Lead',
      type: 'Team Member',
      skills: ['Digital Marketing', 'SEO', 'Content'],
      description: 'Need someone to handle marketing and user acquisition',
      applications: 5,
      status: 'open',
    },
  ]);

  const applicants = [
    {
      id: '1',
      name: 'Vikram Singh',
      role: 'Full Stack Developer',
      experience: '5 years',
      matchScore: 92,
      avatar: '/avatars/vikram.jpg',
      appliedFor: 'Full Stack Developer',
    },
    {
      id: '2',
      name: 'Neha Gupta',
      role: 'Marketing Manager',
      experience: '4 years',
      matchScore: 88,
      avatar: '/avatars/neha.jpg',
      appliedFor: 'Marketing Lead',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
              Team Building
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Find the right people to join your startup journey
            </p>
          </div>
          <Button onClick={() => setShowPostForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Post Requirement
          </Button>
        </div>

        {/* Post Requirement Form */}
        {showPostForm && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Post New Requirement</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowPostForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role Title *</label>
                <Input placeholder="e.g., Full Stack Developer" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role Type</label>
                <select className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3">
                  <option value="cofounder">Co-founder</option>
                  <option value="team-member">Team Member</option>
                  <option value="advisor">Advisor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skills Required</label>
                <Input placeholder="React, Node.js, MongoDB" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowPostForm(false)}>
                  Cancel
                </Button>
                <Button>Post Requirement</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="requirements">
          <TabsList>
            <TabsTrigger value="requirements">My Requirements</TabsTrigger>
            <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
            <TabsTrigger value="team">Current Team</TabsTrigger>
          </TabsList>

          <TabsContent value="requirements" className="space-y-4">
            {teamRequirements.map((req) => (
              <Card key={req.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{req.role}</h3>
                    <Badge variant="skill" className="mt-1">
                      {req.type}
                    </Badge>
                  </div>
                  <Badge variant="success">Open</Badge>
                </div>

                <p className="text-charcoal-600 mt-2">{req.description}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {req.skills.map((skill) => (
                    <Badge key={skill} variant="skill" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-charcoal-500">
                    {req.applications} applications
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/founder/team-building/${req.id}/applications`}>
                        View Applications
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      Close
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="applicants" className="space-y-4">
            {applicants.map((applicant) => (
              <Card key={applicant.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={applicant.avatar} />
                    <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{applicant.name}</h3>
                        <p className="text-sm text-charcoal-600">{applicant.role}</p>
                      </div>
                      <Badge variant="success">{applicant.matchScore}% Match</Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {applicant.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserPlus className="h-4 w-4" />
                        Applied for: {applicant.appliedFor}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm">Schedule Interview</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                      <Button size="sm" variant="outline">Message</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="team">
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Build Your Dream Team</h3>
              <p className="text-charcoal-500 mb-4">
                Start by posting requirements and reviewing applicants
              </p>
              <Button onClick={() => setShowPostForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Post Your First Requirement
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}