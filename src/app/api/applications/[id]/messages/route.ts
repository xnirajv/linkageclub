import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';

export async function GET(
  _req: NextRequest,
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

    await connectDB();

    const application = await Application.findById(params.id)
      .select('messages')
      .populate('messages.senderId', 'name avatar');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is part of the application
    const isApplicant = application.applicantId?.toString() === session.user.id;
    const isCompany = application.companyId?.toString() === session.user.id;

    if (!isApplicant && !isCompany) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mark messages as read
    const unreadMessages = application.messages.filter(
      (m: any) => !m.read && m.senderId.toString() !== session.user.id
    );

    unreadMessages.forEach((m: any) => {
      m.read = true;
      m.readAt = new Date();
    });

    await application.save();

    return NextResponse.json({
      messages: application.messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}