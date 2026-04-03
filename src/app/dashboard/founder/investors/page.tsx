'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import DashboardLayout from '../../layout';

const investors = [
  {
    id: '1',
    name: 'Accel Partners',
    type: 'VC Firm',
    stage: ['Seed', 'Series A'],
    sectors: ['SaaS', 'FinTech', 'EdTech'],
    checkSize: '$1M - $10M',
    location: 'Bangalore',
    portfolio: ['Swiggy', 'Freshworks'],
    avatar: '/avatars/accel.jpg',
  },
  {
    id: '2',
    name: 'Sequoia Capital',
    type: 'VC Firm',
    stage: ['Seed', 'Series A', 'Series B'],
    sectors: ['Technology', 'Healthcare', 'Consumer'],
    checkSize: '$5M - $50M',
    location: 'Mumbai',
    portfolio: ['Ola', 'BYJU\'S'],
    avatar: '/avatars/sequoia.jpg',
  },
  {
    id: '3',
    name: 'Kunal Shah',
    type: 'Angel Investor',
    stage: ['Seed'],
    sectors: ['FinTech', 'Consumer Tech'],
    checkSize: '$100K - $500K',
    location: 'Mumbai',
    portfolio: ['CRED', 'Mamaearth'],
    avatar: '/avatars/kunal.jpg',
  },
];

export default function InvestorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvestors = investors.filter(
    (investor) =>
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            Connect with Investors
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Find the right investors for your startup journey
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search investors by name, type, or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Active Investors</p>
                <p className="text-xl font-bold">150+</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Interested in You</p>
                <p className="text-xl font-bold">8</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Avg. Check Size</p>
                <p className="text-xl font-bold">$2.5M</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Investors List */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Investors</TabsTrigger>
            <TabsTrigger value="vc">VC Firms</TabsTrigger>
            <TabsTrigger value="angel">Angel Investors</TabsTrigger>
            <TabsTrigger value="interested">Interested in You</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredInvestors.map((investor) => (
              <Card key={investor.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={investor.avatar} />
                    <AvatarFallback>{investor.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{investor.name}</h3>
                        <p className="text-primary-600">{investor.type}</p>
                      </div>
                      <Badge variant="skill">{investor.checkSize}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-charcoal-500">Stage</p>
                        <div className="flex gap-1 mt-1">
                          {investor.stage.map((s) => (
                            <Badge key={s} variant="outline" size="sm">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-charcoal-500">Sectors</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {investor.sectors.map((s) => (
                            <Badge key={s} variant="outline" size="sm">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-charcoal-600">
                        <Calendar className="h-4 w-4" />
                        Portfolio: {investor.portfolio.join(', ')}
                      </span>
                      <span className="flex items-center gap-1 text-charcoal-600">
                        <TrendingUp className="h-4 w-4" />
                        {investor.location}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm">
                        Connect
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="ghost">
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="interested">
            <Card className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">8 Investors Interested</h3>
              <p className="text-charcoal-500 mb-4">
                Investors who have viewed your profile or shown interest
              </p>
              <Button>View Interested Investors</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}