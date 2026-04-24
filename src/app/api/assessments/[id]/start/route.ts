import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

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

    await connectDB();

    const assessment = await Assessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    if (!assessment.isActive) {
      return NextResponse.json(
        { error: 'Assessment is not available' },
        { status: 400 }
      );
    }

    // Check for existing incomplete attempt (resume functionality)
    const existingAttemptIndex = assessment.attempts?.findIndex(
      (a: any) =>
        a.userId?.toString() === session.user.id && !a.completedAt
    );

    if (existingAttemptIndex !== undefined && existingAttemptIndex >= 0) {
      const existingAttempt = assessment.attempts[existingAttemptIndex];
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(existingAttempt.startedAt).getTime()) / 1000
      );
      const totalSeconds = assessment.duration * 60;
      const timeLeft = Math.max(0, totalSeconds - elapsedSeconds);

      // Return resume data
      return NextResponse.json({
        message: 'Resuming assessment',
        attemptId: (existingAttempt as any)._id,
        questions: assessment.questions.map((q: any) => ({
          id: q._id,
          question: q.question,
          options: q.options,
          points: q.points || 1,
        })),
        duration: assessment.duration,
        timeLeft,
        totalPoints: assessment.questions.reduce(
          (acc: number, q: any) => acc + (q.points || 1),
          0
        ),
        savedAnswers: existingAttempt.answers || [],
        startedAt: existingAttempt.startedAt,
      });
    }

    // Check payment for paid assessments
    if (assessment.price > 0) {
      const paymentId = req.nextUrl.searchParams.get('paymentId');

      if (!paymentId) {
        return NextResponse.json(
          { error: 'Payment required', requiredAmount: assessment.price },
          { status: 402 }
        );
      }

      const payment = await Payment.findOne({
        _id: paymentId,
        userId: session.user.id,
        assessmentId: assessment._id,
        status: 'completed',
      });

      if (!payment) {
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }
    }

    // Create new attempt
    const newAttempt = {
      userId: new mongoose.Types.ObjectId(session.user.id),
      answers: [],
      score: 0,
      passed: false,
      timeSpent: 0,
      startedAt: new Date(),
      completedAt: null,
    };

    assessment.attempts.push(newAttempt);
    await assessment.save();

    const createdAttempt = assessment.attempts[assessment.attempts.length - 1];

    return NextResponse.json({
      message: 'Assessment started successfully',
      attemptId: (createdAttempt as any)._id,
      questions: assessment.questions.map((q: any) => ({
        id: q._id,
        question: q.question,
        options: q.options,
        points: q.points || 1,
      })),
      duration: assessment.duration,
      timeLeft: assessment.duration * 60,
      totalPoints: assessment.questions.reduce(
        (acc: number, q: any) => acc + (q.points || 1),
        0
      ),
      startedAt: createdAttempt.startedAt,
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}