import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  attachments: Array<{
    url: string;
    type: string;
    name: string;
    size: number;
  }>;
  read: boolean;
  readAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  replyTo?: {
    messageId: mongoose.Types.ObjectId;
    content: string;
    senderId: mongoose.Types.ObjectId;
  };
  reactions: Array<{
    userId: mongoose.Types.ObjectId;
    reaction: string;
    createdAt: Date;
  }>;
  isDeleted: boolean;
  deletedFor?: mongoose.Types.ObjectId[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  type: 'direct' | 'group' | 'project' | 'support';
  name?: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    sentAt: Date;
  };
  unreadCount: Map<string, number>;
  projectId?: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  isArchived: Map<string, boolean>;
  isMuted: Map<string, boolean>;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video', 'system'],
      default: 'text',
    },
    attachments: [
      {
        url: { type: String, required: true },
        type: String,
        name: String,
        size: Number,
      },
    ],
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    delivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    replyTo: {
      messageId: { type: Schema.Types.ObjectId },
      content: String,
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reaction: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    type: {
      type: String,
      enum: ['direct', 'group', 'project', 'support'],
      default: 'direct',
    },
    name: String,
    avatar: String,
    lastMessage: {
      content: String,
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      sentAt: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    isArchived: {
      type: Map,
      of: Boolean,
      default: {},
    },
    isMuted: {
      type: Map,
      of: Boolean,
      default: {},
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
messageSchema.index({ read: 1 });
messageSchema.index({ createdAt: 1 });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.sentAt': -1 });
conversationSchema.index({ projectId: 1 });
conversationSchema.index({ applicationId: 1 });

// Generate conversation ID for direct messages
messageSchema.pre('save', async function (next) {
  if (!this.conversationId) {
    const participants = [this.senderId.toString(), this.receiverId.toString()].sort();
    this.conversationId = participants.join('_');
  }
  next();
});

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);
const Conversation: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', conversationSchema);

export { Message, Conversation };