import { NextResponse } from 'next/server';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    // Get featured assessments (popular, high-rated)
    const assessments = await Assessment.find({ isActive: true })
      .select('-questions')
      .sort({ totalAttempts: -1, averageScore: -1 })
      .limit(6);

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('Error fetching featured assessments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}