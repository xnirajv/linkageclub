'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePosts } from '@/hooks/useCommunity';
import { ArrowLeft, Image as ImageIcon, Link2, X } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/forms/RichTextEditor';
import { SimpleTagInput } from '@/components/forms/TagInput';

interface PollOption {
  text: string;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'link';
}

export default function CreatePostPage() {
  const router = useRouter();
  const { createPost } = usePosts();
  const [postType, setPostType] = useState<'discussion' | 'question' | 'showcase' | 'poll'>('discussion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  
  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { text: '' },
    { text: '' },
  ]);
  const [pollExpiry, setPollExpiry] = useState('');
  const [allowMultiple, setAllowMultiple] = useState(false);

  const categories = [
    'Development',
    'Career Advice',
    'Project Collaboration',
    'Mentorship',
    'Events',
    'General Discussion',
    'Showcase',
    'Q&A',
  ];

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, { text: '' }]);
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = { text: value };
    setPollOptions(updated);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleAddMedia = (type: 'image' | 'video' | 'link') => {
    const url = prompt(`Enter ${type} URL:`);
    if (url) {
      setMedia([...media, { url, type }]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const postData: any = {
        title,
        content,
        type: postType,
        category,
        tags,
        media: media.length > 0 ? media : undefined,
      };

      if (postType === 'poll') {
        postData.poll = {
          question: pollQuestion,
          options: pollOptions.filter(opt => opt.text.trim()).map(opt => ({ text: opt.text })),
          expiresAt: pollExpiry || undefined,
          allowMultiple,
        };
      }

      const result = await createPost(postData);
      if (result.success) {
        router.push(`/dashboard/student/community/post/${result.post._id}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = () => {
    if (!title.trim() || !content.trim() || !category) return false;
    if (postType === 'poll') {
      if (!pollQuestion.trim()) return false;
      const validOptions = pollOptions.filter(opt => opt.text.trim());
      if (validOptions.length < 2) return false;
    }
    return true;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/student/community">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Create Post</h1>
            <p className="text-charcoal-600">Share your thoughts, questions, or projects with the community</p>
          </div>
        </div>

        <Card className="p-6">
          {/* Post Type Selector */}
          <Tabs value={postType} onValueChange={(value) => setPostType(value as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              <TabsTrigger value="question">Question</TabsTrigger>
              <TabsTrigger value="showcase">Showcase</TabsTrigger>
              <TabsTrigger value="poll">Poll</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a descriptive title"
                maxLength={200}
              />
              <p className="text-xs text-charcoal-500 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Content - FIXED: RichTextEditor uses name prop, not value */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                name="content"
                label=""
                required
                placeholder="Write your post content here..."
                height={200}
              />
              {/* Hidden input to sync content */}
              <input type="hidden" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            {/* Poll Fields */}
            {postType === 'poll' && (
              <div className="space-y-4 p-4 bg-charcoal-100/50 rounded-lg">
                <h3 className="font-medium">Poll Details</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Poll Question <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="What would you like to ask?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Options <span className="text-red-500">*</span>
                  </label>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={option.text}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {pollOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePollOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPollOption}
                    className="mt-2"
                  >
                    Add Option
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Poll Expiry (Optional)
                    </label>
                    <Input
                      type="datetime-local"
                      value={pollExpiry}
                      onChange={(e) => setPollExpiry(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allowMultiple}
                        onChange={(e) => setAllowMultiple(e.target.checked)}
                      />
                      <span className="text-sm">Allow multiple selections</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <SimpleTagInput
                value={tags}
                onChange={setTags}
                placeholder="Add tags (press Enter to add)"
                suggestions={['react', 'javascript', 'career', 'project', 'help', 'showcase']}
              />
            </div>

            {/* Media Attachments */}
            <div>
              <label className="block text-sm font-medium mb-2">Media Attachments</label>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddMedia('image')}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddMedia('link')}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </div>

              {media.length > 0 && (
                <div className="space-y-2">
                  {media.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-charcoal-100/50 rounded">
                      <span className="text-sm truncate flex-1">
                        {item.type}: {item.url}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMedia(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/student/community')}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid()}
                isLoading={isSubmitting}
              >
                Create Post
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}