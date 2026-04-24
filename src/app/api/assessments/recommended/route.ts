import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('skills').lean();

    // If no skills, return popular assessments
    if (!user?.skills?.length) {
      const popular = await Assessment.find({ isActive: true })
        .select('-questions.correctAnswer -questions.explanation')
        .sort({ totalAttempts: -1 })
        .limit(6)
        .lean();

      return NextResponse.json({ assessments: popular });
    }

    const userSkills = user.skills.map((s: any) => s.name);

    // Find assessments matching user's skills or related
    const assessments = await Assessment.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          skillMatch: {
            $cond: {
              if: { $in: ['$skillName', userSkills] },
              then: 2,
              else: 1,
            },
          },
        },
      },
      { $sort: { skillMatch: -1, totalAttempts: -1, averageScore: -1 } },
      { $limit: 6 },
      { $project: { 'questions.correctAnswer': 0, 'questions.explanation': 0 } },
    ]);

    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}