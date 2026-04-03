'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Briefcase, ArrowRight, Sparkles, MapPin, TrendingUp, Clock, Mail, Gem } from 'lucide-react';

interface Talent {
  _id: string;
  name: string;
  avatar?: string;
  skills: string[];
  trustScore: number;
  hourlyRate?: number;
  location?: string;
  availability?: string;
}

interface RecommendedTalentProps {
  onViewAll?: () => void;
  onTalentClick?: (id: string) => void;
}

export function RecommendedTalent({ onViewAll, onTalentClick }: RecommendedTalentProps) {
  // Mock data - replace with actual API
  const talents: Talent[] = [
    {
      _id: '1',
      name: 'Riya Sharma',
      location: 'Mumbai, India',
      skills: ['React', 'Node.js', 'TypeScript'],
      trustScore: 95,
      hourlyRate: 1500,
      availability: 'Available now',
    },
    {
      _id: '2',
      name: 'Amit Kumar',
      location: 'Bangalore, India',
      skills: ['Python', 'Django', 'PostgreSQL'],
      trustScore: 88,
      hourlyRate: 1200,
      availability: 'Available in 2 weeks',
    },
    {
      _id: '3',
      name: 'Priya Patel',
      location: 'Pune, India',
      skills: ['UI/UX', 'Figma', 'Adobe XD'],
      trustScore: 92,
      hourlyRate: 1800,
      availability: 'Available now',
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-950/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <Gem className="h-4 w-4 text-primary-600" />
            </div>
            Recommended Talent
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Top matches based on your hiring history
        </p>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {talents.map((talent) => (
            <div
              key={talent._id}
              className="group p-4 rounded-xl border border-charcoal-100 dark:border-charcoal-800 bg-card dark:bg-charcoal-900 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onTalentClick?.(talent._id)}
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800">
                  <AvatarImage src={talent.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-semibold">
                    {getInitials(talent.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-charcoal-950 dark:text-white group-hover:text-primary-600 transition-colors">
                        {talent.name}
                      </p>
                      {talent.location && (
                        <p className="text-xs text-charcoal-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {talent.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                        {talent.trustScore}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="font-medium text-primary-600 dark:text-primary-400">
                      ₹{talent.hourlyRate}/hr
                    </span>
                    {talent.availability && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Clock className="h-3 w-3" />
                        {talent.availability}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {talent.skills.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="skill" size="sm" className="bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300">
                        {skill}
                      </Badge>
                    ))}
                    {talent.skills.length > 3 && (
                      <span className="text-xs text-charcoal-400">
                        +{talent.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 gap-1"
                >
                  <Briefcase className="h-3 w-3" />
                  Hire
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-800 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-primary-500" />
            <span>{talents.length} recommended talents</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span>Based on your project needs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}