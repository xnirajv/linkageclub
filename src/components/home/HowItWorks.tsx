'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserPlus, BookOpen, Award, Briefcase } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    icon: UserPlus,
    title: 'Join InternHub',
    description: 'Create your free account and complete your profile',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: BookOpen,
    title: 'Learn Skills',
    description: 'Access free resources and structured learning paths',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Award,
    title: 'Get Verified',
    description: 'Take assessments, earn badges, build trust score',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Briefcase,
    title: 'Start Earning',
    description: 'Work on projects, find jobs, grow your career',
    color: 'from-orange-500 to-orange-600',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-card py-20 dark:bg-charcoal-900">
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
            Simple Process
          </Badge>
          <h2 className="text-3xl font-bold text-charcoal-950 sm:text-4xl dark:text-white">
            From Learning to Earning in 4 Simple Steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-charcoal-600 dark:text-charcoal-300">
            Our platform makes it easy to start your journey and achieve your goals
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-full top-1/2 hidden w-full -translate-y-1/2 lg:block">
                      <div className="relative">
                        <div className="absolute left-0 top-1/2 h-0.5 w-full bg-gradient-to-r from-gray-200 to-gray-200 dark:from-gray-700 dark:to-gray-700">
                          <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rotate-45 border-t-2 border-r-2 border-charcoal-300 dark:border-charcoal-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  <Card className="relative p-6 text-center hover:shadow-lg transition-shadow">
                    {/* Step Number */}
                    <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal-100 text-sm font-bold text-charcoal-700 dark:bg-charcoal-700 dark:text-charcoal-300">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className={`
                      mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl
                      bg-gradient-to-r text-white shadow-lg ${step.color}
                    `}>
                      <Icon className="h-8 w-8" />
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-charcoal-950 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-charcoal-600 dark:text-charcoal-400">
                      {step.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button asChild size="lg" className="group">
            <Link href="/signup">
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
