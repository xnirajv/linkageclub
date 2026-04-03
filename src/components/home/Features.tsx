'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Building2,
  Users,
  Rocket,
  CheckCircle,
  ArrowRight,
  Brain,
  Shield,
  Zap,
  Target,
  Trophy,
  Globe,
} from 'lucide-react';

const studentFeatures = [
  {
    icon: GraduationCap,
    title: 'Free Learning Resources',
    description: 'Access high-quality tutorials, articles, and learning paths',
  },
  {
    icon: Shield,
    title: 'Skill Assessments',
    description: 'Get verified with our AI-powered skill tests and earn badges',
  },
  {
    icon: Rocket,
    title: 'Real Project Work',
    description: 'Work on paid projects from real companies',
  },
  {
    icon: Trophy,
    title: 'Job Placements',
    description: 'Get hired by our 500+ partner companies',
  },
  {
    icon: Users,
    title: 'Mentor Guidance',
    description: 'Learn from industry experts through 1-on-1 sessions',
  },
  {
    icon: Brain,
    title: 'AI Recommendations',
    description: 'Personalized project and job suggestions based on your skills',
  },
];

const companyFeatures = [
  {
    icon: Building2,
    title: 'Pre-verified Talent',
    description: 'Access students with verified skills and Trust Scores',
  },
  {
    icon: Target,
    title: 'Post Projects & Jobs',
    description: 'Find freelancers or full-time employees',
  },
  {
    icon: Zap,
    title: 'AI-Powered Matching',
    description: 'Get matched with the perfect candidates automatically',
  },
  {
    icon: Shield,
    title: 'Trust Score System',
    description: 'Make informed hiring decisions with our trust metrics',
  },
  {
    icon: Users,
    title: 'Bulk Hiring',
    description: 'Hire multiple students for your projects',
  },
  {
    icon: Globe,
    title: 'Pan-India Access',
    description: 'Find talent from across India, not just metros',
  },
];

export function Features() {
  return (
    <section className="bg-charcoal-100/50 py-20 dark:bg-charcoal-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Badge variant="skill" className="mb-4">
            Why Choose InternHub
          </Badge>
          <h2 className="text-3xl font-bold text-charcoal-950 sm:text-4xl dark:text-white">
            Everything you need to succeed
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-charcoal-600 dark:text-charcoal-300">
            Whether you're a student looking to start your career or a company
            looking for talent, we've got you covered.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* For Students */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden p-8">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-16 translate-y-16 transform rounded-full bg-primary-100 opacity-20" />
              
              <div className="relative">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900">
                    <GraduationCap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal-950 dark:text-white">
                    For Students
                  </h3>
                </div>

                <p className="mb-6 text-charcoal-600 dark:text-charcoal-300">
                  Start your journey from learning to earning. Get the skills,
                  verification, and opportunities you need.
                </p>

                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                  {studentFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.title} className="flex items-start gap-3">
                        <div className="mt-1 shrink-0">
                          <CheckCircle className="h-4 w-4 text-success-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-charcoal-950 dark:text-white">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button asChild variant="default" className="group">
                  <Link href="/signup?role=student">
                    Join as Student
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* For Companies */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="relative overflow-hidden p-8">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-16 translate-y-16 transform rounded-full bg-secondary-100 opacity-20" />
              
              <div className="relative">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-secondary-100 p-3 dark:bg-secondary-900">
                    <Building2 className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal-950 dark:text-white">
                    For Companies
                  </h3>
                </div>

                <p className="mb-6 text-charcoal-600 dark:text-charcoal-300">
                  Find pre-verified talent, post projects, and hire full-time
                  employees - all powered by AI.
                </p>

                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                  {companyFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.title} className="flex items-start gap-3">
                        <div className="mt-1 shrink-0">
                          <CheckCircle className="h-4 w-4 text-success-500" />
                        </div>
                        <div>
                          <h4 className="font-medium text-charcoal-950 dark:text-white">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button asChild variant="default" className="group bg-secondary-600 hover:bg-secondary-700">
                  <Link href="/signup?role=company">
                    Hire Talent
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Additional Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8 grid gap-6 md:grid-cols-2"
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal-950 dark:text-white">
                  For Mentors
                </h3>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-300">
                  Guide students, share your expertise, and earn money
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/signup?role=mentor">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900">
                <Rocket className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal-950 dark:text-white">
                  For Founders
                </h3>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-300">
                  Find co-founders, build your startup team
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/signup?role=founder">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
