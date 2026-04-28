import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw errors.unauthorized();

    await connectDB();

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name avatar email phone trustScore skills')
      .populate('companyId', 'name avatar companyName')
      .populate('projectId')
      .populate('jobId')
      .lean();

    if (!application) throw errors.notFound('Application');

    const isApplicant = (application.applicantId as any)?._id?.toString() === session.user.id;
    const isCompany = (application.companyId as any)?._id?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isApplicant && !isCompany && !isAdmin) throw errors.unauthorized();

    return successResponse({
      application: { ...application, _id: application._id.toString() },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}