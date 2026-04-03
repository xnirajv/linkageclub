import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (verified === 'true') {
      query.emailVerified = true;
    } else if (verified === 'false') {
      query.emailVerified = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password -emailVerificationToken -resetPasswordToken')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const baseUser = user.toObject();
        const userWithStats: any = { ...baseUser };
        
        // Get project count for students
        if (user.role === 'student') {
          const Project = (await import('@/lib/db/models/project')).default;
          const projectCount = await Project.countDocuments({
            'applications.userId': user._id,
          });
          userWithStats.projectCount = projectCount;
        }
        
        // Get job applications for students
        if (user.role === 'student') {
          const Job = (await import('@/lib/db/models/job')).default;
          const jobCount = await Job.countDocuments({
            'applications.userId': user._id,
          });
          userWithStats.jobCount = jobCount;
        }
        
        // Get posted projects for companies
        if (user.role === 'company') {
          const Project = (await import('@/lib/db/models/project')).default;
          const projectCount = await Project.countDocuments({
            companyId: user._id,
          });
          userWithStats.postedProjects = projectCount;
        }
        
        // Get sessions for mentors
        if (user.role === 'mentor') {
          const Mentor = (await import('@/lib/db/models/mentor')).default;
          const mentor = await Mentor.findOne({ userId: user._id });
          userWithStats.sessionCount = mentor?.stats?.completedSessions || 0;
        }

        return userWithStats;
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}