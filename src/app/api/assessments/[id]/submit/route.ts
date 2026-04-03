import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const submitSchema = z.object({
  answers: z.array(z.number()),
  timeSpent: z.number(), // in seconds
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = submitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const assessment = await Assessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Find user's attempt
    const attemptIndex = assessment.attempts?.findIndex(
      (a: any) => a.userId?.toString() === session.user.id && !a.completedAt
    );

    if (attemptIndex === -1 || attemptIndex === undefined) {
      return NextResponse.json(
        { error: 'No active attempt found' },
        { status: 400 }
      );
    }

    // Calculate score
    const { answers, timeSpent } = validation.data;
    let totalPoints = 0;
    let earnedPoints = 0;

    assessment.questions.forEach((q: any, index: number) => {
      totalPoints += q.points || 0;
      if (answers[index] === q.correctAnswer) {
        earnedPoints += q.points || 0;
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= (assessment.passingScore || 0);

    // Update attempt
    assessment.attempts[attemptIndex].answers = answers;
    assessment.attempts[attemptIndex].score = score;
    assessment.attempts[attemptIndex].passed = passed;
    assessment.attempts[attemptIndex].timeSpent = timeSpent;
    assessment.attempts[attemptIndex].completedAt = new Date();

    await assessment.save();

    // Update user's skills if passed
    if (passed) {
      const user = await User.findById(session.user.id);

      // Check if user exists
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Initialize arrays if they don't exist
      if (!user.skills) {
        user.skills = [];
      }
      if (!user.badges) {
        user.badges = [];
      }

      // Check if skill already exists
      const existingSkillIndex = user.skills.findIndex(
        (s: any) => s.name === assessment.skillName
      );

      if (existingSkillIndex >= 0) {
        // Update existing skill
        user.skills[existingSkillIndex] = {
          ...user.skills[existingSkillIndex],
          verified: true,
          level: assessment.level,
          verifiedAt: new Date(),
        };
      } else {
        // Add new skill
        user.skills.push({
          name: assessment.skillName,
          level: assessment.level,
          verified: true,
          verifiedAt: new Date(),
        });
      }

      // Add badge if applicable
      if (assessment.badges && assessment.badges.length > 0) {
        const badge = assessment.badges.find(
          (b: any) => score >= (b.requiredScore || 0)
        );

        if (badge) {
          user.badges.push({
            name: badge.name,
            description: badge.description,
            image: badge.image,
            earnedAt: new Date(),
          });
        }
      }

      await user.save();
    }

    // Prepare results
    const results = {
      score,
      passed,
      totalPoints,
      earnedPoints,
      passingScore: assessment.passingScore,
      timeSpent,
      totalTime: (assessment.duration || 0) * 60,
      questions: assessment.questions.map((q: any, index: number) => ({
        question: q.question,
        userAnswer: answers[index],
        correctAnswer: q.correctAnswer,
        isCorrect: answers[index] === q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
      })),
    };

    // Award badge if passed
    let badge: Record<string, unknown> | null = null;
    if (passed && assessment.badges) {
      badge = assessment.badges.find((b: any) => score >= (b.requiredScore || 0)) ?? null;
    }

    return NextResponse.json({
      message: passed ? 'Congratulations! You passed!' : 'Assessment completed',
      results,
      badge,
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
