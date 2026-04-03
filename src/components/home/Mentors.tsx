'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Star, Calendar, IndianRupee, Award } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  expertise: string[];
  rating: number;
  sessions: number;
  price: number;
  available: string;
}

const mentors: Mentor[] = [
  {
    id: '1',
    name: 'Vikram Singh',
    role: 'Senior Engineer',
    company: 'Google',
    avatar: '/images/mentors/vikram.jpg',
    expertise: ['React', 'System Design', 'Interview Prep'],
    rating: 4.9,
    sessions: 124,
    price: 1500,
    available: 'Today',
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Tech Lead',
    company: 'Amazon',
    avatar: '/images/mentors/priya.jpg',
    expertise: ['Node.js', 'AWS', 'Microservices'],
    rating: 4.8,
    sessions: 89,
    price: 1200,
    available: 'Tomorrow',
  },
  {
    id: '3',
    name: 'Rahul Mehta',
    role: 'Engineering Manager',
    company: 'Microsoft',
    avatar: '/images/mentors/rahul.jpg',
    expertise: ['Leadership', 'System Design', 'Career Growth'],
    rating: 4.7,
    sessions: 56,
    price: 2000,
    available: 'Mon',
  },
  {
    id: '4',
    name: 'Anjali Gupta',
    role: 'Data Scientist',
    company: 'Netflix',
    avatar: '/images/mentors/anjali.jpg',
    expertise: ['Python', 'ML', 'Data Analysis'],
    rating: 4.9,
    sessions: 78,
    price: 1800,
    available: 'Today',
  },
];

export function Mentors() {
  return (
    <section className="bg-card py-20 dark:bg-charcoal-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div>
            <Badge variant="skill" className="mb-4">
              Top Mentors
            </Badge>
            <h2 className="text-3xl font-bold text-charcoal-950 sm:text-4xl dark:text-white">
              Learn from Industry Experts
            </h2>
            <p className="mt-2 text-charcoal-600 dark:text-charcoal-300">
              Get personalized guidance from experienced professionals
            </p>
          </div>
          <Button asChild variant="outline" className="group">
            <Link href="/mentors">
              Find More Mentors
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Mentors Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                {/* Avatar */}
                <div className="relative mx-auto mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback>{mentor.name[0]}</AvatarFallback>
                  </Avatar>
                  {mentor.rating >= 4.8 && (
                    <div className="absolute -right-2 -top-2">
                      <Award className="h-6 w-6 text-yellow-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">
                  {mentor.name}
                </h3>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                  {mentor.role} at {mentor.company}
                </p>

                {/* Rating */}
                <div className="mt-2 flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{mentor.rating}</span>
                  <span className="text-xs text-charcoal-500">
                    ({mentor.sessions} sessions)
                  </span>
                </div>

                {/* Expertise */}
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {mentor.expertise.map((skill) => (
                    <Badge key={skill} variant="skill" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Price & Availability */}
                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-charcoal-600 dark:text-charcoal-400">
                      <IndianRupee className="h-3 w-3" />
                      Session fee
                    </span>
                    <span className="font-medium">₹{mentor.price}/hour</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-charcoal-600 dark:text-charcoal-400">
                      <Calendar className="h-3 w-3" />
                      Available
                    </span>
                    <Badge variant="success" size="sm">
                      {mentor.available}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 space-y-2">
                  <Button asChild className="w-full">
                    <Link href={`/mentors/${mentor.id}`}>View Profile</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/mentors/${mentor.id}/book`}>Book Session</Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}