import { NextResponse } from 'next/server';
import Project from '@/lib/db/models/project';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const categories = await Project.aggregate([
      { $match: { status: 'open' } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        averageBudget: { $avg: '$budget.max' },
      }},
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}