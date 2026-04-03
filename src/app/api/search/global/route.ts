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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const searchRegex = new RegExp(q, 'i');

    // Execute all searches in parallel
    const [
      projects,
      jobs,
      mentors,
      users,
      posts,
      totalProjects,
      totalJobs,
      totalMentors,
      totalUsers,
      totalPosts
    ] = await Promise.all([
      // Projects
      Project.find({
        status: 'open',
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'skills.name': searchRegex },
          { tags: searchRegex },
        ],
      })
        .populate('companyId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),

      // Jobs
      Job.find({
        status: 'published',
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'skills.name': searchRegex },
          { location: searchRegex },
          { department: searchRegex },
        ],
      })
        .populate('companyId', 'name avatar')
        .sort({ postedAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),

      // Mentors
      (async () => {
        const mentorUsers = await User.find({
          role: 'mentor',
          $or: [
            { name: searchRegex },
            { bio: searchRegex },
            { 'skills.name': searchRegex },
          ],
        }).select('_id');

        const mentorIds = mentorUsers.map(u => u._id);

        return Mentor.find({
          userId: { $in: mentorIds },
          isActive: true,
        })
          .populate('userId', 'name avatar bio')
          .sort({ 'stats.averageRating': -1 })
          .limit(limit)
          .skip((page - 1) * limit)
          .lean();
      })(),

      // Users (students & founders)
      User.find({
        role: { $in: ['student', 'founder'] },
        $or: [
          { name: searchRegex },
          { bio: searchRegex },
          { 'skills.name': searchRegex },
          { location: searchRegex },
        ],
      })
        .select('name avatar role trustScore skills location')
        .sort({ trustScore: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),

      // Community posts
      Post.find({
        isHidden: false,
        isDeleted: false,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex },
          { category: searchRegex },
        ],
      })
        .populate('authorId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),

      // Counts
      Project.countDocuments({
        status: 'open',
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'skills.name': searchRegex },
        ],
      }),

      Job.countDocuments({
        status: 'published',
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'skills.name': searchRegex },
        ],
      }),

      (async () => {
        const mentorUsers = await User.find({
          role: 'mentor',
          $or: [{ name: searchRegex }, { bio: searchRegex }],
        }).select('_id');
        return Mentor.countDocuments({
          userId: { $in: mentorUsers.map(u => u._id) },
          isActive: true,
        });
      })(),

      User.countDocuments({
        role: { $in: ['student', 'founder'] },
        $or: [{ name: searchRegex }, { bio: searchRegex }],
      }),

      Post.countDocuments({
        isHidden: false,
        isDeleted: false,
        $or: [{ title: searchRegex }, { content: searchRegex }],
      }),
    ]);

    // Calculate match scores for authenticated user
    if (session) {
      const user = await User.findById(session.user.id).select('skills');
      const userSkills = user?.skills?.map((s: any) => s.name) || [];

      // Add match scores to projects
      projects.forEach((project: any) => {
        const projectSkills = project.skills?.map((s: any) => s.name) || [];
        const matchingSkills = projectSkills.filter((s: string) => 
          userSkills.includes(s)
        );
        project.matchScore = projectSkills.length > 0
          ? Math.round((matchingSkills.length / projectSkills.length) * 100)
          : 0;
      });

      // Add match scores to jobs
      jobs.forEach((job: any) => {
        const jobSkills = job.skills?.map((s: any) => s.name) || [];
        const matchingSkills = jobSkills.filter((s: string) => 
          userSkills.includes(s)
        );
        job.matchScore = jobSkills.length > 0
          ? Math.round((matchingSkills.length / jobSkills.length) * 100)
          : 0;
      });
    }

    return NextResponse.json({
      query: q,
      results: {
        projects,
        jobs,
        mentors,
        users,
        posts,
      },
      counts: {
        projects: totalProjects,
        jobs: totalJobs,
        mentors: totalMentors,
        users: totalUsers,
        posts: totalPosts,
        total: totalProjects + totalJobs + totalMentors + totalUsers + totalPosts,
      },
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}