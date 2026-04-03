'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, Briefcase, Award } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const companies = [
  { name: 'Google', logo: '/images/companies/google.svg' },
  { name: 'Microsoft', logo: '/images/companies/microsoft.svg' },
  { name: 'Amazon', logo: '/images/companies/amazon.svg' },
  { name: 'Flipkart', logo: '/images/companies/flipkart.svg' },
  { name: 'Paytm', logo: '/images/companies/paytm.svg' },
  { name: 'Zomato', logo: '/images/companies/zomato.svg' },
];

const rotatingTexts = [
  'Tech Talent',
  'Learning Hub',
  'Career Launchpad',
  'Project Marketplace',
  'Mentor Connect',
];

export function Hero() {
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-charcoal-950 dark:via-gray-900 dark:to-gray-800">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-900/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary-200/30 blur-3xl dark:bg-secondary-900/20" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Trust Badges */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Badge variant="skill" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                4.8/5 (10k+ reviews)
              </Badge>
              <Badge variant="skill" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                10k+ Students
              </Badge>
              <Badge variant="skill" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                500+ Companies
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-charcoal-950 sm:text-5xl md:text-6xl dark:text-white">
              India's #1
              <span className="block text-primary-600 dark:text-primary-400">
                AI-Powered
              </span>
            </h1>

            {/* Rotating Text */}
            <div className="mt-2 h-16 sm:h-20">
              <motion.div
                key={currentTextIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-secondary-600 sm:text-4xl md:text-5xl dark:text-secondary-400"
              >
                {rotatingTexts[currentTextIndex]}
              </motion.div>
            </div>

            {/* Subheadline */}
            <p className="mt-6 text-lg text-charcoal-600 dark:text-charcoal-300">
              From Learning to Earning - Everything in One Platform. 
              Learn skills, get verified, work on real projects, and get hired.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Button asChild size="lg" className="group">
                <Link href="/signup">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup?role=company">Hire Talent</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center justify-center gap-6 lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-success-100 p-1 dark:bg-success-900">
                  <Award className="h-4 w-4 text-success-600 dark:text-success-400" />
                </div>
                <span className="text-sm text-charcoal-600 dark:text-charcoal-400">Verified Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-success-100 p-1 dark:bg-success-900">
                  <Star className="h-4 w-4 text-success-600 dark:text-success-400" />
                </div>
                <span className="text-sm text-charcoal-600 dark:text-charcoal-400">Trust Score System</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto h-[400px] w-full lg:h-[500px]">
              <Image
                src="/images/hero-illustration.svg"
                alt="InternHub Platform Illustration"
                fill
                className="object-contain"
                priority
              />
              
              {/* Floating Stats Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute left-0 top-1/4 rounded-lg bg-card p-3 shadow-lg dark:bg-charcoal-800"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500">Active Students</p>
                    <p className="text-sm font-bold">10,000+</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute right-0 top-1/2 rounded-lg bg-card p-3 shadow-lg dark:bg-charcoal-800"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500">Open Projects</p>
                    <p className="text-sm font-bold">500+</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute bottom-1/4 left-1/4 rounded-lg bg-card p-3 shadow-lg dark:bg-charcoal-800"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-success-100 flex items-center justify-center">
                    <Award className="h-4 w-4 text-success-600" />
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500">Total Earnings</p>
                    <p className="text-sm font-bold">₹2.5Cr+</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Trusted By Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <p className="text-center text-sm font-medium text-charcoal-500 dark:text-charcoal-400">
            Trusted by 500+ leading companies
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
            {companies.map((company) => (
              <div
                key={company.name}
                className="relative h-8 w-24 transition-all hover:opacity-100 hover:grayscale-0"
              >
                <Image
                  src={company.logo}
                  alt={company.name}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0">
        <svg
          className="relative block h-16 w-full"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white dark:fill-gray-900"
          ></path>
        </svg>
      </div>
    </section>
  );
}
