'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Award, Briefcase } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,221,214,0.28),transparent_28%),linear-gradient(135deg,rgba(52,74,134,0.96),rgba(64,119,148,0.94)_58%,rgba(75,73,69,0.92))]" />
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="absolute left-0 top-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Badge variant="skill" className="mb-4 bg-card/20 text-white border-white/30">
            Join 10,000+ Students
          </Badge>
          
          <h2 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Ready to Start Your Journey?
          </h2>
          
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Join thousands of students who have already transformed their careers with InternHub.
            From learning to earning - everything in one platform.
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-white/80" />
                <span className="text-2xl font-bold text-white">10k+</span>
              </div>
              <p className="text-sm text-white/80">Active Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Award className="h-5 w-5 text-white/80" />
                <span className="text-2xl font-bold text-white">500+</span>
              </div>
              <p className="text-sm text-white/80">Companies</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Briefcase className="h-5 w-5 text-white/80" />
                <span className="text-2xl font-bold text-white">Rs2.5Cr+</span>
              </div>
              <p className="text-sm text-white/80">Total Earnings</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link href="/signup">
                Join Free Today
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card hover:text-charcoal-950">
              <Link href="/signup?role=company">
                Hire Talent
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-white/80">
            <span>No credit card required</span>
            <span>Free forever plan</span>
            <span>30-day money-back guarantee</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
