'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { usePosts } from '@/hooks/useCommunity';
import { Plus } from 'lucide-react';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { Feed } from '@/components/community/Feed';

export default function StudentCommunityPage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { posts, isLoading } = usePosts();

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
              Community
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Connect with fellow learners and professionals
            </p>
          </div>
          <Button onClick={() => setShowCreatePost(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        {/* Feed Tabs */}
        <Tabs defaultValue="latest">
          <TabsList>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="latest">
            <Feed
              posts={posts}
              isLoading={isLoading}
              emptyMessage="No posts yet"
            />
          </TabsContent>

          <TabsContent value="trending">
            <Feed
              posts={posts.filter(p => p.likes > 10)}
              isLoading={isLoading}
              emptyMessage="No trending posts"
            />
          </TabsContent>

          <TabsContent value="following">
            <Feed
              posts={[]}
              isLoading={isLoading}
              emptyMessage="No posts from people you follow"
            />
          </TabsContent>
        </Tabs>

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
        />
      </div>
  );
}