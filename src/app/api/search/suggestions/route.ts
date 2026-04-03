import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Project from '@/lib/db/models/project';
import Job from '@/lib/db/models/job';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'all';

    if (!q || q.length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions: any = [];

    // Get popular searches from projects
    if (type === 'all' || type === 'projects') {
      const projectSkills = await Project.aggregate([
        { $match: { status: 'open' } },
        { $unwind: '$skills' },
        { $match: { 'skills.name': { $regex: q, $options: 'i' } } },
        { $group: { _id: '$skills.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      projectSkills.forEach(skill => {
        suggestions.push({
          text: skill._id,
          type: 'skill',
          category: 'project',
          count: skill.count,
        });
      });
    }

    // Get popular job titles
    if (type === 'all' || type === 'jobs') {
      const jobTitles = await Job.aggregate([
        { $match: { status: 'published' } },
        { $match: { title: { $regex: q, $options: 'i' } } },
        { $group: { _id: '$title', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      jobTitles.forEach(job => {
        suggestions.push({
          text: job._id,
          type: 'job-title',
          category: 'job',
          count: job.count,
        });
      });
    }

    // Get locations
    if (type === 'all' || type === 'jobs') {
      const locations = await Job.aggregate([
        { $match: { status: 'published' } },
        { $match: { location: { $regex: q, $options: 'i' } } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      locations.forEach(loc => {
        suggestions.push({
          text: loc._id,
          type: 'location',
          category: 'job',
          count: loc.count,
        });
      });
    }

    // Sort by relevance (count)
    suggestions.sort((a: any, b: any) => b.count - a.count);

    return NextResponse.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}