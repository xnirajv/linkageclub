'use client';

import React, { useState } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalTitle,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Check, Copy, Twitter, Linkedin } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  title: string;
}

export function ShareModal({ isOpen, onClose, postId, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/dashboard/student/community/post/${postId}`
    : '';

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-sm">
        <ModalHeader>
          <ModalTitle>Share Post</ModalTitle>
        </ModalHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
            <span className="flex-1 text-sm truncate text-muted-foreground">{url}</span>
            <Button variant="ghost" size="icon-sm" onClick={copy}>
              {copied ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={shareTwitter}>
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={shareLinkedin}>
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
