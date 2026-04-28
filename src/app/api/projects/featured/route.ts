import { NextResponse } from 'next/server';
import Project from '@/lib/db/models/project';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const projects = await Project.find({ status: 'open', isFeatured: true })
      .populate('companyId', 'name avatar companyName')
      .sort({ views: -1, createdAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}