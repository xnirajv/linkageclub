import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: 'discussion' | 'question' | 'showcase' | 'poll' | 'announcement';
  category: string;
  tags: string[];
  
  // Poll specific
  poll?: {
    question: string;
    options: Array<{
      text: string;
      votes: number;
      voters: mongoose.Types.ObjectId[];
    }>;
    expiresAt?: Date;
    allowMultiple: boolean;
  };
  
  // Media
  media?: Array<{
    url: string;
    type: 'image' | 'video' | 'link';
    thumbnail?: string;
  }>;
  
  // Stats
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  comments: number;
  shares: number;
  views: number;
  saves: number;
  savedBy: mongoose.Types.ObjectId[];
  
  // Moderation
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;
  isDeleted: boolean;
  reportedBy: Array<{
    userId: mongoose.Types.ObjectId;
    reason: string;
    reportedAt: Date;
  }>;
  reportCount: number;
  
  // Timestamps
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId; // For nested comments
  content: string;
  
  // Media
  media?: Array<{
    url: string;
    type: 'image' | 'video' | 'link';
  }>;
  
  // Stats
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  replies: number;
  
  // Moderation
  isHidden: boolean;
  isDeleted: boolean;
  reportedBy: Array<{
    userId: mongoose.Types.ObjectId;
    reason: string;
    reportedAt: Date;
  }>;
  reportCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['discussion', 'question', 'showcase', 'poll', 'announcement'],
      default: 'discussion',
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: [{
      type: String,
      index: true,
    }],
    poll: {
      question: String,
      options: [{
        text: { type: String, required: true },
        votes: { type: Number, default: 0 },
        voters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      }],
      expiresAt: Date,
      allowMultiple: { type: Boolean, default: false },
    },
    media: [{
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'video', 'link'], required: true },
      thumbnail: String,
    }],
    
    // Stats
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    savedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    
    // Moderation
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    reportedBy: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      reportedAt: { type: Date, default: Date.now },
    }],
    reportCount: { type: Number, default: 0 },
    
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const commentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    media: [{
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'video', 'link'], required: true },
    }],
    
    // Stats
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replies: { type: Number, default: 0 },
    
    // Moderation
    isHidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    reportedBy: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      reportedAt: { type: Date, default: Date.now },
    }],
    reportCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ createdAt: -1 });
postSchema.index({ lastActivityAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'poll.expiresAt': 1 });
postSchema.index({ isPinned: -1, lastActivityAt: -1 });

commentSchema.index({ postId: 1, createdAt: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ authorId: 1 });

// Update post comment count when comment is added
commentSchema.post('save', async function() {
  await Post.updateOne(
    { _id: this.postId },
    { 
      $inc: { comments: 1 },
      $set: { lastActivityAt: new Date() }
    }
  );
});

// Update post comment count when comment is deleted
commentSchema.post('deleteOne', { document: true, query: false }, async function() {
  await Post.updateOne(
    { _id: this.postId },
    { $inc: { comments: -1 } }
  );
});

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);
const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export { Post, Comment };
