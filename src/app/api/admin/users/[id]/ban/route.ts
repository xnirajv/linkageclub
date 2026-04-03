import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const banSchema = z.object({
  reason: z.string().min(5),
  duration: z.enum(['temporary', 'permanent']),
  days: z.number().optional(),
});

export async function POST(
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
    const validation = banSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
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

    // Calculate ban expiry
    let banExpiresAt: Date | null = null;
    if (validation.data.duration === 'temporary' && validation.data.days) {
      banExpiresAt = new Date();
      banExpiresAt.setDate(banExpiresAt.getDate() + validation.data.days);
    }

    user.isBanned = true;
    user.banReason = validation.data.reason;
    user.banExpiresAt = banExpiresAt;
    user.bannedBy = session.user.id;
    user.bannedAt = new Date();
    await user.save();

    return NextResponse.json({
      message: 'User banned successfully',
      banExpiresAt,
    });
  } catch (error) {
    console.error('Error banning user:', error);
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

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Unban user
    user.isBanned = false;
    user.banReason = undefined;
    user.banExpiresAt = undefined;
    user.bannedBy = undefined;
    user.bannedAt = undefined;
    await user.save();

    return NextResponse.json({
      message: 'User unbanned successfully',
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
