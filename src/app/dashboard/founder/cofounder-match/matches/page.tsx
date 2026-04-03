'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Calendar,
  Briefcase,
  MapPin,
  GraduationCap,
  Award,
  Search,
  Send,
  UserPlus,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';

// Mock data - replace with actual API
const matchesData = [
  {
    id: 'm1',
    name: 'Rahul Sharma',
    role: 'Technical Co-founder',
    avatar: '/avatars/rahul.jpg',
    matchScore: 95,
    skills: ['Full Stack', 'Python', 'AWS', 'System Design'],
    experience: '8 years',
    location: 'Bangalore',
    lookingFor: 'Business Co-founder',
    bio: 'Ex-Google engineer with experience in scaling products to millions of users. Looking for a business-focused co-founder to build the next big thing in EdTech.',
    education: 'B.Tech CS, IIT Delhi',
    pastStartups: ['EduTech Startup (Acquired)', 'SaaS Platform'],
    availability: 'Immediate',
    investmentCapacity: '₹10-20L',
    connected: false,
    status: 'pending',
  },
  {
    id: 'm2',
    name: 'Priya Patel',
    role: 'Business Co-founder',
    avatar: '/avatars/priya.jpg',
    matchScore: 92,
    skills: ['Strategy', 'Marketing', 'Sales', 'Fundraising'],
    experience: '6 years',
    location: 'Mumbai',
    lookingFor: 'Technical Co-founder',
    bio: 'MBA from IIM Ahmedabad, helped scale 2 startups to acquisition. Strong network in VC and angel investor community.',
    education: 'MBA, IIM Ahmedabad',
    pastStartups: ['FinTech Startup (Series A)', 'E-commerce Platform'],
    availability: '1 month',
    investmentCapacity: '₹5-10L',
    connected: true,
    status: 'connected',
    lastActive: '2024-02-15T10:30:00',
  },
  {
    id: 'm3',
    name: 'Amit Kumar',
    role: 'Product Co-founder',
    avatar: '/avatars/amit.jpg',
    matchScore: 88,
    skills: ['Product Management', 'UI/UX', 'Growth', 'Analytics'],
    experience: '5 years',
    location: 'Delhi',
    lookingFor: 'Technical Co-founder',
    bio: 'Product lead at multiple successful startups. Passionate about consumer tech and user experience.',
    education: 'B.Tech + MBA, BITS Pilani',
    pastStartups: ['Consumer App (5M users)', 'SaaS Product'],
    availability: 'Immediate',
    investmentCapacity: '₹5-8L',
    connected: false,
    status: 'shortlisted',
  },
  {
    id: 'm4',
    name: 'Neha Singh',
    role: 'Technical Co-founder',
    avatar: '/avatars/neha.jpg',
    matchScore: 85,
    skills: ['Mobile Dev', 'React Native', 'Firebase', 'Node.js'],
    experience: '4 years',
    location: 'Pune',
    lookingFor: 'Business Co-founder',
    bio: 'Built and launched 3 mobile apps with 100K+ downloads. Looking for a business partner to take the next step.',
    education: 'B.Tech CS, VIT',
    pastStartups: ['Mobile Apps (Indie)', 'Freelance Projects'],
    availability: '2 weeks',
    investmentCapacity: '₹2-5L',
    connected: false,
    status: 'pending',
  },
  {
    id: 'm5',
    name: 'Vikram Singh',
    role: 'Technical Co-founder',
    avatar: '/avatars/vikram.jpg',
    matchScore: 82,
    skills: ['AI/ML', 'Python', 'TensorFlow', 'Data Science'],
    experience: '7 years',
    location: 'Hyderabad',
    lookingFor: 'Business Co-founder',
    bio: 'ML engineer with experience in healthcare and fintech. Looking to build an AI-first startup.',
    education: 'M.Tech AI, IIIT Hyderabad',
    pastStartups: ['HealthTech MVP', 'ML Consulting'],
    availability: '1 month',
    investmentCapacity: '₹8-15L',
    connected: false,
    status: 'rejected',
  },
];

