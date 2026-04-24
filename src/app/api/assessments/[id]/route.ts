import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const assessment = await Assessment.findById(id).lean();

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    let userAttempt: {
      score: number;
      passed: boolean;
      completedAt: Date | null;
      answers: number[];
      timeSpent: number;
    } | null = null;

    if (session) {
      const attempt = assessment.attempts?.find(
        (a: any) => a.userId?.toString() === session.user.id
      );
      if (attempt) {
        userAttempt = {
          score: attempt.score,
          passed: attempt.passed,
          completedAt: attempt.completedAt,
          answers: attempt.answers,
          timeSpent: attempt.timeSpent,
        };
      }
    }

    const questions = assessment.questions.map((q: any) => ({
      id: q._id,
      question: q.question,
      options: q.options,
      points: q.points,
    }));

    return NextResponse.json({
      assessment: {
        ...assessment,
        _id: assessment._id.toString(),
        questions,
        userAttempt,
      },
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}