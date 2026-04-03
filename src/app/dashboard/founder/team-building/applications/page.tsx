'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Search,
  Star,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Briefcase,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';

interface Application {
  id: string;
  role: string;
  applicant: {
    name: string;
    avatar: string;
    email: string;
    currentRole: string;
    currentCompany: string;
    location: string;
    experience: string;
    education: string;
    skills: string[];
    matchScore: number;
  };
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  coverLetter?: string;
  answers?: { question: string; answer: string }[];
  interview?: {
    scheduled: boolean;
    date?: string;
    type?: 'video' | 'phone' | 'in-person';
  };
}

export default function TeamApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Mock data - replace with actual API
  const applications: Application[] = [
    {
      id: '1',
      role: 'Full Stack Developer',
      applicant: {
        name: 'Rahul Sharma',
        avatar: '/avatars/rahul.jpg',
        email: 'rahul@example.com',
        currentRole: 'Senior Developer',
        currentCompany: 'TechCorp',
        location: 'Bangalore',
        experience: '5 years',
        education: 'B.Tech CS, IIT Delhi',
        skills: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS'],
        matchScore: 92,
      },
      appliedAt: '2024-02-10',
      status: 'pending',
      coverLetter: 'I am excited about the opportunity to join your startup...',
    },
    {
      id: '2',
      role: 'Marketing Lead',
      applicant: {
        name: 'Priya Patel',
        avatar: '/avatars/priya.jpg',
        email: 'priya@example.com',
        currentRole: 'Marketing Manager',
        currentCompany: 'StartupX',
        location: 'Mumbai',
        experience: '4 years',
        education: 'MBA, IIM Ahmedabad',
        skills: ['Digital Marketing', 'Growth', 'SEO', 'Content Strategy'],
        matchScore: 88,
      },
      appliedAt: '2024-02-09',
      status: 'shortlisted',
      interview: {
        scheduled: true,
        date: '2024-02-15T11:00:00',
        type: 'video',
      },
    },
    {
      id: '3',
      role: 'Product Manager',
      applicant: {
        name: 'Amit Kumar',
        avatar: '/avatars/amit.jpg',
        email: 'amit@example.com',
        currentRole: 'Product Lead',
        currentCompany: 'ProductLabs',
        location: 'Delhi',
        experience: '6 years',
        education: 'B.Tech + MBA',
        skills: ['Product Strategy', 'Roadmapping', 'Agile', 'User Research'],
        matchScore: 85,
      },
      appliedAt: '2024-02-08',
      status: 'reviewed',
    },
    {
      id: '4',
      role: 'UI/UX Designer',
      applicant: {
        name: 'Neha Singh',
        avatar: '/avatars/neha.jpg',
        email: 'neha@example.com',
        currentRole: 'Senior Designer',
        currentCompany: 'DesignStudio',
        location: 'Pune',
        experience: '3 years',
        education: 'NID Ahmedabad',
        skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
        matchScore: 90,
      },
      appliedAt: '2024-02-07',
      status: 'rejected',
    },
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || app.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const pendingApps = filteredApplications.filter(app => app.status === 'pending');
  const shortlistedApps = filteredApplications.filter(app => app.status === 'shortlisted');
  const reviewedApps = filteredApplications.filter(app => app.status === 'reviewed');
  const acceptedApps = filteredApplications.filter(app => app.status === 'accepted');
  const rejectedApps = filteredApplications.filter(app => app.status === 'rejected');

  const roles = Array.from(new Set(applications.map(app => app.role)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'reviewed':
        return <Eye className="h-4 w-4" />;
      case 'shortlisted':
        return <Star className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleStatusChange = (applicationId: string, newStatus: Application['status']) => {
    console.log('Change status:', applicationId, newStatus);
    // API call to update status
  };

  const handleScheduleInterview = (applicationId: string) => {
    console.log('Schedule interview:', applicationId);
    // Open scheduling modal
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Team Applications</h1>
            <p className="text-charcoal-600">Review and manage candidates for your startup</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/founder/team-building">
              Back to Requirements
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total</p>
            <p className="text-2xl font-bold">{applications.length}</p>
          </Card>
          <Card className="p-4 bg-yellow-50">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingApps.length}</p>
          </Card>
          <Card className="p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Reviewed</p>
            <p className="text-2xl font-bold text-blue-600">{reviewedApps.length}</p>
          </Card>
          <Card className="p-4 bg-purple-50">
            <p className="text-sm text-purple-600">Shortlisted</p>
            <p className="text-2xl font-bold text-purple-600">{shortlistedApps.length}</p>
          </Card>
          <Card className="p-4 bg-green-50">
            <p className="text-sm text-green-600">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{acceptedApps.length}</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <Input
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({filteredApplications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingApps.length})</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({reviewedApps.length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({shortlistedApps.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedApps.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApps.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={app.applicant.avatar} />
                    <AvatarFallback>{app.applicant.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{app.applicant.name}</h3>
                          <Badge variant="skill">{app.role}</Badge>
                        </div>
                        <p className="text-charcoal-600">{app.applicant.currentRole} at {app.applicant.currentCompany}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-2">
                          {app.applicant.matchScore}% Match
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(app.status)}
                            {app.status}
                          </span>
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {app.applicant.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {app.applicant.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {app.applicant.education}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {app.applicant.skills.map((skill) => (
                        <Badge key={skill} variant="skill" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {app.coverLetter && (
                      <div className="mt-3 p-3 bg-charcoal-100/50 rounded-lg">
                        <p className="text-sm text-charcoal-700 line-clamp-2">{app.coverLetter}</p>
                      </div>
                    )}

                    {app.interview?.scheduled && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">
                          Interview Scheduled: {new Date(app.interview.date!).toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-600">
                          Type: {app.interview.type} • Meeting link will be shared
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/founder/team-building/applications/${app.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Full Application
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      
                      {app.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-blue-600"
                            onClick={() => handleStatusChange(app.id, 'reviewed')}
                          >
                            Mark Reviewed
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-purple-600"
                            onClick={() => handleStatusChange(app.id, 'shortlisted')}
                          >
                            Shortlist
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {app.status === 'reviewed' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-purple-600"
                            onClick={() => handleStatusChange(app.id, 'shortlisted')}
                          >
                            Shortlist
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600"
                            onClick={() => handleScheduleInterview(app.id)}
                          >
                            Schedule Interview
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {app.status === 'shortlisted' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600"
                            onClick={() => handleStatusChange(app.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredApplications.length === 0 && (
              <Card className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications found</h3>
                <p className="text-charcoal-500">Applications will appear here when candidates apply</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingApps.map((app) => (
              <Card key={app.id} className="p-6">
                {/* Same card structure as above, filtered for pending */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={app.applicant.avatar} />
                    <AvatarFallback>{app.applicant.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {/* Content same as above */}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4">
            {reviewedApps.map((app) => (
              <Card key={app.id} className="p-6">
                {/* Reviewed applications */}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="shortlisted" className="space-y-4">
            {shortlistedApps.map((app) => (
              <Card key={app.id} className="p-6">
                {/* Shortlisted applications */}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedApps.map((app) => (
              <Card key={app.id} className="p-6">
                {/* Accepted applications */}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedApps.map((app) => (
              <Card key={app.id} className="p-6">
                {/* Rejected applications */}
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}