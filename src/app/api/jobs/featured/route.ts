import { NextResponse } from 'next/server';
import Job from '@/lib/db/models/job';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    // Get featured jobs (verified companies, recent, high salary)
    const jobs = await Job.find({ status: 'published', isVerified: true })
      .populate('companyId', 'name avatar companyName')
      .sort({ postedAt: -1, 'salary.max': -1 })
      .limit(6);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching featured jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}