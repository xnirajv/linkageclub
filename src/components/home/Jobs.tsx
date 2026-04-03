'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, MapPin, IndianRupee, Briefcase, Clock, Star } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  skills: string[];
  posted: string;
  verified: boolean;
}

const jobs: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    companyLogo: '/images/companies/techcorp.svg',
    location: 'Bangalore (Remote)',
    salary: '₹8-12 LPA',
    type: 'Full-time',
    experience: '1-3 years',
    skills: ['React', 'TypeScript', 'Next.js'],
    posted: '2 days ago',
    verified: true,
  },
  {
    id: '2',
    title: 'Backend Developer',
    company: 'StartupX',
    companyLogo: '/images/companies/startupx.svg',
    location: 'Mumbai (Hybrid)',
    salary: '₹10-15 LPA',
    type: 'Full-time',
    experience: '2-4 years',
    skills: ['Node.js', 'Python', 'AWS'],
    posted: '5 days ago',
    verified: true,
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'Analytics Co',
    companyLogo: '/images/companies/analytics.svg',
    location: 'Remote',
    salary: '₹12-18 LPA',
    type: 'Full-time',
    experience: '2-5 years',
    skills: ['Python', 'TensorFlow', 'SQL'],
    posted: '1 week ago',
    verified: false,
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    companyLogo: '/images/companies/cloudscale.svg',
    location: 'Hyderabad',
    salary: '₹9-14 LPA',
    type: 'Full-time',
    experience: '2-4 years',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    posted: '3 days ago',
    verified: true,
  },
];

export function Jobs() {
  return (
    <section className="bg-charcoal-100/50 py-20 dark:bg-charcoal-800">
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
              Featured Jobs
            </Badge>
            <h2 className="text-3xl font-bold text-charcoal-950 sm:text-4xl dark:text-white">
              Latest Opportunities
            </h2>
            <p className="mt-2 text-charcoal-600 dark:text-charcoal-300">
              Find your dream job from top companies
            </p>
          </div>
          <Button asChild variant="outline" className="group">
            <Link href="/jobs">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Jobs List */}
        <div className="mt-12 space-y-4">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                  {/* Company Logo */}
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={job.companyLogo} alt={job.company} />
                    <AvatarFallback>{job.company[0]}</AvatarFallback>
                  </Avatar>

                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
                      <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">
                        {job.title}
                      </h3>
                      {job.verified && (
                        <Badge variant="success" size="sm">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                      {job.company}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1 text-charcoal-600 dark:text-charcoal-400">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-charcoal-600 dark:text-charcoal-400">
                        <IndianRupee className="h-4 w-4" />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1 text-charcoal-600 dark:text-charcoal-400">
                        <Briefcase className="h-4 w-4" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1 text-charcoal-600 dark:text-charcoal-400">
                        <Clock className="h-4 w-4" />
                        {job.experience}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="skill" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Posted Time & Apply */}
                  <div className="text-right">
                    <p className="mb-2 text-sm text-charcoal-500 dark:text-charcoal-400">
                      Posted {job.posted}
                    </p>
                    <Button asChild size="sm">
                      <Link href={`/jobs/${job.id}`}>Quick Apply</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}