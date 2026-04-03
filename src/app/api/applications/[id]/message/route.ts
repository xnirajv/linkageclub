import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import { Message, Conversation } from '@/lib/db/models/message';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import { uploadFile } from '@/lib/utils/upload';
import mongoose from 'mongoose';

const replySchema = z.object({
  messageId: z.string(),
  content: z.string().min(1, 'Reply cannot be empty'),
  attachments: z.array(z.string()).optional(),
});

// Helper function to get or create conversation
async function getOrCreateConversation(applicationId: string, applicantId: string, companyId: string) {
  let conversation = await Conversation.findOne({
    applicationId: new mongoose.Types.ObjectId(applicationId),
    type: 'project', // or 'job' based on application type
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [new mongoose.Types.ObjectId(applicantId), new mongoose.Types.ObjectId(companyId)],
      type: 'project',
      applicationId: new mongoose.Types.ObjectId(applicationId),
      unreadCount: new Map(),
      isArchived: new Map(),
      isMuted: new Map(),
    });
  }

  return conversation;
}

export async function POST(
  req: NextRequest,
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

    const formData = await req.formData();
    const content = formData.get('content') as string;
    const attachments = formData.getAll('attachments') as File[];

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name email')
      .populate('companyId', 'name email');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the application
    const isApplicant = application.applicantId._id.toString() === session.user.id;
    const isCompany = application.companyId._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isApplicant && !isCompany && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Determine receiver
    const receiverId = isApplicant ? application.companyId._id : application.applicantId._id;

    // Upload attachments if any
    const attachmentUrls: Array<{ url: string; type: string; name: string; size: number }> = [];
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        const url = await uploadFile(file, `applications/${application._id}/messages`);
        attachmentUrls.push({
          url,
          type: file.type,
          name: file.name,
          size: file.size,
        });
      }
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(
      params.id,
      application.applicantId._id.toString(),
      application.companyId._id.toString()
    );

    // Create message
    const message = await Message.create({
      conversationId: conversation._id.toString(),
      senderId: session.user.id,
      receiverId,
      content: content.trim(),
      type: attachmentUrls.length > 0 ? 'file' : 'text',
      attachments: attachmentUrls,
      read: false,
      delivered: false,
      isDeleted: false,
    });

    // Update conversation with last message
    conversation.lastMessage = {
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      senderId: new mongoose.Types.ObjectId(session.user.id),
      sentAt: new Date(),
    };

    // Update unread count for receiver
    const receiverIdStr = receiverId.toString();
    const currentUnread = conversation.unreadCount.get(receiverIdStr) || 0;
    conversation.unreadCount.set(receiverIdStr, currentUnread + 1);

    await conversation.save();

    // Create notification for recipient
    await Notification.create({
      userId: receiverId,
      type: 'new_message',
      title: 'New Message',
      message: `You have a new message from ${session.user.name} regarding your application`,
      data: {
        applicationId: application._id,
        messageId: message._id,
        conversationId: conversation._id,
        messagePreview: content.substring(0, 100),
        senderId: session.user.id,
        senderName: session.user.name,
      },
      link: `/dashboard/${isApplicant ? 'company' : 'student'}/applications/${application._id}`,
      category: 'message',
      priority: 'high',
    });

    return NextResponse.json({
      message: 'Message sent successfully',
      data: {
        id: message._id,
        content: message.content,
        attachments: message.attachments,
        type: message.type,
        createdAt: message.createdAt,
        conversationId: conversation._id,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all messages for an application
export async function GET(
  req: NextRequest,
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

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');

    await connectDB();

    const application = await Application.findById(params.id)
      .select('applicantId companyId');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the application
    const isApplicant = application.applicantId.toString() === session.user.id;
    const isCompany = application.companyId.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isApplicant && !isCompany && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      applicationId: new mongoose.Types.ObjectId(params.id),
    });

    if (!conversation) {
      return NextResponse.json({
        messages: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
          hasMore: false,
        },
      });
    }

    // Build query
    const query: any = {
      conversationId: conversation._id.toString(),
      isDeleted: false,
    };

    // Check if user has deleted this message
    query.deletedFor = { $nin: [new mongoose.Types.ObjectId(session.user.id)] };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get messages with pagination
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name email avatar')
      .populate('replyTo.senderId', 'name email')
      .lean();

    const total = await Message.countDocuments(query);

    // Mark messages as read
    const unreadMessages = await Message.find({
      _id: { $in: messages.map(m => m._id) },
      receiverId: session.user.id,
      read: false,
    });

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: unreadMessages.map(m => m._id) },
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
            delivered: true,
            deliveredAt: new Date(),
          },
        }
      );

      // Reset unread count in conversation
      const sessionUserId = session.user.id;
      conversation.unreadCount.set(sessionUserId, 0);
      await conversation.save();
    }

    // Transform messages for response
    const transformedMessages = messages.map(message => ({
      id: message._id,
      content: message.content,
      type: message.type,
      attachments: message.attachments,
      sender: {
        id: (message.senderId as any)._id,
        name: (message.senderId as any).name,
        email: (message.senderId as any).email,
        avatar: (message.senderId as any).avatar,
      },
      receiverId: message.receiverId,
      read: message.read,
      readAt: message.readAt,
      delivered: message.delivered,
      deliveredAt: message.deliveredAt,
      replyTo: message.replyTo ? {
        messageId: message.replyTo.messageId,
        content: message.replyTo.content,
        sender: message.replyTo.senderId ? {
          id: (message.replyTo.senderId as any)._id,
          name: (message.replyTo.senderId as any).name,
        } : null,
      } : null,
      reactions: message.reactions,
      createdAt: message.createdAt,
    }));

    return NextResponse.json({
      messages: transformedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
      conversation: {
        id: conversation._id,
        unreadCount: conversation.unreadCount.get(session.user.id) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reply to a specific message
export async function PUT(
  req: NextRequest,
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

    const body = await req.json();
    const validation = replySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name email')
      .populate('companyId', 'name email');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the application
    const isApplicant = application.applicantId._id.toString() === session.user.id;
    const isCompany = application.companyId._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isApplicant && !isCompany && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find original message
    const originalMessage = await Message.findById(validation.data.messageId);

    if (!originalMessage) {
      return NextResponse.json(
        { error: 'Original message not found' },
        { status: 404 }
      );
    }

    // Determine receiver
    const receiverId = isApplicant ? application.companyId._id : application.applicantId._id;

    // Create reply
    const reply = await Message.create({
      conversationId: originalMessage.conversationId,
      senderId: session.user.id,
      receiverId,
      content: validation.data.content,
      type: 'text',
      attachments: validation.data.attachments?.map(url => ({
        url,
        type: 'file',
        name: url.split('/').pop() || 'file',
        size: 0,
      })) || [],
      replyTo: {
        messageId: originalMessage._id,
        content: originalMessage.content,
        senderId: originalMessage.senderId,
      },
      read: false,
      delivered: false,
      isDeleted: false,
    });

    // Update conversation
    const conversation = await Conversation.findById(originalMessage.conversationId);
    if (conversation) {
      conversation.lastMessage = {
        content: validation.data.content.substring(0, 100) + (validation.data.content.length > 100 ? '...' : ''),
        senderId: new mongoose.Types.ObjectId(session.user.id),
        sentAt: new Date(),
      };

      const receiverIdStr = receiverId.toString();
      const currentUnread = conversation.unreadCount.get(receiverIdStr) || 0;
      conversation.unreadCount.set(receiverIdStr, currentUnread + 1);

      await conversation.save();
    }

    // Create notification
    await Notification.create({
      userId: receiverId,
      type: 'message_reply',
      title: 'New Reply',
      message: `${session.user.name} replied to your message`,
      data: {
        applicationId: application._id,
        messageId: reply._id,
        originalMessageId: originalMessage._id,
        messagePreview: validation.data.content.substring(0, 100),
      },
      link: `/dashboard/${isApplicant ? 'company' : 'student'}/applications/${application._id}`,
      category: 'message',
    });

    return NextResponse.json({
      message: 'Reply sent successfully',
      data: {
        id: reply._id,
        content: reply.content,
        type: reply.type,
        replyTo: {
          messageId: reply.replyTo?.messageId,
          content: reply.replyTo?.content,
        },
        createdAt: reply.createdAt,
      },
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark messages as read
export async function PATCH(
  req: NextRequest,
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

    const body = await req.json();
    const { messageIds } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update messages
    const result = await Message.updateMany(
      {
        _id: { $in: messageIds.map(id => new mongoose.Types.ObjectId(id)) },
        receiverId: session.user.id,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
          delivered: true,
          deliveredAt: new Date(),
        },
      }
    );

    // Update conversation unread count
    if (result.modifiedCount > 0) {
      const application = await Application.findById(params.id);
      if (application) {
        const conversation = await Conversation.findOne({
          applicationId: new mongoose.Types.ObjectId(params.id),
        });

        if (conversation) {
          conversation.unreadCount.set(session.user.id, 0);
          await conversation.save();
        }
      }
    }

    return NextResponse.json({
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a message (soft delete)
export async function DELETE(
  req: NextRequest,
  { }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');
    const deleteForEveryone = searchParams.get('deleteForEveryone') === 'true';

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user is the sender
    if (message.senderId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 401 }
      );
    }

    if (deleteForEveryone && message.senderId.toString() === session.user.id) {
      // Delete for everyone (soft delete)
      message.isDeleted = true;
      await message.save();
    } else {
      // Delete only for current user
      await Message.updateOne(
        { _id: message._id },
        { $addToSet: { deletedFor: new mongoose.Types.ObjectId(session.user.id) } }
      );
    }

    return NextResponse.json({
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}