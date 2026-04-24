import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query: any = { 'attempts.userId': session.user.id };

    if (status === 'completed') {
      query['attempts.completedAt'] = { $ne: null };
    } else if (status === 'in-progress') {
      query['attempts.completedAt'] = null;
    }

    const assessments = await Assessment.find(query)
      .select('title skillName level passingScore badges attempts')
      .lean();

    const userAssessments = assessments.map(assessment => {
      const userAttempts = assessment.attempts?.filter(
        (a: any) => a.userId?.toString() === session.user.id
      ) || [];
      
      const latestAttempt = userAttempts.sort((a: any, b: any) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      )[0];

      return {
        id: assessment._id,
        title: assessment.title,
        skillName: assessment.skillName,
        level: assessment.level,
        passingScore: assessment.passingScore,
        attempt: {
          score: latestAttempt?.score || 0,
          passed: latestAttempt?.passed || false,
          timeSpent: latestAttempt?.timeSpent || 0,
          startedAt: latestAttempt?.startedAt,
          completedAt: latestAttempt?.completedAt || null,
          answers: latestAttempt?.answers || [],
        },
        badgeEarned: latestAttempt?.passed && assessment.badges?.some(
          (b: any) => (latestAttempt?.score || 0) >= b.requiredScore
        ),
      };
    });

    return NextResponse.json({ assessments: userAssessments });
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}