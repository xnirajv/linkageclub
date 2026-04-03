import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  categories: z.object({
    application: z.boolean(),
    project: z.boolean(),
    payment: z.boolean(),
    session: z.boolean(),
    message: z.boolean(),
    system: z.boolean(),
    promotional: z.boolean(),
  }),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('preferences');

    return NextResponse.json({
      preferences: user?.preferences || {
        emailNotifications: true,
        pushNotifications: true,
        categories: {
          application: true,
          project: true,
          payment: true,
          session: true,
          message: true,
          system: true,
          promotional: false,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = preferencesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        'preferences.emailNotifications': validation.data.emailNotifications,
        'preferences.pushNotifications': validation.data.pushNotifications,
        'preferences.notificationCategories': validation.data.categories,
      },
      { new: true }
    ).select('preferences');

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: user?.preferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}