import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const category = searchParams.get('category');

    const query: any = { userId: session.user.id };

    if (unreadOnly) {
      query.read = false;
    }

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      read: false,
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can send broadcast notifications' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, message, type, category, priority, userIds } = body;

    await connectDB();

    if (userIds && userIds.length > 0) {
      // Send to specific users
      const notifications = await Notification.insertMany(
        userIds.map((userId: string) => ({
          userId,
          title,
          message,
          type,
          category,
          priority: priority || 'medium',
          read: false,
        }))
      );

      return NextResponse.json({
        message: 'Notifications sent successfully',
        count: notifications.length,
      });
    } else {
      // Send to all users (broadcast)
      // This should be done in batches for large user bases
      // For now, we'll create a placeholder or use a different approach
      return NextResponse.json(
        { error: 'Broadcast notifications not implemented' },
        { status: 501 }
      );
    }

  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
