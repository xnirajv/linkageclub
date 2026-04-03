import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type } = params;
    const validTypes = ['phone', 'id', 'linkedin', 'github'];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid verification type' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update verification status
    user.verification[type as keyof typeof user.verification] = true;

    // If it's LinkedIn or GitHub verification, also update social links
    if (type === 'linkedin' || type === 'github') {
      const body = await req.json();
      if (body.url) {
        user.socialLinks[type] = body.url;
      }
    }

    await user.save();

    return NextResponse.json({
      message: `${type} verified successfully`,
      verification: user.verification,
    });
  } catch (error) {
    console.error('Error verifying:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}