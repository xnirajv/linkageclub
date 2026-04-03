import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import SavedJob from '@/lib/db/models/savedJob';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

export async function POST(
  _req: NextRequest,
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

    const jobId = new mongoose.Types.ObjectId(params.id);
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Check if already saved
    const existingSaved = await SavedJob.findOne({
      userId,
      jobId,
    });

    if (existingSaved) {
      // Remove from saved
      await SavedJob.deleteOne({ _id: existingSaved._id });
      
      return NextResponse.json({
        message: 'Job removed from saved',
        saved: false,
      });
    } else {
      // Add to saved
      await SavedJob.create({
        userId,
        jobId,
        savedAt: new Date(),
      });
      
      return NextResponse.json({
        message: 'Job saved successfully',
        saved: true,
      });
    }
  } catch (error) {
    console.error('Error saving job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: NextRequest,
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

    const saved = await SavedJob.exists({
      userId: session.user.id,
      jobId: params.id,
    });

    return NextResponse.json({ saved: !!saved });
  } catch (error) {
    console.error('Error checking saved job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}