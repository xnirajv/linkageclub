import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const submitSchema = z.object({
  answers: z.array(z.number()),
  timeSpent: z.number().min(1, 'Time spent must be at least 1 second'),
});

interface EarnedBadge {
  name: string;
  description: string;
  image: string;
  requiredScore: number;
}

export async function POST(
  req: NextRequest,
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

    const body = await req.json();
    const validation = submitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
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

    // Find active attempt
    const attemptIndex = assessment.attempts.findIndex(
      (a: any) =>
        a.userId?.toString() === session.user.id && !a.completedAt
    );

    if (attemptIndex === -1) {
      return NextResponse.json(
        { error: 'No active attempt found' },
        { status: 400 }
      );
    }

    const { answers, timeSpent } = validation.data;

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    assessment.questions.forEach((q: any, index: number) => {
      const points = q.points || 1;
      totalPoints += points;

      if (
        answers[index] !== undefined &&
        answers[index] !== -1 &&
        answers[index] === q.correctAnswer
      ) {
        earnedPoints += points;
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= (assessment.passingScore || 70);

    // Update attempt
    assessment.attempts[attemptIndex].answers = answers;
    assessment.attempts[attemptIndex].score = score;
    assessment.attempts[attemptIndex].passed = passed;
    assessment.attempts[attemptIndex].timeSpent = timeSpent;
    assessment.attempts[attemptIndex].completedAt = new Date();

    // Update assessment stats
    const completedAttempts = assessment.attempts.filter((a: any) => a.completedAt);
    assessment.totalAttempts = completedAttempts.length;

    if (completedAttempts.length > 0) {
      const passedCount = completedAttempts.filter((a: any) => a.passed).length;
      assessment.passRate = Math.round((passedCount / completedAttempts.length) * 100);
      assessment.averageScore = Math.round(
        completedAttempts.reduce((acc: number, a: any) => acc + a.score, 0) /
          completedAttempts.length
      );
    }

    await assessment.save();

    // Update user skills and badges if passed
    let earnedBadge: EarnedBadge | null = null;

    if (passed) {
      await updateUserOnPass(session.user.id, assessment, score);
      
      // Award badge if applicable
      if (assessment.badges?.length > 0) {
        const applicableBadge = assessment.badges.find(
          (b: any) => score >= b.requiredScore
        );

        if (applicableBadge) {
          earnedBadge = {
            name: applicableBadge.name,
            description: applicableBadge.description || '',
            image: applicableBadge.image || '',
            requiredScore: applicableBadge.requiredScore,
          };

          await awardBadgeToUser(
            session.user.id,
            applicableBadge.name,
            applicableBadge.description || '',
            applicableBadge.image || ''
          );
        }
      }
    }

    // Prepare detailed results
    const results = {
      score,
      passed,
      totalPoints,
      earnedPoints,
      passingScore: assessment.passingScore || 70,
      timeSpent,
      totalTime: (assessment.duration || 0) * 60,
      questions: assessment.questions.map((q: any, index: number) => ({
        question: q.question,
        options: q.options,
        userAnswer: answers[index] !== undefined ? answers[index] : -1,
        correctAnswer: q.correctAnswer,
        isCorrect:
          answers[index] !== undefined &&
          answers[index] !== -1 &&
          answers[index] === q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points || 1,
      })),
    };

    return NextResponse.json({
      message: passed
        ? 'Congratulations! You passed the assessment!'
        : 'Assessment completed. Keep practicing!',
      results,
      badge: earnedBadge,
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update user's skills when they pass an assessment
 */
async function updateUserOnPass(
  userId: string,
  assessment: any,
  score: number
): Promise<void> {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found for skill update:', userId);
      return;
    }

    // Initialize arrays
    if (!user.skills) user.skills = [];

    // Check if skill already exists
    const existingSkillIndex = user.skills.findIndex(
      (s: any) => s.name === assessment.skillName
    );

    const skillData = {
      name: assessment.skillName,
      level: assessment.level,
      verified: true,
      verifiedAt: new Date(),
    };

    if (existingSkillIndex >= 0) {
      // Update existing skill - only if new level is higher
      const currentLevel = user.skills[existingSkillIndex].level;
      const levelRank: Record<string, number> = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        expert: 4,
      };

      if (levelRank[assessment.level] > levelRank[currentLevel]) {
        user.skills[existingSkillIndex] = {
          ...user.skills[existingSkillIndex],
          ...skillData,
        };
      } else {
        // Just update verification
        user.skills[existingSkillIndex].verified = true;
        user.skills[existingSkillIndex].verifiedAt = new Date();
      }
    } else {
      // Add new skill
      user.skills.push(skillData);
    }

    await user.save();
  } catch (error) {
    console.error('Error updating user skills:', error);
    // Don't throw - assessment submission shouldn't fail if skill update fails
  }
}

/**
 * Award badge to user if not already earned
 */
async function awardBadgeToUser(
  userId: string,
  name: string,
  description: string,
  image: string
): Promise<void> {
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error('User not found for badge award:', userId);
      return;
    }

    // Initialize badges array
    if (!user.badges) user.badges = [];

    // Check if badge already earned
    const existingBadge = user.badges.find(
      (b: any) => b.name === name
    );

    if (!existingBadge) {
      // Push with only allowed fields matching User schema
      user.badges.push({
        name: name,
        description: description,
        image: image,
        earnedAt: new Date(),
      });

      await user.save();
    }
  } catch (error) {
    console.error('Error awarding badge:', error);
    // Don't throw - assessment submission shouldn't fail if badge award fails
  }
}