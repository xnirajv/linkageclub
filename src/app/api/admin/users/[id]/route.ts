import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

        const user = await User.findById(params.id)
      .select('-password -emailVerificationToken -resetPasswordToken')
      .lean(); // Add .lean() to get a plain JavaScript object

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user activity
    const Project = (await import('@/lib/db/models/project')).default;
    const Job = (await import('@/lib/db/models/job')).default;
    const Payment = (await import('@/lib/db/models/payment')).default;
    const { Post, Comment } = await import('@/lib/db/models/community');

    const [projects, jobs, payments, posts, comments] = await Promise.all([
      Project.countDocuments({ companyId: user._id }),
      Job.countDocuments({ companyId: user._id }),
      Payment.countDocuments({ $or: [{ userId: user._id }, { recipientId: user._id }] }),
      Post.countDocuments({ authorId: user._id }),
      Comment.countDocuments({ authorId: user._id }),
    ]);

    // Create a new object with the activity property
    const userWithActivity = {
      ...user,
      activity: {
        projects,
        jobs,
        payments,
        posts,
        comments,
      },
    };

    return NextResponse.json({ user: userWithActivity });
  } catch (error) {
    console.error('Error fetching user:', error);
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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    await connectDB();

    const user = await User.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).select('-password -emailVerificationToken -resetPasswordToken');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Soft delete - just mark as deleted
    user.isDeleted = true;
    await user.save();

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}