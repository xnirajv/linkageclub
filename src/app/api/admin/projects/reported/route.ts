import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Project from '@/lib/db/models/project';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const projects = await Project.find({
      'reports.0': { $exists: true },
    })
      .populate('companyId', 'name email')
      .populate('reports.reportedBy', 'name email')
      .lean();

    return NextResponse.json({
      projects: projects.map((p) => ({ ...p, _id: p._id.toString() })),
    });
  } catch (error) {
    console.error('Error fetching reported projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}