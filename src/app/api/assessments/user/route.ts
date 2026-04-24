import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
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

    const assessments = await Assessment.find({
      'attempts.userId': session.user.id,
    })
      .select('title skillName level passingScore badges attempts')
      .lean();

    const userAssessments = assessments.map((assessment: any) => {
      const userAttempts = assessment.attempts.filter(
        (a: any) => a.userId?.toString() === session.user.id
      );
      
      const latestAttempt = userAttempts[userAttempts.length - 1];
      
      // Check if badge was earned
      let badgeEarned = false;
      if (latestAttempt?.passed && assessment.badges?.length > 0) {
        badgeEarned = assessment.badges.some(
          (b: any) => latestAttempt.score >= b.requiredScore
        );
      }

      return {
        id: assessment._id,
        title: assessment.title,
        skillName: assessment.skillName,
        level: assessment.level,
        passingScore: assessment.passingScore,
        attempt: latestAttempt
          ? {
              score: latestAttempt.score,
              passed: latestAttempt.passed,
              timeSpent: latestAttempt.timeSpent,
              startedAt: latestAttempt.startedAt,
              completedAt: latestAttempt.completedAt,
            }
          : null,
        badgeEarned,
        totalAttempts: userAttempts.length,
      };
    });

    return NextResponse.json({ assessments: userAssessments });
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}