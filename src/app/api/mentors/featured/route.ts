import { NextResponse } from 'next/server';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const mentors = await Mentor.find({ 
      isActive: true, 
      isVerified: true,
      featured: true 
    })
      .populate('userId', 'name avatar bio')
      .sort({ 'stats.averageRating': -1 })
      .limit(6);

    return NextResponse.json({ mentors });
  } catch (error) {
    console.error('Error fetching featured mentors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}