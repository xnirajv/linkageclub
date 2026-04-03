'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Calendar, Clock, Eye } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  image: string;
  publishedAt: string;
  readTime: number;
  views: number;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 React Hooks Every Developer Should Know',
    excerpt: 'Master React development with these essential hooks that will level up your components.',
    author: {
      name: 'Riya Sharma',
      avatar: '/images/blog/authors/riya.jpg',
    },
    category: 'Development',
    image: '/images/blog/react-hooks.jpg',
    publishedAt: '2024-01-15',
    readTime: 8,
    views: 1234,
  },
  {
    id: '2',
    title: 'How to Land Your First Tech Internship in 2024',
    excerpt: 'A comprehensive guide for students looking to break into tech. Learn proven strategies.',
    author: {
      name: 'Amit Kumar',
      avatar: '/images/blog/authors/amit.jpg',
    },
    category: 'Career',
    image: '/images/blog/internship-guide.jpg',
    publishedAt: '2024-01-12',
    readTime: 12,
    views: 2567,
  },
  {
    id: '3',
    title: 'Understanding System Design: A Beginner\'s Guide',
    excerpt: 'Demystify system design concepts and learn how to architect scalable applications.',
    author: {
      name: 'Vikram Singh',
      avatar: '/images/blog/authors/vikram.jpg',
    },
    category: 'System Design',
    image: '/images/blog/system-design.jpg',
    publishedAt: '2024-01-10',
    readTime: 15,
    views: 1890,
  },
];

export function Blog() {
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
              Latest from Blog
            </Badge>
            <h2 className="text-3xl font-bold text-charcoal-950 sm:text-4xl dark:text-white">
              Insights & Tutorials
            </h2>
            <p className="mt-2 text-charcoal-600 dark:text-charcoal-300">
              Stay updated with the latest in tech and career development
            </p>
          </div>
          <Button asChild variant="outline" className="group">
            <Link href="/blog">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Blog Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                <Link href={`/blog/${post.id}`}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute left-4 top-4">
                      <Badge variant="skill" className="bg-card/90 backdrop-blur-sm">
                        {post.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="mb-2 font-semibold text-charcoal-950 group-hover:text-primary-600 dark:text-white line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mb-4 text-sm text-charcoal-600 dark:text-charcoal-400 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{post.author.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-charcoal-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </span>
                      </div>
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