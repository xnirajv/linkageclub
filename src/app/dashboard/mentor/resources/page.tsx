'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useMentor } from '@/hooks/useMentors';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Video, 
  FileText, 
  BookOpen, 
  Link as LinkIcon, 
  Download, 
  Trash2, 
  Loader2,
  FileText as FileIcon // Add this for EmptyState
} from 'lucide-react';
import DashboardLayout from '../../layout';
import mongoose from 'mongoose';
import { IMentor } from '@/lib/db/models/mentor';
import { Textarea } from '@/components/forms/Textarea';

// Types
type Mentor = IMentor & {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
};

// ✅ FIX: Define Resource type properly
interface Resource {
  _id?: mongoose.Types.ObjectId | string;  // _id optional with proper type
  title: string;
  description: string;
  type: 'article' | 'video' | 'course' | 'template' | 'other';
  url: string;
  tags: string[];
  downloads?: number;
  createdAt?: Date;
}

interface NewResourceForm {
  title: string;
  description: string;
  type: 'article' | 'video' | 'course' | 'template' | 'other';
  url: string;
  tags: string[];
}

export default function MentorResourcesPage() {
  const { user } = useAuth() as { user: { id: string; name: string; email: string } | null };
  
  const { 
    mentor, 
    isLoading, 
    mutate 
  } = useMentor(user?.id || '');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newResource, setNewResource] = useState<NewResourceForm>({
    title: '',
    description: '',
    type: 'article',
    url: '',
    tags: [],
  });

  // ✅ FIX: Cast resources to Resource[] type
  const resources = (mentor as Mentor)?.resources as Resource[] || [];

  // Add resource function
  const addResource = async (resource: NewResourceForm) => {
    if (!mentor?._id) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/mentors/${mentor._id.toString()}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource),
      });

      if (!response.ok) throw new Error('Failed to add resource');
      
      await mutate();
      setShowAddForm(false);
      setNewResource({ title: '', description: '', type: 'article', url: '', tags: [] });
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete resource function
  const deleteResource = async (resourceId: string) => {
    if (!mentor?._id) return;

    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/mentors/${mentor._id.toString()}/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete resource');
      
      await mutate();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource. Please try again.');
    }
  };

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.url) {
      alert('Please fill in all required fields');
      return;
    }
    await addResource(newResource);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'article':
        return FileText;
      case 'course':
        return BookOpen;
      default:
        return LinkIcon;
    }
  };

  // Filter resources by type
  const getResourcesByType = (type: string): Resource[] => {
    if (type === 'all') return resources;
    return resources.filter(r => r.type === type);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
              Resources
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Share learning materials with your students
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </div>

        {/* Add Resource Form */}
        {showAddForm && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Resource</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="e.g., React Hooks Cheat Sheet"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Brief description of the resource"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                  className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="course">Course</option>
                  <option value="template">Template</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-1">
                  URL <span className="text-red-500">*</span>
                </label>
                <Input
                  id="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  placeholder="https://example.com/resource"
                  required
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-1">
                  Tags (comma separated)
                </label>
                <Input
                  id="tags"
                  value={newResource.tags.join(', ')}
                  onChange={(e) => setNewResource({
                    ...newResource,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="react, javascript, beginner"
                />
                <p className="text-xs text-charcoal-500 mt-1">
                  {newResource.tags.length} tags added
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddResource} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Resource'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Resources Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({resources.length})</TabsTrigger>
            <TabsTrigger value="articles">
              Articles ({resources.filter(r => r.type === 'article').length})
            </TabsTrigger>
            <TabsTrigger value="videos">
              Videos ({resources.filter(r => r.type === 'video').length})
            </TabsTrigger>
            <TabsTrigger value="courses">
              Courses ({resources.filter(r => r.type === 'course').length})
            </TabsTrigger>
          </TabsList>

          {/* All Resources Tab */}
          <TabsContent value="all" className="space-y-4 mt-6">
            {getResourcesByType('all').length === 0 ? (
              <EmptyState />
            ) : (
              getResourcesByType('all').map((resource) => {
                // ✅ FIX: Safely get resource ID
                const resourceId = resource._id?.toString() || '';
                return (
                  <ResourceCard 
                    key={resourceId || Math.random().toString()}
                    resource={resource}
                    onDelete={() => deleteResource(resourceId)}
                    getIcon={getIcon}
                  />
                );
              })
            )}
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-4 mt-6">
            {getResourcesByType('article').length === 0 ? (
              <EmptyState type="article" />
            ) : (
              getResourcesByType('article').map((resource) => {
                const resourceId = resource._id?.toString() || '';
                return (
                  <ResourceCard 
                    key={resourceId}
                    resource={resource}
                    onDelete={() => deleteResource(resourceId)}
                    getIcon={getIcon}
                  />
                );
              })
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4 mt-6">
            {getResourcesByType('video').length === 0 ? (
              <EmptyState type="video" />
            ) : (
              getResourcesByType('video').map((resource) => {
                const resourceId = resource._id?.toString() || '';
                return (
                  <ResourceCard 
                    key={resourceId}
                    resource={resource}
                    onDelete={() => deleteResource(resourceId)}
                    getIcon={getIcon}
                  />
                );
              })
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4 mt-6">
            {getResourcesByType('course').length === 0 ? (
              <EmptyState type="course" />
            ) : (
              getResourcesByType('course').map((resource) => {
                const resourceId = resource._id?.toString() || '';
                return (
                  <ResourceCard 
                    key={resourceId}
                    resource={resource}
                    onDelete={() => deleteResource(resourceId)}
                    getIcon={getIcon}
                  />
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Resource Card Component
interface ResourceCardProps {
  resource: Resource;  // ✅ FIX: Use Resource type, not any
  onDelete: () => void;
  getIcon: (type: string) => any;
}

function ResourceCard({ resource, onDelete, getIcon }: ResourceCardProps) {
  const Icon = getIcon(resource.type);

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary-100 rounded-lg">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{resource.title}</h3>
              <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">{resource.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="skill" className="capitalize">
                {resource.type}
              </Badge>
              <span className="text-sm text-charcoal-500">
                {resource.downloads || 0} downloads
              </span>
            </div>
          </div>

          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {resource.tags.map((tag: string) => (
                <Badge key={tag} variant="skill" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button size="sm" asChild>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Access Resource
              </a>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Empty State Component
function EmptyState({ type = 'resource' }: { type?: string }) {
  return (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center">
        <div className="p-4 bg-charcoal-100 rounded-full mb-4">
          <FileIcon className="h-8 w-8 text-charcoal-400" />
        </div>
        <h3 className="text-lg font-medium mb-2">No {type}s found</h3>
        <p className="text-charcoal-500">
          {type === 'resource' 
            ? 'Add your first resource to share with students'
            : `No ${type}s added yet. Add your first ${type} to share with students.`
          }
        </p>
      </div>
    </Card>
  );
}