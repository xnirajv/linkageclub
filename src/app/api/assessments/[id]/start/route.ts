import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

// Define interfaces for better type safety
interface IQuestion {
  _id: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  points: number;
  correctAnswer?: number; // This should not be sent to client
}

interface IAttempt {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  score: number;
  passed: boolean;
  answers: Array<{
    questionId: mongoose.Types.ObjectId;
    selectedOption: number;
    isCorrect: boolean;
    pointsEarned: number;
  }>;
  timeSpent: number;
  startedAt: Date;
  completedAt: Date | null;
}

interface IAssessment {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  duration: number; // in minutes
  questions: IQuestion[];
  attempts: IAttempt[];
}

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

    await connectDB();

    const assessment = await Assessment.findById(params.id) as IAssessment | null;

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Check if user has already attempted
    const existingAttempt = assessment.attempts?.find(
      (a: IAttempt) => a.userId.toString() === session.user.id
    );

    if (existingAttempt) {
      return NextResponse.json(
        { error: 'You have already attempted this assessment' },
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

      // Verify payment
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

    // Create attempt with proper typing
    const attempt: IAttempt = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(session.user.id),
      score: 0,
      passed: false,
      answers: [],
      timeSpent: 0,
      startedAt: new Date(),
      completedAt: null,
    };

    // Initialize attempts array if it doesn't exist
    if (!assessment.attempts) {
      assessment.attempts = [];
    }
    
    assessment.attempts.push(attempt);
    await (assessment as any).save(); // Use type assertion for save

    // Return questions without answers (don't send correctAnswer to client)
    const questions = assessment.questions.map((q: IQuestion) => ({
      id: q._id,
      question: q.question,
      options: q.options,
      points: q.points,
    }));

    // Get the ID of the attempt we just added
    const attemptId = assessment.attempts[assessment.attempts.length - 1]._id;

    return NextResponse.json({
      message: 'Assessment started',
      attemptId,
      questions,
      duration: assessment.duration,
      totalPoints: assessment.questions.reduce((acc: number, q: IQuestion) => acc + q.points, 0),
    });
  } catch (error) {
    console.error('Error starting assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}