'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';

// Mock data - replace with actual API
const pendingCompanies = [
  {
    id: '1',
    name: 'TechCorp',
    email: 'contact@techcorp.com',
    documents: ['GST Certificate', 'Company Registration'],
    submittedAt: '2024-01-20',
    logo: '/avatars/techcorp.jpg',
  },
  {
    id: '2',
    name: 'StartupX',
    email: 'hello@startupx.com',
    documents: ['GST Certificate', 'PAN Card'],
    submittedAt: '2024-01-19',
    logo: '/avatars/startupx.jpg',
  },
];

const pendingMentors = [
  {
    id: '3',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    expertise: ['React', 'Node.js', 'System Design'],
    experience: '8 years',
    company: 'Google',
    submittedAt: '2024-01-20',
    avatar: '/avatars/vikram.jpg',
  },
  {
    id: '4',
    name: 'Priya Patel',
    email: 'priya@example.com',
    expertise: ['Python', 'ML', 'Data Science'],
    experience: '6 years',
    company: 'Amazon',
    submittedAt: '2024-01-18',
    avatar: '/avatars/priya.jpg',
  },
];

export default function PendingVerificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            Pending Verifications
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Review and verify user applications
          </p>
        </div>

        <Tabs defaultValue="companies">
          <TabsList>
            <TabsTrigger value="companies">
              Companies ({pendingCompanies.length})
            </TabsTrigger>
            <TabsTrigger value="mentors">
              Mentors ({pendingMentors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-4">
            {pendingCompanies.map((company) => (
              <Card key={company.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={company.logo} />
                    <AvatarFallback>{company.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{company.name}</h3>
                        <p className="text-sm text-charcoal-600">{company.email}</p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Submitted Documents:</p>
                      <div className="flex gap-2">
                        {company.documents.map((doc) => (
                          <Button key={doc} variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            {doc}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-charcoal-500">
                        Submitted: {new Date(company.submittedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Review Documents
                        </Button>
                        <Button size="sm" className="bg-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="mentors" className="space-y-4">
            {pendingMentors.map((mentor) => (
              <Card key={mentor.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mentor.avatar} />
                    <AvatarFallback>{mentor.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{mentor.name}</h3>
                        <p className="text-sm text-charcoal-600">{mentor.email}</p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-charcoal-500">Current Role</p>
                        <p className="font-medium">{mentor.company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-charcoal-500">Experience</p>
                        <p className="font-medium">{mentor.experience}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-charcoal-500 mb-1">Expertise</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.map((skill) => (
                          <Badge key={skill} variant="skill" size="sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-charcoal-500">
                        Submitted: {new Date(mentor.submittedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </Button>
                        <Button size="sm" className="bg-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
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