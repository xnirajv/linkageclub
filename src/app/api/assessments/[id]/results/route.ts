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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Find all completed attempts by this user
    const completedAttempts = assessment.attempts?.filter(
      (a: any) => a.userId?.toString() === session.user.id && a.completedAt !== null
    );

    if (!completedAttempts || completedAttempts.length === 0) {
      return NextResponse.json({ error: 'No completed attempt found' }, { status: 404 });
    }

    // Get the latest attempt
    const latestAttempt = completedAttempts.sort((a: any, b: any) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0];

    const results = {
      score: latestAttempt.score,
      passed: latestAttempt.passed,
      timeSpent: latestAttempt.timeSpent,
      totalTime: assessment.duration * 60,
      totalPoints: assessment.questions.reduce((acc: number, q: any) => acc + q.points, 0),
      earnedPoints: assessment.questions.reduce(
        (acc: number, q: any, index: number) => 
          acc + (latestAttempt.answers[index] === q.correctAnswer ? q.points : 0),
        0
      ),
      passingScore: assessment.passingScore,
      trustScoreIncreased: latestAttempt.passed ? Math.floor(latestAttempt.score / 10) : 0,
      badgeEarned: latestAttempt.passed && assessment.badges?.length > 0 ? assessment.badges[0]?.name : null,
      questions: assessment.questions.map((q: any, index: number) => ({
        question: q.question,
        options: q.options,
        userAnswer: latestAttempt.answers[index],
        correctAnswer: q.correctAnswer,
        isCorrect: latestAttempt.answers[index] === q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
      })),
    };

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}