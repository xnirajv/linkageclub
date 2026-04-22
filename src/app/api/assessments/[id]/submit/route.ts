import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const submitSchema = z.object({
  answers: z.array(z.number()),
  timeSpent: z.number(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = submitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    await connectDB();
    const { id } = await params;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Find active attempt (incomplete one)
    const attemptIndex = assessment.attempts?.findIndex(
      (a: any) => a.userId?.toString() === session.user.id && a.completedAt === null
    );

    if (attemptIndex === -1 || attemptIndex === undefined) {
      return NextResponse.json({ error: 'No active attempt found' }, { status: 400 });
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
    const passed = score >= (assessment.passingScore || 70);

    // ✅ Update the attempt
    assessment.attempts[attemptIndex].answers = answers;
    assessment.attempts[attemptIndex].score = score;
    assessment.attempts[attemptIndex].passed = passed;
    assessment.attempts[attemptIndex].timeSpent = timeSpent;
    assessment.attempts[attemptIndex].completedAt = new Date();

    await assessment.save();

    let trustScoreIncreased = 0;
    let earnedBadge: string | null = null;  // ✅ FIX: Explicit type with string | null

    // Update user if passed
    if (passed) {
      const user = await User.findById(session.user.id);

      if (user) {
        // Update skill
        const existingSkill = user.skills?.find((s: any) => s.name === assessment.skillName);
        if (existingSkill) {
          existingSkill.verified = true;
          existingSkill.verifiedAt = new Date();
        } else {
          if (!user.skills) user.skills = [];
          user.skills.push({
            name: assessment.skillName,
            level: assessment.level,
            verified: true,
            verifiedAt: new Date(),
          });
        }

        // Add badge
        if (assessment.badges && assessment.badges.length > 0) {
          const badge = assessment.badges.find((b: any) => score >= b.requiredScore);
          if (badge) {
            if (!user.badges) user.badges = [];
            user.badges.push({
              name: badge.name,
              description: badge.description,
              image: badge.image,
              earnedAt: new Date(),
            });
            earnedBadge = badge.name;  // ✅ Now works - string can be assigned
          }
        }

        // Update trust score
        trustScoreIncreased = Math.floor(score / 10);
        user.trustScore = Math.min(100, (user.trustScore || 0) + trustScoreIncreased);

        await user.save();
      }
    }

    // Prepare results
    const results = {
      score,
      passed,
      totalPoints,
      earnedPoints,
      passingScore: assessment.passingScore || 70,
      timeSpent,
      totalTime: assessment.duration * 60,
      trustScoreIncreased,
      badgeEarned: earnedBadge,
      questions: assessment.questions.map((q: any, index: number) => ({
        question: q.question,
        options: q.options,
        userAnswer: answers[index],
        correctAnswer: q.correctAnswer,
        isCorrect: answers[index] === q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
      })),
    };

    return NextResponse.json({
      success: true,
      message: passed ? 'Congratulations! You passed!' : 'Assessment completed',
      results,
    });

  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}