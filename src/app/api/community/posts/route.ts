import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Post } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import mongoose from 'mongoose';

// Define interfaces for better type safety
interface IAuthor {
  _id: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  trustScore?: number;
}

interface IPost {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  authorId: IAuthor | mongoose.Types.ObjectId;
  type: 'discussion' | 'question' | 'showcase' | 'poll' | 'announcement';
  category: string;
  tags?: string[];
  likes: number;
  likedBy: mongoose.Types.ObjectId[] | string[];
  comments: number;
  shares: number;
  views: number;
  saves: number;
  savedBy: mongoose.Types.ObjectId[] | string[];
  isHidden: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

// Define the Mongoose Document type for Post
type PostDocument = mongoose.Document & IPost;

// Extended type for post with like/save status
type IPostWithStatus = IPost & {
  isLiked?: boolean;
  isSaved?: boolean;
};

const postSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  type: z.enum(['discussion', 'question', 'showcase', 'poll', 'announcement']),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  poll: z.object({
    question: z.string(),
    options: z.array(z.object({
      text: z.string(),
    })),
    expiresAt: z.string().optional(),
    allowMultiple: z.boolean().default(false),
  }).optional(),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video', 'link']),
    thumbnail: z.string().url().optional(),
  })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'latest'; // latest, popular, trending

    const query: any = { 
      isHidden: false,
      isDeleted: false,
    };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    let sortQuery: any = {};
    switch (sort) {
      case 'latest':
        sortQuery = { createdAt: -1 };
        break;
      case 'popular':
        sortQuery = { likes: -1, comments: -1, views: -1 };
        break;
      case 'trending':
        // Posts from last 7 days with high engagement
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query.createdAt = { $gte: weekAgo };
        sortQuery = { likes: -1, comments: -1, views: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const posts = await Post.find(query)
      .populate('authorId', 'name avatar trustScore')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit) as PostDocument[];

    const total = await Post.countDocuments(query);

    // Check if current user has liked each post
    const session = await getServerSession(authOptions);
    
    // Create a new array with like/save status
    let postsWithStatus: IPostWithStatus[] = [];

    if (session) {
      postsWithStatus = posts.map(post => {
        const postObj = post.toObject() as IPost;
        
        const likedBy = post.likedBy || [];
        const savedBy = post.savedBy || [];
        
        return {
          ...postObj,
          isLiked: likedBy.some(
            (id: any) => id?.toString() === session.user.id
          ),
          isSaved: savedBy.some(
            (id: any) => id?.toString() === session.user.id
          ),
        };
      });
    } else {
      postsWithStatus = posts.map(post => {
        const postObj = post.toObject() as IPost;
        return postObj;
      });
    }

    return NextResponse.json({
      posts: postsWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = postSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const post = await Post.create({
      ...validation.data,
      authorId: session.user.id,
      likes: 0,
      likedBy: [],
      comments: 0,
      shares: 0,
      views: 0,
      saves: 0,
      savedBy: [],
      lastActivityAt: new Date(),
    });

    return NextResponse.json({
      message: 'Post created successfully',
      post,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}