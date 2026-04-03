import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Mentor from '@/lib/db/models/mentor';
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

    // Get user's skills and interests
    const user = await User.findById(session.user.id).select('skills');

    if (!user || !user.skills || user.skills.length === 0) {
      // If no skills, return top-rated mentors
      const topMentors = await Mentor.find({ isActive: true, isVerified: true })
        .populate('userId', 'name avatar bio')
        .sort({ 'stats.averageRating': -1 })
        .limit(6);
      
      return NextResponse.json({ mentors: topMentors });
    }

    const userSkills = user.skills.map((s: any) => s.name);

    // Find mentors matching user's skills
    const mentors = await Mentor.aggregate([
      { $match: { isActive: true, isVerified: true } },
      { $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      }},
      { $unwind: '$user' },
      { $addFields: {
        skillMatch: {
          $size: {
            $filter: {
              input: '$expertise',
              as: 'exp',
              cond: { $in: ['$$exp.skill', userSkills] },
            },
          },
        },
        totalExpertise: { $size: '$expertise' },
        matchScore: {
          $multiply: [
            {
              $divide: [
                {
                  $size: {
                    $filter: {
                      input: '$expertise',
                      as: 'exp',
                      cond: { $in: ['$$exp.skill', userSkills] },
                    },
                  },
                },
                { $size: '$expertise' },
              ],
            },
            100,
          ],
        },
      }},
      { $match: { matchScore: { $gt: 0 } } },
      { $sort: { matchScore: -1, 'stats.averageRating': -1 } },
      { $limit: 6 },
      { $project: {
        userId: 1,
        expertise: 1,
        hourlyRate: 1,
        availability: 1,
        stats: 1,
        matchScore: 1,
        'user.name': 1,
        'user.avatar': 1,
        'user.bio': 1,
      }},
    ]);

    return NextResponse.json({ mentors });
  } catch (error) {
    console.error('Error fetching recommended mentors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}