import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import Project from '@/lib/db/models/project';
import Job from '@/lib/db/models/job';
import Mentor from '@/lib/db/models/mentor';
import { Post } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // all, projects, jobs, mentors, users, posts
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const results: any = {};
    
    // Get session if needed for personalized results (like saved status)
    const session = await getServerSession(authOptions);

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Search projects
    if (type === 'all' || type === 'projects') {
      const projects = await Project.find({
        status: 'open',
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { 'skills.name': { $regex: q, $options: 'i' } },
        ],
      })
        .populate('companyId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(type === 'all' ? 0 : skip)
        .limit(type === 'all' ? 5 : limit);

      // Add user-specific data if logged in
      if (session) {
        results.projects = projects.map(project => {
          const projectObj = project.toObject() as any;
          // Add logic for saved status, match score, etc.
          return projectObj;
        });
      } else {
        results.projects = projects;
      }
    }

    // Search jobs
    if (type === 'all' || type === 'jobs') {
      const jobs = await Job.find({
        status: 'published',
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { 'skills.name': { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
        ],
      })
        .populate('companyId', 'name avatar')
        .sort({ postedAt: -1 })
        .skip(type === 'all' ? 0 : skip)
        .limit(type === 'all' ? 5 : limit);

      results.jobs = jobs;
    }

    // Search mentors
    if (type === 'all' || type === 'mentors') {
      const users = await User.find({
        role: 'mentor',
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = users.map(u => u._id);

      const mentors = await Mentor.find({
        userId: { $in: userIds },
        isActive: true,
      })
        .populate('userId', 'name avatar bio')
        .sort({ 'stats.averageRating': -1 })
        .skip(type === 'all' ? 0 : skip)
        .limit(type === 'all' ? 5 : limit);

      results.mentors = mentors;
    }

    // Search users (students/founders)
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        role: { $in: ['student', 'founder'] },
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } },
          { 'skills.name': { $regex: q, $options: 'i' } },
        ],
      })
        .select('name avatar role trustScore skills')
        .sort({ trustScore: -1 })
        .skip(type === 'all' ? 0 : skip)
        .limit(type === 'all' ? 5 : limit);

      results.users = users;
    }

    // Search community posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        isHidden: false,
        isDeleted: false,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } },
        ],
      })
        .populate('authorId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(type === 'all' ? 0 : skip)
        .limit(type === 'all' ? 5 : limit);

      results.posts = posts;
    }

    return NextResponse.json({
      query: q,
      results,
      type,
      pagination: type !== 'all' ? {
        page,
        limit,
        hasMore: false, // You would need to implement count queries to determine this
      } : undefined,
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}