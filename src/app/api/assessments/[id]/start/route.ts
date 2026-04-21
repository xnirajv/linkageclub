import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
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

    // Check for existing incomplete attempt (completedAt = null)
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
        success: true,
        attemptId: (existingIncompleteAttempt as any)._id,
        questions,
        duration: assessment.duration,
        totalPoints: assessment.questions.reduce((acc: number, q: any) => acc + q.points, 0),
      });
    }

    // Check for completed attempt
    const existingCompletedAttempt = assessment.attempts?.find(
      (a: any) => a.userId?.toString() === session.user.id && a.completedAt !== null
    );

    if (existingCompletedAttempt) {
      return NextResponse.json(
        { error: 'You have already completed this assessment' },
        { status: 400 }
      );
    }

    // Create new attempt
    const newAttempt = {
      userId: new mongoose.Types.ObjectId(session.user.id),
      score: 0,
      passed: false,
      answers: [],
      timeSpent: 0,
      startedAt: new Date(),
      completedAt: new Date(),
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
      success: true,
      attemptId: (savedAttempt as any)._id,
      questions,
      duration: assessment.duration,
      totalPoints: assessment.questions.reduce((acc: number, q: any) => acc + q.points, 0),
    });

  } catch (error) {
    console.error('Start assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}