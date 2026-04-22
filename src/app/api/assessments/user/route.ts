import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status'); // completed, in-progress, all

    let query: any = { 'attempts.userId': session.user.id };

    if (status === 'completed') {
      query['attempts.completedAt'] = { $ne: null };
    } else if (status === 'in-progress') {
      query['attempts.completedAt'] = null;
    }

    const assessments = await Assessment.find(query)
      .select('title skillName level passingScore badges attempts');

    // Format response
    const userAssessments = assessments.map(assessment => {
      const attempt = assessment.attempts[0];
      return {
        id: assessment._id,
        title: assessment.title,
        skillName: assessment.skillName,
        level: assessment.level,
        passingScore: assessment.passingScore,
        attempt: {
          score: attempt?.score || 0,
          passed: attempt?.passed || false,
          timeSpent: attempt?.timeSpent || 0,
          startedAt: attempt?.startedAt,
          completedAt: attempt?.completedAt || null,
          answers: attempt?.answers || [],  // ✅ ADDED
        },
        badgeEarned: attempt?.passed && assessment.badges?.some(
          (b: any) => attempt.score >= b.requiredScore
        ),
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