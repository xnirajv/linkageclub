'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Star, Clock, IndianRupee, Users } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  budget: string;
  duration: string;
  skills: string[];
  rating: number;
  applications: number;
  match: number;
  image: string;
}

const projects: Project[] = [
  {
    id: '1',
    title: 'MERN E-commerce Platform',
    company: 'TechCorp',
    companyLogo: '/images/companies/techcorp.svg',
    budget: '₹50,000 - ₹70,000',
    duration: '30 days',
    skills: ['React', 'Node.js', 'MongoDB'],
    rating: 4.9,
    applications: 24,
    match: 92,
    image: '/images/projects/ecommerce.jpg',
  },
  {
    id: '2',
    title: 'AI-Powered Dashboard',
    company: 'DataViz',
    companyLogo: '/images/companies/dataviz.svg',
    budget: '₹40,000 - ₹60,000',
    duration: '25 days',
    skills: ['Python', 'TensorFlow', 'React'],
    rating: 4.8,
    applications: 18,
    match: 88,
    image: '/images/projects/ai-dashboard.jpg',
  },
  {
    id: '3',
    title: 'Mobile Banking App',
    company: 'FinTech Ltd',
    companyLogo: '/images/companies/fintech.svg',
    budget: '₹80,000 - ₹100,000',
    duration: '45 days',
    skills: ['React Native', 'Node.js', 'PostgreSQL'],
    rating: 4.7,
    applications: 32,
    match: 85,
    image: '/images/projects/banking-app.jpg',
  },
  {
    id: '4',
    title: 'DevOps Pipeline Setup',
    company: 'CloudScale',
    companyLogo: '/images/companies/cloudscale.svg',
    budget: '₹30,000 - ₹50,000',
    duration: '20 days',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    rating: 4.9,
    applications: 15,
    match: 78,
    image: '/images/projects/devops.jpg',
  },
];

export function Projects() {
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
              Trending Projects
            </Badge>
            <h2 className="text-3xl font-bold text-charcoal-950 sm:text-4xl dark:text-white">
              Work on Real Projects
            </h2>
            <p className="mt-2 text-charcoal-600 dark:text-charcoal-300">
              Find paid projects that match your skills and interests
            </p>
          </div>
          <Button asChild variant="outline" className="group">
            <Link href="/projects">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Projects Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                <Link href={`/projects/${project.id}`}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    {/* Match Score Badge */}
                    <div className="absolute left-4 top-4">
                      <Badge variant="success" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {project.match}% Match
                      </Badge>
                    </div>

                    {/* Company Logo */}
                    <div className="absolute bottom-4 right-4">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src={project.companyLogo} alt={project.company} />
                        <AvatarFallback>{project.company[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="mb-1 font-semibold text-charcoal-950 group-hover:text-primary-600 dark:text-white">
                      {project.title}
                    </h3>
                    <p className="mb-3 text-sm text-charcoal-500 dark:text-charcoal-400">
                      {project.company}
                    </p>

                    {/* Skills */}
                    <div className="mb-3 flex flex-wrap gap-1">
                      {project.skills.map((skill) => (
                        <Badge key={skill} variant="skill" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-charcoal-600 dark:text-charcoal-400">
                          <IndianRupee className="h-3 w-3" />
                          Budget
                        </span>
                        <span className="font-medium text-charcoal-950 dark:text-white">
                          {project.budget}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-charcoal-600 dark:text-charcoal-400">
                          <Clock className="h-3 w-3" />
                          Duration
                        </span>
                        <span className="font-medium text-charcoal-950 dark:text-white">
                          {project.duration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-charcoal-600 dark:text-charcoal-400">
                          <Users className="h-3 w-3" />
                          Applications
                        </span>
                        <span className="font-medium text-charcoal-950 dark:text-white">
                          {project.applications}
                        </span>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-1 border-t pt-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{project.rating}</span>
                      <span className="text-xs text-charcoal-500">(24 reviews)</span>
                    </div>
                  </div>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}