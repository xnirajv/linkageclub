'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { usePosts } from '@/hooks/useCommunity';
import { ArrowLeft, Image as ImageIcon, Link2, X, Send } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([{ text: '' }, { text: '' }]);
  const [pollExpiry, setPollExpiry] = useState('');
  const [allowMultiple, setAllowMultiple] = useState(false);

  const categories = [
    'Development', 'Career Advice', 'Project Collaboration', 'Mentorship',
    'Events', 'General Discussion', 'Showcase', 'Q&A',
  ];

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    if (!category) { setError('Category is required'); return; }
    if (postType === 'poll') {
      if (!pollQuestion.trim()) { setError('Poll question is required'); return; }
      const validOptions = pollOptions.filter(opt => opt.text.trim());
      if (validOptions.length < 2) { setError('At least 2 poll options required'); return; }
    }

    setIsSubmitting(true);
    setError('');

    try {
      const postData: any = {
        title: title.trim(),
        content: content.trim(),
        type: postType,
        category,
        tags,
        media: media.length > 0 ? media : undefined,
      };

      if (postType === 'poll') {
        postData.poll = {
          question: pollQuestion.trim(),
          options: pollOptions.filter(opt => opt.text.trim()).map(opt => ({ text: opt.text.trim() })),
          expiresAt: pollExpiry || undefined,
          allowMultiple,
        };
      }

      const result = await createPost(postData);
      if (result.success) {
        router.push(`/dashboard/student/community/post/${result.post._id}`);
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = () => {
    if (!title.trim() || !content.trim() || !category) return false;
    if (postType === 'poll') {
      if (!pollQuestion.trim()) return false;
      if (pollOptions.filter(opt => opt.text.trim()).length < 2) return false;
    }
    return true;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/student/community"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Post</h1>
            <p className="text-gray-500">Share your thoughts with the community</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card className="p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <Tabs value={postType} onValueChange={(v) => setPostType(v as any)} className="mb-6">
            <TabsList>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              <TabsTrigger value="question">Question</TabsTrigger>
              <TabsTrigger value="showcase">Showcase</TabsTrigger>
              <TabsTrigger value="poll">Poll</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your post a descriptive title" maxLength={200} className="rounded-xl" />
              <p className="text-xs text-gray-400 mt-1">{title.length}/200</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Content *</label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your post content here..." rows={8} className="rounded-xl resize-none" />
            </div>

            {postType === 'poll' && (
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <h3 className="font-medium text-sm">Poll Details</h3>
                <Input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Poll question" className="rounded-xl" />
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={opt.text} onChange={(e) => { const updated = [...pollOptions]; updated[i] = { text: e.target.value }; setPollOptions(updated); }} placeholder={`Option ${i + 1}`} className="rounded-xl" />
                    {pollOptions.length > 2 && <Button variant="ghost" size="icon" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setPollOptions([...pollOptions, { text: '' }])}>Add Option</Button>
                <Input type="datetime-local" value={pollExpiry} onChange={(e) => setPollExpiry(e.target.value)} className="rounded-xl" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowMultiple} onChange={(e) => setAllowMultiple(e.target.checked)} />Allow multiple</label>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Tags</label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tags (max 5)" className="rounded-xl" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <Button variant="outline" size="sm" onClick={addTag} disabled={tags.length >= 5}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))}>{tag} <X className="h-3 w-3" /></Badge>)}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Media</label>
              <div className="flex gap-2 mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => { const url = prompt('Image URL:'); if (url) setMedia([...media, { url, type: 'image' }]); }}><ImageIcon className="h-4 w-4 mr-1" />Image</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { const url = prompt('Link URL:'); if (url) setMedia([...media, { url, type: 'link' }]); }}><Link2 className="h-4 w-4 mr-1" />Link</Button>
              </div>
              {media.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm">
                  <span className="truncate">{item.type}: {item.url}</span>
                  <Button variant="ghost" size="icon" onClick={() => setMedia(media.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!isValid() || isSubmitting}>
                {isSubmitting ? 'Posting...' : <><Send className="h-4 w-4 mr-2" />Create Post</>}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}