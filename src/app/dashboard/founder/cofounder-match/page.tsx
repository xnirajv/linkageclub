'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Star, Mail, Check, X } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '../../layout';
import { Slider } from '@/components/forms/Slider';

// Mock data - replace with actual API
const potentialMatches = [
  {
    id: '1',
    name: 'Rahul Sharma',
    role: 'Technical Co-founder',
    skills: ['Full Stack', 'Python', 'AWS'],
    experience: '8 years',
    location: 'Bangalore',
    matchScore: 95,
    avatar: '/avatars/rahul.jpg',
    lookingFor: 'Business Co-founder',
    bio: 'Ex-Google engineer looking to build the next big thing in EdTech',
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Business Co-founder',
    skills: ['Strategy', 'Marketing', 'Sales'],
    experience: '6 years',
    location: 'Mumbai',
    matchScore: 88,
    avatar: '/avatars/priya.jpg',
    lookingFor: 'Technical Co-founder',
    bio: 'MBA from IIM Ahmedabad, helped scale 2 startups to acquisition',
  },
  {
    id: '3',
    name: 'Amit Kumar',
    role: 'Product Co-founder',
    skills: ['Product Management', 'UI/UX', 'Growth'],
    experience: '5 years',
    location: 'Delhi',
    matchScore: 82,
    avatar: '/avatars/amit.jpg',
    lookingFor: 'Technical Co-founder',
    bio: 'Product lead at multiple successful startups, passionate about consumer tech',
  },
];

export default function CoFounderMatchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchThreshold, setMatchThreshold] = useState(70);

  const filteredMatches = potentialMatches.filter(
    (match) =>
      match.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      match.matchScore >= matchThreshold
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            Find Your Co-founder
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Connect with like-minded founders and build your dream team
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search by name, role, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Match Score: {matchThreshold}%
              </label>
              <Slider
                value={[matchThreshold]}
                onValueChange={(value) => setMatchThreshold(value[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>
        </Card>

        {/* Results */}
        <Tabs defaultValue="matches">
          <TabsList>
            <TabsTrigger value="matches">Matches ({filteredMatches.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Requests (2)</TabsTrigger>
            <TabsTrigger value="connected">Connected (1)</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-4">
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
                        <h3 className="text-lg font-semibold">{match.name}</h3>
                        <p className="text-primary-600">{match.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {match.matchScore}% Match
                        </div>
                      </div>
                    </div>

                    <p className="text-charcoal-600 mt-2">{match.bio}</p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {match.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {match.location}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {match.skills.map((skill) => (
                        <Badge key={skill} variant="skill">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm">
                        <Check className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                      <Button size="sm" variant="outline">
                        <X className="mr-2 h-4 w-4" />
                        Pass
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/profile/${match.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {filteredMatches.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-charcoal-500">No matches found</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending">
            <Card className="p-8 text-center">
              <p className="text-charcoal-500">You have 2 pending connection requests</p>
            </Card>
          </TabsContent>

          <TabsContent value="connected">
            <Card className="p-8 text-center">
              <p className="text-charcoal-500">You are connected with 1 founder</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}