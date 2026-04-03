import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Post, Comment } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

// Define interfaces for better type safety
interface IAuthor {
  _id: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  trustScore?: number;
}

interface IComment {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  authorId: IAuthor | mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId | null;
  content: string;
  likes: number;
  likedBy: mongoose.Types.ObjectId[] | string[];
  replies: number;
  isHidden: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose Document type for Comment
type CommentDocument = mongoose.Document & IComment;

// Use Omit to create a type with replies as array
type ICommentWithReplies = Omit<IComment, 'replies'> & {
  replies: IComment[];
};

interface IPost {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  authorId: IAuthor | mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  likes: number;
  likedBy: mongoose.Types.ObjectId[] | string[];
  savedBy: mongoose.Types.ObjectId[] | string[];
  views: number;
  comments: number;
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

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Increment view count
    await Post.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    const post = await Post.findById(params.id)
      .populate('authorId', 'name avatar trustScore') as PostDocument | null;

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.isHidden || post.isDeleted) {
      return NextResponse.json(
        { error: 'Post not available' },
        { status: 404 }
      );
    }

    // Get comments - use CommentDocument type
    const comments = await Comment.find({ postId: params.id, parentId: null })
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 }) as CommentDocument[];

    // Get nested comments
    const commentIds = comments.map(c => c._id);
    const replies = await Comment.find({ parentId: { $in: commentIds } })
      .populate('authorId', 'name avatar')
      .sort({ createdAt: 1 }) as CommentDocument[];

    // Organize replies - now toObject() works because comments are CommentDocument
    const commentsWithReplies: ICommentWithReplies[] = comments.map(comment => {
      // Convert to plain object
      const commentObj = comment.toObject();
      
      // Find replies for this comment
      const commentReplies = replies
        .filter(reply => reply.parentId?.toString() === comment._id.toString())
        .map(reply => reply.toObject()); // Convert replies to plain objects too
      
      // Create a new object with the correct structure
      return {
        _id: commentObj._id,
        postId: commentObj.postId,
        authorId: commentObj.authorId,
        parentId: commentObj.parentId,
        content: commentObj.content,
        likes: commentObj.likes,
        likedBy: commentObj.likedBy,
        isHidden: commentObj.isHidden,
        isDeleted: commentObj.isDeleted,
        createdAt: commentObj.createdAt,
        updatedAt: commentObj.updatedAt,
        replies: commentReplies
      };
    });

    const session = await getServerSession(authOptions);
    
    // Convert post to plain object
    const postObj = post.toObject() as IPostWithStatus;

    if (session) {
      const likedBy = post.likedBy || [];
      const savedBy = post.savedBy || [];
      
      postObj.isLiked = likedBy.some(
        (id: any) => id?.toString() === session.user.id
      );
      postObj.isSaved = savedBy.some(
        (id: any) => id?.toString() === session.user.id
      );
    }

    return NextResponse.json({
      post: postObj,
      comments: commentsWithReplies,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const post = await Post.findById(params.id) as PostDocument | null;

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user owns the post or is admin
    if (post.authorId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const allowedUpdates = ['title', 'content', 'category', 'tags'];
    
    // Update fields
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        (post as any)[field] = body[field];
      }
    });

    await post.save();

    return NextResponse.json({
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const post = await Post.findById(params.id) as PostDocument | null;

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user owns the post or is admin
    if (post.authorId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Soft delete
    post.isDeleted = true;
    await post.save();

    // Also soft delete all comments
    await Comment.updateMany(
      { postId: params.id },
      { $set: { isDeleted: true } }
    );

    return NextResponse.json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}