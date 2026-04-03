import { NextResponse } from 'next/server';
import Job from '@/lib/db/models/job';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const locations = await Job.aggregate([
      { $match: { status: 'published' } },
      { $group: {
        _id: '$location',
        count: { $sum: 1 },
        avgSalary: { $avg: '$salary.max' },
      }},
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}