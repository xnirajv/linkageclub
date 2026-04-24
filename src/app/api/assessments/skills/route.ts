import { NextResponse } from 'next/server';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const skills = await Assessment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$skillName',
          count: { $sum: 1 },
          levels: { $addToSet: '$level' },
          averagePrice: { $avg: '$price' },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
          levels: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
        },
      },
    ]);

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}