import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Job from '@/lib/db/models/job';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user's skills
    const user = await User.findById(session.user.id).select('skills');

    if (!user || !user.skills || user.skills.length === 0) {
      // If no skills, return recent jobs
      const recent = await Job.find({ status: 'published' })
        .populate('companyId', 'name avatar companyName')
        .sort({ postedAt: -1 })
        .limit(6);
      
      return NextResponse.json({ jobs: recent });
    }

    const userSkills = user.skills.map((s: any) => s.name);

    // Find jobs matching user's skills with AI-powered matching
    const jobs = await Job.aggregate([
      { $match: { status: 'published' } },
      { $lookup: {
        from: 'users',
        localField: 'companyId',
        foreignField: '_id',
        as: 'company',
      }},
      { $unwind: '$company' },
      { $addFields: {
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
        matchScore: {
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
      }},
      { $match: { matchScore: { $gt: 0 } } },
      { $sort: { matchScore: -1, postedAt: -1 } },
      { $limit: 6 },
      { $project: {
        title: 1,
        description: 1,
        location: 1,
        type: 1,
        salary: 1,
        experience: 1,
        skills: 1,
        postedAt: 1,
        matchScore: 1,
        'company.name': 1,
        'company.avatar': 1,
        'company.companyName': 1,
        'company.isVerified': 1,
      }},
    ]);

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}