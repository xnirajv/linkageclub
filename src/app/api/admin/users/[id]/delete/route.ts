import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import Project from '@/lib/db/models/project';
import Job from '@/lib/db/models/job';
import Application from '@/lib/db/models/application';
import Mentor from '@/lib/db/models/mentor';
import { Post, Comment } from '@/lib/db/models/community';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';

export async function DELETE(
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

    const url = new URL(req.url);
    const permanent = url.searchParams.get('permanent') === 'true';
    const reason = url.searchParams.get('reason');
    const anonymize = url.searchParams.get('anonymize') !== 'false';

    await connectDB();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    if (permanent) {
      // PERMANENT DELETION - Use with caution!
      
      // Delete all user-related data based on role
      const deletePromises: Array<PromiseLike<unknown>> = [];

      // Delete projects (if company)
      if (user.role === 'company') {
        deletePromises.push(Project.deleteMany({ companyId: user._id }));
        deletePromises.push(Job.deleteMany({ companyId: user._id }));
      }

      // Delete applications
      deletePromises.push(Application.deleteMany({ applicantId: user._id }));

      // Delete mentor data (if mentor)
      if (user.role === 'mentor') {
        deletePromises.push(Mentor.deleteOne({ userId: user._id }));
      }

      // Delete community posts and comments
      deletePromises.push(Post.deleteMany({ authorId: user._id }));
      deletePromises.push(Comment.deleteMany({ authorId: user._id }));

      // Delete payments (anonymize or delete based on policy)
      if (anonymize) {
        // Anonymize payments instead of deleting for financial records
        deletePromises.push(
          Payment.updateMany(
            { $or: [{ userId: user._id }, { recipientId: user._id }] },
            {
              $set: {
                'userId': null,
                'recipientId': null,
                'userDetails': {
                  name: '[Deleted User]',
                  email: '[deleted]',
                },
              },
            }
          )
        );
      } else {
        deletePromises.push(
          Payment.deleteMany({ 
            $or: [{ userId: user._id }, { recipientId: user._id }] 
          })
        );
      }

      // Finally, delete the user
      deletePromises.push(User.findByIdAndDelete(user._id));

      await Promise.all(deletePromises);

      // Log the permanent deletion
      console.log(`User ${user._id} permanently deleted by admin ${session.user.id}`, {
        reason,
        anonymized: anonymize,
      });

      return NextResponse.json({
        message: 'User permanently deleted successfully',
        userId: user._id,
        permanent: true,
      });
    } else {
      // SOFT DELETE - Anonymize or deactivate
      
      const updates: any = {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: session.user.id,
      };

      if (anonymize) {
        // Anonymize personal information
        updates.name = 'Deleted User';
        updates.email = `deleted_${user._id}@deleted.internhub.com`;
        updates.avatar = null;
        updates.phone = null;
        updates.bio = null;
        updates.location = null;
        updates.socialLinks = {};
        updates.skills = [];
        updates.badges = [];
      }

      // Update user
      await User.findByIdAndUpdate(user._id, { $set: updates });

      // Deactivate related records
      if (user.role === 'mentor') {
        await Mentor.updateOne(
          { userId: user._id },
          { $set: { isActive: false } }
        );
      }

      // Close active projects if company
      if (user.role === 'company') {
        await Project.updateMany(
          { companyId: user._id, status: { $in: ['open', 'in_progress'] } },
          { $set: { status: 'cancelled' } }
        );
        await Job.updateMany(
          { companyId: user._id, status: 'published' },
          { $set: { status: 'closed' } }
        );
      }

      // Log the soft deletion
      console.log(`User ${user._id} soft deleted by admin ${session.user.id}`, {
        reason,
        anonymized: anonymize,
      });

      return NextResponse.json({
        message: 'User deactivated successfully',
        userId: user._id,
        permanent: false,
        anonymized: anonymize,
      });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get deletion history for a user
export async function GET(
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

    const user = await User.findById(params.id).select(
      'isActive deletedAt deletedBy name email'
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get deletion history from audit log (mock for now)
    const deletionHistory = [
      {
        action: user.isActive ? 'active' : 'deleted',
        performedAt: user.deletedAt || user.createdAt,
        performedBy: user.deletedBy || 'system',
        reason: user.deletedAt ? 'Admin action' : 'Account created',
      },
    ];

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        deletedAt: user.deletedAt,
      },
      history: deletionHistory,
    });
  } catch (error) {
    console.error('Error fetching deletion history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Restore a soft-deleted user
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
    const { restoreData } = body;

    await connectDB();

    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isActive) {
      return NextResponse.json(
        { error: 'User is already active' },
        { status: 400 }
      );
    }

    // Restore user
    const updates: any = {
      isActive: true,
      deletedAt: null,
      deletedBy: null,
    };

    // If email was anonymized, we need to set a new one
    if (user.email?.includes('deleted_')) {
      if (!restoreData?.email) {
        return NextResponse.json(
          { error: 'New email required for restored user' },
          { status: 400 }
        );
      }
      updates.email = restoreData.email;
    }

    // If name was anonymized, restore it
    if (user.name === 'Deleted User' && restoreData?.name) {
      updates.name = restoreData.name;
    }

    await User.findByIdAndUpdate(user._id, { $set: updates });

    // Reactivate mentor profile if applicable
    if (user.role === 'mentor') {
      await Mentor.updateOne(
        { userId: user._id },
        { $set: { isActive: true } }
      );
    }

    // Log the restoration
    console.log(`User ${user._id} restored by admin ${session.user.id}`);

    return NextResponse.json({
      message: 'User restored successfully',
      userId: user._id,
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
