import { NextRequest, NextResponse } from 'next/server';
import Project from '@/lib/db/models/project';
import connectDB from '@/lib/db/connect';

export async function GET(_req: NextRequest) {
  try {
    await connectDB();

    // Get featured projects (highest match potential, recent, popular)
    const projects = await Project.find({ status: 'open' })
      .populate('companyId', 'name avatar companyName')
      .sort({ views: -1, createdAt: -1 })
      .limit(6);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}