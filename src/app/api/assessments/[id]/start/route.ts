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

    console.log('Start API: Looking for existing incomplete attempt');
    
    // Find existing incomplete attempt
    const existingAttemptIndex = assessment.attempts?.findIndex(
      (a: any) => a.userId?.toString() === session.user.id && a.completedAt === null
    );

    if (existingAttemptIndex !== undefined && existingAttemptIndex !== -1) {
      console.log('Start API: Found existing incomplete attempt');
      const existingAttempt = assessment.attempts[existingAttemptIndex];
      
      const questions = assessment.questions.map((q: any) => ({
        id: q._id,
        question: q.question,
        options: q.options,
        points: q.points,
      }));

      return NextResponse.json({
        success: true,
        attemptId: (existingAttempt as any)._id,
        questions,
        duration: assessment.duration,
        totalPoints: assessment.questions.reduce((acc: number, q: any) => acc + q.points, 0),
      });
    }

    console.log('Start API: Creating new attempt');
    
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

    console.log('Start API: Attempt saved successfully');
    
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