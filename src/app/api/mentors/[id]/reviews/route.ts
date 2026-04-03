import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Mentor from '@/lib/db/models/mentor';
import User from '@/lib/db/models/user'; // Add this import
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import mongoose from 'mongoose'; // Add this import

const reviewSchema = z.object({
  sessionId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(500),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const mentor = await Mentor.findOne({ userId: params.id }).select('reviews stats');

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Sort reviews by date
    const reviews = [...(mentor.reviews || [])].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedReviews = reviews.slice(skip, skip + limit);

    // Populate student details
    const populatedReviews = await Promise.all(
      paginatedReviews.map(async (review: any) => {
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

    return NextResponse.json({
      reviews: populatedReviews,
      stats: {
        averageRating: mentor.stats?.averageRating || 0,
        totalReviews: mentor.stats?.totalReviews || 0,
      },
      pagination: {
        page,
        limit,
        total: reviews.length,
        pages: Math.ceil(reviews.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const mentor = await Mentor.findOne({ userId: params.id });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Verify the session exists and belongs to the student
    const sessionExists = mentor.sessions?.find(
      (s: any) => s._id.toString() === validation.data.sessionId && 
      s.studentId.toString() === session.user.id &&
      s.status === 'completed'
    );

    if (!sessionExists) {
      return NextResponse.json(
        { error: 'Cannot review this session' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    const alreadyReviewed = mentor.reviews?.find(
      (r: any) => r.sessionId.toString() === validation.data.sessionId
    );

    if (alreadyReviewed) {
      return NextResponse.json(
        { error: 'You have already reviewed this session' },
        { status: 400 }
      );
    }

    // Initialize reviews array if it doesn't exist
    if (!mentor.reviews) {
      mentor.reviews = [];
    }

    // Add review with ObjectId
    const newReview = {
      _id: new mongoose.Types.ObjectId(),
      studentId: new mongoose.Types.ObjectId(session.user.id),
      sessionId: new mongoose.Types.ObjectId(validation.data.sessionId),
      rating: validation.data.rating,
      comment: validation.data.comment,
      createdAt: new Date(),
    };

    mentor.reviews.push(newReview);

    // Update mentor stats
    const totalReviews = mentor.reviews.length;
    const totalRating = mentor.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    
    // Initialize stats if they don't exist
    if (!mentor.stats) {
      mentor.stats = {
        totalSessions: 0,
        completedSessions: 0,
        cancelledSessions: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalReviews: 0,
        responseRate: 100,
        responseTime: 0,
        repeatStudents: 0,
      };
    }
    
    mentor.stats.averageRating = totalRating / totalReviews;
    mentor.stats.totalReviews = totalReviews;

    await mentor.save();

    return NextResponse.json({
      message: 'Review submitted successfully',
      stats: {
        averageRating: mentor.stats.averageRating,
        totalReviews: mentor.stats.totalReviews,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}