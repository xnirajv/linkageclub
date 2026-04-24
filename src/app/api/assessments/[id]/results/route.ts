import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

// Define badge type
interface BadgeResult {
  name: string;
  description: string;
  image: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const assessment = await Assessment.findById(params.id).lean();

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Find user's completed attempt
    const userAttempts = assessment.attempts
      ?.filter(
        (a: any) =>
          a.userId?.toString() === session.user.id && a.completedAt
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );

    if (!userAttempts?.length) {
      return NextResponse.json(
        { error: 'No completed attempt found' },
        { status: 404 }
      );
    }

    const latestAttempt = userAttempts[0];

    // Prepare detailed results
    const results = {
      score: latestAttempt.score,
      passed: latestAttempt.passed,
      timeSpent: latestAttempt.timeSpent,
      completedAt: latestAttempt.completedAt,
      totalPoints: assessment.questions.reduce(
        (acc: number, q: any) => acc + (q.points || 1),
        0
      ),
      earnedPoints: assessment.questions.reduce(
        (acc: number, q: any, index: number) =>
          acc +
          (latestAttempt.answers[index] !== undefined &&
          latestAttempt.answers[index] !== -1 &&
          latestAttempt.answers[index] === q.correctAnswer
            ? q.points || 1
            : 0),
        0
      ),
      passingScore: assessment.passingScore || 70,
      totalTime: (assessment.duration || 0) * 60,
      questions: assessment.questions.map((q: any, index: number) => ({
        question: q.question,
        options: q.options,
        userAnswer:
          latestAttempt.answers[index] !== undefined
            ? latestAttempt.answers[index]
            : -1,
        correctAnswer: q.correctAnswer,
        isCorrect:
          latestAttempt.answers[index] !== undefined &&
          latestAttempt.answers[index] !== -1 &&
          latestAttempt.answers[index] === q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points || 1,
      })),
      attemptNumber: userAttempts.length,
      allAttempts: userAttempts.map((a: any) => ({
        score: a.score,
        passed: a.passed,
        completedAt: a.completedAt,
      })),
    };

    // Get earned badge - Fix: use proper union type
    let badge: BadgeResult | null = null;
    
    if (latestAttempt.passed && assessment.badges?.length > 0) {
      const earnedBadge = assessment.badges.find(
        (b: any) => latestAttempt.score >= b.requiredScore
      );
      
      if (earnedBadge) {
        badge = {
          name: earnedBadge.name || '',
          description: earnedBadge.description || '',
          image: earnedBadge.image || '',
        };
      }
    }

    return NextResponse.json({
      results,
      badge,
      assessmentTitle: assessment.title,
      skillName: assessment.skillName,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}