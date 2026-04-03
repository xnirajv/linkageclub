import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id)
      .select('-password -emailVerificationToken -resetPasswordToken -email');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't show private email for non-authenticated users
    const userObject = user.toObject();
    
    // Option 1: Use a new object without the email property
    const { email, ...userWithoutEmail } = userObject;
    
    // Option 2: If you need to keep the original object, use type assertion
    // (userObject as any).email = undefined;
    // But better to create a new object without the property

    // If mentor, fetch mentor profile
    let mentorProfile = null;
    if (user.role === 'mentor') {
      mentorProfile = await Mentor.findOne({ userId: user._id });
    }

    return NextResponse.json({
      user: userWithoutEmail,
      mentorProfile,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
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

    const body = await req.json();
    
    await connectDB();

    const user = await User.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).select('-password -emailVerificationToken -resetPasswordToken');

    return NextResponse.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await User.findByIdAndDelete(params.id);

    // Also delete related data (mentor profile, applications, etc.)
    await Mentor.deleteOne({ userId: params.id });

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}