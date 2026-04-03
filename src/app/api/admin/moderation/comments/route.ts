import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Comment } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const reportedComments = await Comment.find({
      reportCount: { $gt: 0 },
      isHidden: false,
      isDeleted: false,
    })
      .populate('authorId', 'name email')
      .populate('reportedBy.userId', 'name email')
      .populate('postId', 'title')
      .sort({ reportCount: -1, createdAt: -1 });

    return NextResponse.json({ comments: reportedComments });
  } catch (error) {
    console.error('Error fetching reported comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { commentId, action } = body;

    await connectDB();

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (action === 'hide') {
      comment.isHidden = true;
    } else if (action === 'show') {
      comment.isHidden = false;
    } else if (action === 'clear-reports') {
      comment.reportedBy = [];
      comment.reportCount = 0;
    }

    await comment.save();

    return NextResponse.json({
      message: `Comment ${action} successfully`,
    });
  } catch (error) {
    console.error('Error moderating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}