export default function FounderMatchesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMatches = matchesData.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || match.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Connected</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'shortlisted':
        return <Badge variant="info">Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-charcoal-600';
  };

  const handleConnect = (match: any) => {
    setSelectedMatch(match);
    setShowConnectDialog(true);
  };

  const handleSendConnectRequest = () => {
    console.log('Sending connect request to:', selectedMatch?.name, 'Message:', connectMessage);
    setShowConnectDialog(false);
    setConnectMessage('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/founder/cofounder-match">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">My Matches</h1>
            <p className="text-charcoal-600">View and manage your co-founder matches</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Matches</p>
            <p className="text-2xl font-bold">{matchesData.length}</p>
          </Card>
          <Card className="p-4 bg-green-50">
            <p className="text-sm text-green-600">Connected</p>
            <p className="text-2xl font-bold text-green-600">
              {matchesData.filter(m => m.connected).length}
            </p>
          </Card>
          <Card className="p-4 bg-yellow-50">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {matchesData.filter(m => m.status === 'pending').length}
            </p>
          </Card>
          <Card className="p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Shortlisted</p>
            <p className="text-2xl font-bold text-blue-600">
              {matchesData.filter(m => m.status === 'shortlisted').length}
            </p>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search matches by name, role, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
            >
              <option value="all">All Status</option>
              <option value="connected">Connected</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Matches ({filteredMatches.length})</TabsTrigger>
            <TabsTrigger value="connected">Connected ({matchesData.filter(m => m.connected).length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({matchesData.filter(m => m.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({matchesData.filter(m => m.status === 'shortlisted').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={match.avatar} />
                    <AvatarFallback>{match.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{match.name}</h3>
                          {getStatusBadge(match.status)}
                        </div>
                        <p className="text-primary-600 font-medium">{match.role}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getMatchScoreColor(match.matchScore)}`}>
                          {match.matchScore}%
                        </div>
                        <p className="text-xs text-charcoal-500">Match Score</p>
                      </div>
                    </div>

                    <p className="text-charcoal-600 mt-2 line-clamp-2">{match.bio}</p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {match.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {match.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {match.education}
                      </span>
                      {match.lastActive && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Active {new Date(match.lastActive).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {match.skills.map((skill) => (
                        <Badge key={skill} variant="skill" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {match.pastStartups && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-charcoal-400" />
                        <span className="text-charcoal-600">
                          Past: {match.pastStartups.join(' • ')}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-charcoal-500">Looking for</p>
                        <p className="font-medium">{match.lookingFor}</p>
                      </div>
                      <div>
                        <p className="text-charcoal-500">Availability</p>
                        <p className="font-medium">{match.availability}</p>
                      </div>
                      <div>
                        <p className="text-charcoal-500">Investment</p>
                        <p className="font-medium">{match.investmentCapacity}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      {!match.connected ? (
                        <Button onClick={() => handleConnect(match)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Connect
                        </Button>
                      ) : (
                        <Button variant="outline" asChild>
                          <Link href={`/messages/${match.id}`}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                      <Button variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Call
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="connected" className="space-y-4">
            {filteredMatches.filter(m => m.connected).map((match) => (
              // Same card structure as above
              <Card key={match.id} className="p-6">
                {/* ... card content ... */}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filteredMatches.filter(m => m.status === 'pending').map((match) => (
              // Same card structure as above
              <Card key={match.id} className="p-6">
                {/* ... card content ... */}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="shortlisted" className="space-y-4">
            {filteredMatches.filter(m => m.status === 'shortlisted').map((match) => (
              // Same card structure as above
              <Card key={match.id} className="p-6">
                {/* ... card content ... */}
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Connect Dialog */}
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect with {selectedMatch?.name}</DialogTitle>
              <DialogDescription>
                Send a personalized message to introduce yourself and your startup idea.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedMatch && (
                <div className="flex items-center gap-3 p-3 bg-charcoal-100/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedMatch.avatar} />
                    <AvatarFallback>{selectedMatch.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedMatch.name}</p>
                    <p className="text-sm text-charcoal-500">{selectedMatch.role}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder={`Hi ${selectedMatch?.name}, I came across your profile and think we might be a great match. I'm building a startup in the EdTech space and looking for a technical co-founder. Would love to connect and discuss further.`}
                  rows={4}
                />
                <p className="text-xs text-charcoal-500 mt-1">
                  Tip: Be specific about your startup idea and why you think they'd be a good fit.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendConnectRequest}>
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}