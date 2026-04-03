import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import Project from '@/lib/db/models/project';
import connectDB from '@/lib/db/connect';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('skills trustScore stats');

    if (!user || !user.skills || user.skills.length === 0) {
      // If no skills, return recent projects
      const recent = await Project.find({ status: 'open' })
        .populate('companyId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10);
      
      return NextResponse.json({ projects: recent });
    }

    const userSkills = user.skills.map((s: any) => s.name);

    // Find projects matching user's skills with AI-powered scoring
    const projects = await Project.aggregate([
      { $match: { status: 'open' } },
      {
        $addFields: {
          skillMatch: {
            $size: {
              $filter: {
                input: '$skills',
                as: 'skill',
                cond: { $in: ['$$skill.name', userSkills] },
              },
            },
          },
          totalSkills: { $size: '$skills' },
          skillScore: {
            $multiply: [
              {
                $divide: [
                  {
                    $size: {
                      $filter: {
                        input: '$skills',
                        as: 'skill',
                        cond: { $in: ['$$skill.name', userSkills] },
                      },
                    },
                  },
                  { $size: '$skills' },
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              { $multiply: ['$skillScore', 0.5] },
              { $multiply: [user.trustScore || 0, 0.3] },
              { $multiply: [{ $rand: {} }, 20] }, // Add some randomness for variety
            ],
          },
        },
      },
      { $sort: { matchScore: -1, createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
    ]);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error recommending projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}