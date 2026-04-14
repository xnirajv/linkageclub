import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/user';

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
    const { title, message, type, category, priority, userIds, roles } = body;

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
      const userQuery: Record<string, unknown> = {};
      if (Array.isArray(roles) && roles.length > 0) {
        userQuery.role = { $in: roles };
      }

      const recipients = await User.find(userQuery).select('_id').lean();
      if (recipients.length === 0) {
        return NextResponse.json(
          { error: 'No users found for broadcast' },
          { status: 404 }
        );
      }

      const notifications = await Notification.insertMany(
        recipients.map((user) => ({
          userId: user._id,
          title,
          message,
          type,
          category,
          priority: priority || 'medium',
          read: false,
        }))
      );

      return NextResponse.json({
        message: 'Broadcast notifications sent successfully',
        count: notifications.length,
      });
    }

  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
