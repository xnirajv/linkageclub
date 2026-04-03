import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import Job from '@/lib/db/models/job';
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
      // If no skills, return recent jobs
      const recent = await Job.find({ status: 'published' })
        .populate('companyId', 'name avatar')
        .sort({ postedAt: -1 })
        .limit(10);
      
      return NextResponse.json({ jobs: recent });
    }

    const userSkills = user.skills.map((s: any) => s.name);

    // Find jobs matching user's skills with AI-powered scoring
    const jobs = await Job.aggregate([
      { $match: { status: 'published' } },
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
          experienceScore: {
            $cond: {
              if: { $gte: [user.stats?.projectsCompleted || 0, '$experience.min'] },
              then: 100,
              else: {
                $multiply: [
                  { $divide: [user.stats?.projectsCompleted || 0, '$experience.min'] },
                  100,
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              { $multiply: ['$skillScore', 0.6] },
              { $multiply: ['$experienceScore', 0.2] },
              { $multiply: [user.trustScore || 0, 0.2] },
            ],
          },
        },
      },
      { $sort: { matchScore: -1, postedAt: -1 } },
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

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error recommending jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}