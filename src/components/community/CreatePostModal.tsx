'use client';

import React, { useState } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePosts } from '@/hooks/useCommunity';
import { PostType } from '@/types/community';
import { X } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POST_TYPES: PostType[] = ['discussion', 'question', 'showcase', 'poll', 'announcement'];

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { createPost } = usePosts();
  const [type, setType] = useState<PostType>('discussion');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTag('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await createPost({ type, title, content, tags, category: 'general' });
      setTitle('');
      setContent('');
      setTags([]);
      onClose();
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Create a Post</ModalTitle>
        </ModalHeader>

        <div className="space-y-4 py-4">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Post Type</label>
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map((t) => (
                <Badge
                  key={t}
                  variant={type === t ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => setType(t)}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title <span className="text-error-600">*</span></label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content <span className="text-error-600">*</span></label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[120px]"
              placeholder="Share your thoughts, questions, or ideas..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
                placeholder="Add a tag and press Enter"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <Badge key={t} variant="skill" className="gap-1">
                  #{t}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setTags(tags.filter((tag) => tag !== t))} />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!title.trim() || !content.trim()}>
            Post
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
