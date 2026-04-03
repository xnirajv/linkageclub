'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Video, FileText, Code, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const learningPaths = [
  {
    id: '1',
    title: 'Frontend Developer',
    description: 'Master modern frontend development with React',
    progress: 65,
    duration: '8 weeks',
    lessons: 24,
    skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript'],
  },
  {
    id: '2',
    title: 'Backend Developer',
    description: 'Build scalable APIs and services',
    progress: 30,
    duration: '10 weeks',
    lessons: 32,
    skills: ['Node.js', 'Python', 'Databases', 'APIs'],
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    description: 'Become a complete web developer',
    progress: 12,
    duration: '16 weeks',
    lessons: 48,
    skills: ['MERN Stack', 'DevOps', 'System Design'],
  },
];

const resources = [
  {
    id: '1',
    title: 'React Hooks Complete Guide',
    type: 'video',
    duration: '45 min',
    author: 'Vikram Singh',
    views: 1234,
  },
  {
    id: '2',
    title: 'Understanding Async/Await',
    type: 'article',
    readTime: '10 min',
    author: 'Priya Patel',
    views: 856,
  },
  {
    id: '3',
    title: 'System Design Interview Prep',
    type: 'ebook',
    pages: 200,
    author: 'Rahul Mehta',
    downloads: 2341,
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'video':
      return Video;
    case 'article':
      return FileText;
    case 'ebook':
      return BookOpen;
    default:
      return Code;
  }
};

export default function StudentLearnPage() {
  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            Learning Hub
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Free resources to boost your skills
          </p>
        </div>

        {/* Recommended Learning Paths */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recommended Learning Paths</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/learn/paths">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningPaths.map((path) => (
              <Card key={path.id} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{path.title}</h3>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mb-4">
                  {path.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{path.progress}%</span>
                  </div>
                  <Progress value={path.progress} />
                </div>

                <div className="flex items-center gap-4 text-sm text-charcoal-500 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {path.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    {path.duration}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {path.skills.map((skill) => (
                    <Badge key={skill} variant="skill" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <Button asChild className="w-full">
                  <Link href={`/dashboard/student/learn/paths/${path.id}`}>
                    {path.progress > 0 ? 'Continue Learning' : 'Start Path'}
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Resources */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Popular Free Resources</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/learn/resources">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => {
              const Icon = getIcon(resource.type);
              return (
                <Card key={resource.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{resource.title}</h3>
                      <p className="text-sm text-charcoal-500 mb-2">
                        by {resource.author}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-charcoal-500">
                        {resource.type === 'video' && (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {resource.duration}
                          </span>
                        )}
                        {resource.type === 'article' && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {resource.readTime}
                          </span>
                        )}
                        {resource.type === 'ebook' && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {resource.pages} pages
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          👁️ {resource.views || resource.downloads}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
  );
}