import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw errors.unauthorized();
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .select('messages applicantId companyId')
      .populate('messages.senderId', 'name avatar');

    if (!application) {
      throw errors.notFound('Application');
    }

    // Check if user is part of the application
    const isApplicant = application.applicantId?.toString() === session.user.id;
    const isCompany = application.companyId?.toString() === session.user.id;

    if (!isApplicant && !isCompany) {
      throw errors.unauthorized();
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

    return successResponse({
      messages: application.messages,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
