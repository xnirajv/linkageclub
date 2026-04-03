import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/user';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const mentor = await Mentor.findOne({ userId: params.id })
      .populate('userId', 'name avatar bio location socialLinks');

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Get recent reviews
    const reviews = (mentor.reviews || [])
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Populate reviewer details
    const populatedReviews = await Promise.all(
      reviews.map(async (review: any) => {
        const user = await User.findById(review.studentId).select('name avatar');
        const reviewObj = review.toObject ? review.toObject() : review;
        return {
          ...reviewObj,
          student: user ? {
            id: user._id,
            name: user.name,
            avatar: user.avatar,
          } : null,
        };
      })
    );

    const mentorObj = mentor.toObject();
    mentorObj.reviews = populatedReviews;

    return NextResponse.json({ mentor: mentorObj });
  } catch (error) {
    console.error('Error fetching mentor:', error);
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
    
    if (!session || (session.user.id !== params.id && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    await connectDB();

    const mentor = await Mentor.findOne({ userId: params.id });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Update allowed fields - use type assertion
    const allowedUpdates = ['hourlyRate', 'availability', 'expertise'];
    
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        // Use type assertion to access dynamic property
        (mentor as any)[field] = body[field];
      }
    });

    await mentor.save();

    return NextResponse.json({
      message: 'Mentor profile updated successfully',
      mentor,
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}