import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Post } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import mongoose from 'mongoose'; 


const reportSchema = z.object({
  reason: z.string().min(5),
});

export async function POST(
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

    const body = await req.json();
    const validation = reportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const post = await Post.findById(params.id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Convert string ID to ObjectId for comparison
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Check if user already reported
    const alreadyReported = post.reportedBy?.some(
      r => r.userId.toString() === session.user.id
    );

    if (alreadyReported) {
      return NextResponse.json(
        { error: 'You have already reported this post' },
        { status: 400 }
      );
    }

    if (!post.reportedBy) {
      post.reportedBy = [];
    }

    // Add report with ObjectId
    post.reportedBy.push({
      userId: userId, // Use ObjectId instead of string
      reason: validation.data.reason,
      reportedAt: new Date(),
    });

    post.reportCount = post.reportedBy.length;

    // Auto-hide if report count reaches threshold
    if (post.reportCount >= 5) {
      post.isHidden = true;
    }

    await post.save();

    return NextResponse.json({
      message: 'Post reported successfully',
      reportCount: post.reportCount,
    });
  } catch (error) {
    console.error('Error reporting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}