import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  featuredImage: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonical?: string;
  
  // Stats
  views: number;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  shares: number;
  readTime: number;
  
  // Comments
  comments: Array<{
    userId: mongoose.Types.ObjectId;
    content: string;
    likes: number;
    likedBy: mongoose.Types.ObjectId[];
    replies: Array<{
      userId: mongoose.Types.ObjectId;
      content: string;
      likes: number;
      likedBy: mongoose.Types.ObjectId[];
      createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }>;
  commentCount: number;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  isFeatured: boolean;
  isTrending: boolean;
  
  // Related posts
  relatedPosts?: mongoose.Types.ObjectId[];
  
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    featuredImage: {
      type: String,
      required: true,
    },
    images: [{
      url: { type: String, required: true },
      caption: String,
    }],
    
    // SEO
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    canonical: String,
    
    // Stats
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    shares: { type: Number, default: 0 },
    readTime: { type: Number, default: 0 },
    
    // Comments
    comments: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      likes: { type: Number, default: 0 },
      likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      replies: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, default: Date.now },
      }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }],
    commentCount: { type: Number, default: 0 },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: Date,
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    
    relatedPosts: [{
      type: Schema.Types.ObjectId,
      ref: 'BlogPost',
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
blogPostSchema.index({ slug: 1 }, { unique: true });
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ isFeatured: 1 });
blogPostSchema.index({ isTrending: 1 });
blogPostSchema.index({ views: -1 });
blogPostSchema.index({ createdAt: -1 });

// Generate slug from title
blogPostSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Calculate read time
blogPostSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Update comment count
blogPostSchema.pre('save', function (next) {
  this.commentCount = this.comments.length;
  next();
});

const BlogPost: Model<IBlogPost> = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', blogPostSchema);

export default BlogPost;