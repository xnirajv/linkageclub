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

    // ✅ Sirf INCOMPLETE attempt check karo (resume ke liye)
    const existingIncompleteAttempt = assessment.attempts?.find(
      (a: any) => a.userId?.toString() === session.user.id && a.completedAt === null
    );

    // Agar incomplete attempt hai toh resume karo
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
        existingAnswers: existingIncompleteAttempt.answers,
        timeSpent: existingIncompleteAttempt.timeSpent,
      });
    }

    // ✅ Naya attempt hamesha banao (chaahe pehli baar ho ya retake)
    const newAttempt = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(session.user.id),
      score: 0,
      passed: false,
      answers: new Array(assessment.questions.length).fill(-1),
      timeSpent: 0,
      startedAt: new Date(),
      completedAt: null,
    };

    if (!assessment.attempts) {
      assessment.attempts = [];
    }
    
    assessment.attempts.push(newAttempt);
    await assessment.save();

    const questions = assessment.questions.map((q: any) => ({
      id: q._id,
      question: q.question,
      options: q.options,
      points: q.points,
    }));

    return NextResponse.json({
      success: true,
      attemptId: newAttempt._id,
      questions,
      duration: assessment.duration,
      totalPoints: assessment.questions.reduce((acc: number, q: any) => acc + q.points, 0),
      existingAnswers: new Array(assessment.questions.length).fill(-1),
      timeSpent: 0,
    });

  } catch (error) {
    console.error('Start assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}