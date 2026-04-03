'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Flag, AlertTriangle, CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';
import DashboardLayout from '../../layout';

// Define types for better TypeScript support
interface ReportedPost {
  id: string;
  title: string;
  author: string;
  reports: number;
  reasons: string[];
  reportedAt: string;
  content: string;
}

interface ReportedComment {
  id: string;
  content: string;
  author: string;
  postTitle: string;
  reports: number;
  reasons: string[];
  reportedAt: string;
}

interface ReportedProject {
  id: string;
  title: string;
  company: string;
  reports: number;
  reasons: string[];
  reportedAt: string;
}

// Mock data with proper typing
const reportedPosts: ReportedPost[] = [
  {
    id: '1',
    title: 'How to optimize React performance?',
    author: 'Riya Sharma',
    reports: 3,
    reasons: ['Spam', 'Inappropriate content'],
    reportedAt: '2024-01-20',
    content: 'This is the post content...',
  },
  {
    id: '2',
    title: 'Looking for co-founder in FinTech',
    author: 'Amit Kumar',
    reports: 2,
    reasons: ['Misleading information'],
    reportedAt: '2024-01-19',
    content: 'This is the post content...',
  },
];

const reportedComments: ReportedComment[] = [
  {
    id: '3',
    content: 'This is a reported comment...',
    author: 'Priya Patel',
    postTitle: 'React Performance Tips',
    reports: 2,
    reasons: ['Harassment'],
    reportedAt: '2024-01-20',
  },
];

const reportedProjects: ReportedProject[] = [
  {
    id: '4',
    title: 'E-commerce Platform Development',
    company: 'TechCorp',
    reports: 2,
    reasons: ['Fraudulent', 'Misleading budget'],
    reportedAt: '2024-01-18',
  },
];

type ReportedItem = ReportedPost | ReportedComment | ReportedProject;

export default function ModerationPage() {
  const [selectedItem, setSelectedItem] = useState<ReportedItem | null>(null);
  const [, setActiveTab] = useState('posts');

  // Handlers for moderation actions
  const handleViewFull = (item: ReportedItem) => {
    setSelectedItem(item);
    // Open modal or navigate to full view
    console.log('Viewing:', item);
  };

  const handleDismiss = (itemId: string) => {
    console.log('Dismissing report:', itemId);
    // API call to dismiss report
  };

  const handleRemove = (itemId: string) => {
    console.log('Removing content:', itemId);
    // API call to remove content
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            Content Moderation
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Review and manage reported content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Flag className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Reported Posts</p>
                <p className="text-xl font-bold">{reportedPosts.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Reported Comments</p>
                <p className="text-xl font-bold">{reportedComments.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Reported Projects</p>
                <p className="text-xl font-bold">{reportedProjects.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="posts" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">Posts ({reportedPosts.length})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({reportedComments.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({reportedProjects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {reportedPosts.map((post) => (
              <Card key={post.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Flag className="h-5 w-5 text-red-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <p className="text-sm text-charcoal-600">by {post.author}</p>
                      </div>
                      <Badge variant="error">{post.reports} Reports</Badge>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-charcoal-500 mb-1">Report Reasons:</p>
                      <div className="flex gap-2">
                        {post.reasons.map((reason) => (
                          <Badge key={reason} variant="warning">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-charcoal-100/50 rounded-lg">
                      <p className="text-sm text-charcoal-600 line-clamp-2">{post.content}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-charcoal-500">
                        Reported: {new Date(post.reportedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewFull(post)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Full
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600"
                          onClick={() => handleDismiss(post.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Dismiss
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRemove(post.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Remove Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {reportedComments.map((comment) => (
              <Card key={comment.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <MessageSquare className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-charcoal-600 mb-1">
                          On post: <span className="font-medium">{comment.postTitle}</span>
                        </p>
                        <p className="text-charcoal-900">{comment.content}</p>
                        <p className="text-sm text-charcoal-600 mt-1">by {comment.author}</p>
                      </div>
                      <Badge variant="error">{comment.reports} Reports</Badge>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-charcoal-500 mb-1">Report Reasons:</p>
                      <div className="flex gap-2">
                        {comment.reasons.map((reason) => (
                          <Badge key={reason} variant="warning">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-charcoal-500">
                        Reported: {new Date(comment.reportedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewFull(comment)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Full
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600"
                          onClick={() => handleDismiss(comment.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Dismiss
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRemove(comment.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Remove Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {reportedProjects.map((project) => (
              <Card key={project.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-sm text-charcoal-600">by {project.company}</p>
                      </div>
                      <Badge variant="error">{project.reports} Reports</Badge>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-charcoal-500 mb-1">Report Reasons:</p>
                      <div className="flex gap-2">
                        {project.reasons.map((reason) => (
                          <Badge key={reason} variant="warning">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-charcoal-500">
                        Reported: {new Date(project.reportedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewFull(project)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Project
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600"
                          onClick={() => handleDismiss(project.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Dismiss
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRemove(project.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Remove Project
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Optional: Display selected item details in a modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-2xl w-full mx-4 p-6">
              <h2 className="text-xl font-bold mb-4">Item Details</h2>
              <pre className="bg-charcoal-100/50 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setSelectedItem(null)}>Close</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}