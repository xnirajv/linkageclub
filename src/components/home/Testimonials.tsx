'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  achievement: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Riya Sharma',
    role: 'Frontend Developer',
    company: 'TechCorp',
    avatar: '/images/testimonials/riya.jpg',
    content: 'InternHub completely transformed my career. I started with free learning resources, got verified, and within 3 months landed my dream job at TechCorp. The mentorship sessions were invaluable!',
    rating: 5,
    achievement: 'Placed at ₹12 LPA',
  },
  {
    id: '2',
    name: 'Amit Kumar',
    role: 'Full Stack Developer',
    company: 'StartupX',
    avatar: '/images/testimonials/amit.jpg',
    content: 'As a self-taught developer, I was struggling to get my first break. InternHub not only helped me validate my skills but also connected me with projects that paid well. Now I work full-time at a great startup.',
    rating: 5,
    achievement: 'Earned ₹2.5L in projects',
  },
  {
    id: '3',
    name: 'Priya Patel',
    role: 'Data Scientist',
    company: 'Analytics Co',
    avatar: '/images/testimonials/priya.jpg',
    content: 'The AI-powered matching is incredible! It suggested projects that perfectly matched my skills. The trust score system helped me stand out to employers. Best platform for tech professionals.',
    rating: 5,
    achievement: 'Trust Score: 95%',
  },
  {
    id: '4',
    name: 'Rahul Verma',
    role: 'Product Manager',
    company: 'ProductLabs',
    avatar: '/images/testimonials/rahul.jpg',
    content: 'I joined as a mentor and was amazed by the quality of students. The platform makes it easy to share knowledge and earn simultaneously. Already mentored 50+ students!',
    rating: 5,
    achievement: '₹50k/month as mentor',
  },
  {
    id: '5',
    name: 'Neha Singh',
    role: 'UX Designer',
    company: 'DesignStudio',
    avatar: '/images/testimonials/neha.jpg',
    content: `The community is what sets InternHub apart. I found study partners, got design feedback, and even collaborated on projects. It's more than a platform - it's a family`,
    rating: 5,
    achievement: 'Featured Designer',
  },
];

export function Testimonials() {
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
            Success Stories
          </Badge>
          <h2 className="text-3xl font-bold text-charcoal-950 sm:text-4xl dark:text-white">
            What Our Users Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-charcoal-600 dark:text-charcoal-300">
            Join thousands of students and professionals who have transformed their careers
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-wrap justify-center gap-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">10,000+</div>
            <div className="text-sm text-charcoal-600 dark:text-charcoal-400">Students Placed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">₹2.5Cr+</div>
            <div className="text-sm text-charcoal-600 dark:text-charcoal-400">Total Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">4.8/5</div>
            <div className="text-sm text-charcoal-600 dark:text-charcoal-400">Average Rating</div>
          </div>
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Carousel
            autoplay
            autoplayInterval={5000}
            opts={{ loop: true }}
          >
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id}>
                <div className="px-4">
                  <Card className="relative overflow-hidden p-8">
                    {/* Quote Icon */}
                    <div className="absolute right-8 top-8 opacity-10">
                      <Quote className="h-24 w-24 text-charcoal-950 dark:text-white" />
                    </div>

                    <div className="relative z-10">
                      {/* Rating */}
                      <div className="mb-4 flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-5 w-5',
                              i < testimonial.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-charcoal-300'
                            )}
                          />
                        ))}
                      </div>

                      {/* Content */}
                      <blockquote className="mb-6 text-lg text-charcoal-700 dark:text-charcoal-300">
                        "{testimonial.content}"
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-charcoal-950 dark:text-white">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
                            {testimonial.role} at {testimonial.company}
                          </p>
                        </div>
                        <Badge variant="success" className="ml-auto">
                          {testimonial.achievement}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}