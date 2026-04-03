import { User } from './user';

export type PostType = 'discussion' | 'question' | 'showcase' | 'poll' | 'announcement';
export type MediaType = 'image' | 'video' | 'link';

export interface PostMedia {
  url: string;
  type: MediaType;
  thumbnail?: string;
}

export interface PollOption {
  _id?: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Poll {
  question: string;
  options: PollOption[];
  expiresAt?: Date;
  allowMultiple: boolean;
}

export interface PostReport {
  userId: string;
  reason: string;
  reportedAt: Date;
}

export interface Post {
  _id: string;
  authorId: string;
  title: string;
  content: string;
  type: PostType;
  category: string;
  tags: string[];
  poll?: Poll;
  media?: PostMedia[];
  
  // Stats
  likes: number;
  likedBy: string[];
  comments: number;
  shares: number;
  views: number;
  saves: number;
  savedBy: string[];
  
  // Moderation
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;
  isDeleted: boolean;
  reportedBy: PostReport[];
  reportCount: number;
  
  // Timestamps
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  author?: User;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Comment {
  _id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  content: string;
  media?: PostMedia[];
  
  // Stats
  likes: number;
  likedBy: string[];
  replies?: number | Comment[];
  
  // Moderation
  isHidden: boolean;
  isDeleted: boolean;
  reportedBy: PostReport[];
  reportCount: number;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  author?: User;
  isLiked?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  count: number;
  lastActivity?: Date;
}

export interface Tag {
  _id: string;
  name: string;
  count: number;
}
