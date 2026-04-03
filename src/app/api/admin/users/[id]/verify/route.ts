import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user verification
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verifiedBy = session.user.id;
    await user.save();

    // If mentor, also update mentor verification
    if (user.role === 'mentor') {
      await Mentor.findOneAndUpdate(
        { userId: user._id },
        { isVerified: true }
      );
    }

    return NextResponse.json({
      message: 'User verified successfully',
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}