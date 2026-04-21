import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

export async function POST(
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

    // ✅ FIX: Check for INCOMPLETE attempt only (completedAt === null)
    const existingIncompleteAttempt = assessment.attempts?.find(
      (a: any) => a.userId?.toString() === session.user.id && a.completedAt === null
    );

    if (existingIncompleteAttempt) {
      const questions = assessment.questions.map((q: any) => ({
        id: q._id,
        question: q.question,
        options: q.options,
        points: q.points,
      }));

      return NextResponse.json({
        message: 'Resuming assessment',
        attemptId: (existingIncompleteAttempt as any)._id,
        questions,
        duration: assessment.duration,
        totalPoints: assessment.questions.reduce((acc: number, q: any) => acc + q.points, 0),
      });
    }

    // Check for COMPLETED attempt
    const existingCompletedAttempt = assessment.attempts?.find(
      (a: any) => a.userId?.toString() === session.user.id && a.completedAt !== null
    );

    if (existingCompletedAttempt) {
      return NextResponse.json(
        { error: 'You have already completed this assessment' },
        { status: 400 }
      );
    }

    // Check if payment required
    if (assessment.price > 0) {
      const { searchParams } = new URL(req.url);
      const paymentId = searchParams.get('paymentId');

      if (!paymentId) {
        return NextResponse.json(
          { error: 'Payment required for this assessment' },
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
      score: 0,
      passed: false,
      answers: [],
      timeSpent: 0,
      startedAt: new Date(),
      completedAt: null,
    };

    if (!assessment.attempts) {
      assessment.attempts = [];
    }
    
    assessment.attempts.push(newAttempt);
    await assessment.save();

    // Get the saved attempt
    const savedAttempt = assessment.attempts[assessment.attempts.length - 1];

    const questions = assessment.questions.map((q: any) => ({
      id: q._id,
      question: q.question,
      options: q.options,
      points: q.points,
    }));

    return NextResponse.json({
      message: 'Assessment started',
      attemptId: (savedAttempt as any)._id,
      questions,
      duration: assessment.duration,
      totalPoints: assessment.questions.reduce((acc: number, q: any) => acc + q.points, 0),
    });

  } catch (error) {
    console.error('Error starting assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}