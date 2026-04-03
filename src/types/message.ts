import { User } from './user';

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
export type ConversationType = 'direct' | 'group' | 'project' | 'support';

export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface MessageReaction {
  userId: string;
  reaction: string;
  createdAt: Date;
}

export interface MessageReply {
  messageId: string;
  content: string;
  senderId: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  attachments: MessageAttachment[];
  read: boolean;
  readAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  replyTo?: MessageReply;
  reactions: MessageReaction[];
  isDeleted: boolean;
  deletedFor?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  _id: string;
  participants: string[];
  type: ConversationType;
  name?: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    sentAt: Date;
  };
  unreadCount: Record<string, number>;
  projectId?: string;
  applicationId?: string;
  isArchived: Record<string, boolean>;
  isMuted: Record<string, boolean>;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  participantDetails?: User[];
  project?: any;
  application?: any;
}