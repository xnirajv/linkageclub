import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const bulkActionSchema = z.object({
  userIds: z.array(z.string()),
  action: z.enum(['verify', 'unverify', 'ban', 'unban', 'delete', 'make-admin', 'remove-admin']),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = bulkActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userIds, action, reason } = validation.data;

    await connectDB();

    // Prevent admin from self-modifying through bulk actions
    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'Cannot perform bulk actions on yourself' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'verify':
        updateData = {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: session.user.id,
        };
        message = 'Users verified successfully';
        break;

      case 'unverify':
        updateData = {
          isVerified: false,
          verifiedAt: null,
          verifiedBy: null,
        };
        message = 'Users unverified successfully';
        break;

      case 'ban':
        updateData = {
          isBanned: true,
          banReason: reason || 'Violation of terms',
          bannedAt: new Date(),
          bannedBy: session.user.id,
        };
        message = 'Users banned successfully';
        break;

      case 'unban':
        updateData = {
          isBanned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null,
        };
        message = 'Users unbanned successfully';
        break;

      case 'delete':
        // For delete, we'll soft delete or actually delete based on your policy
        await User.deleteMany({ _id: { $in: userIds } });
        return NextResponse.json({
          message: `Successfully deleted ${userIds.length} users`,
        });

      case 'make-admin':
        updateData = {
          role: 'admin',
        };
        message = 'Users promoted to admin successfully';
        break;

      case 'remove-admin':
        updateData = {
          role: 'student', // Default role when removing admin
        };
        message = 'Admin privileges removed successfully';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Perform bulk update
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    // Log the bulk action for audit trail
    console.log(`Bulk ${action} performed by admin ${session.user.id}`, {
      userIds,
      reason,
      modifiedCount: result.modifiedCount,
    });

    return NextResponse.json({
      message,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Bulk user action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get bulk action history
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // This would typically come from a separate audit log collection
    // For now, return mock data
    const bulkActions = [
      {
        id: '1',
        action: 'verify',
        userIds: ['user1', 'user2', 'user3'],
        performedBy: 'admin@internhub.com',
        performedAt: new Date(Date.now() - 86400000).toISOString(),
        reason: 'Bulk verification of approved companies',
        status: 'completed',
      },
      {
        id: '2',
        action: 'ban',
        userIds: ['user4', 'user5'],
        performedBy: 'admin@internhub.com',
        performedAt: new Date(Date.now() - 172800000).toISOString(),
        reason: 'Spam accounts',
        status: 'completed',
      },
    ];

    return NextResponse.json({ actions: bulkActions });
  } catch (error) {
    console.error('Error fetching bulk actions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}