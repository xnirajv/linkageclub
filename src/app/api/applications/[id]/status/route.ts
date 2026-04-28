import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import Project from '@/lib/db/models/project';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

const statusUpdateSchema = z.object({
  status: z.enum([
    'pending', 'reviewed', 'shortlisted', 'interview_scheduled',
    'interview_completed', 'interview_cancelled', 'accepted', 'rejected', 'withdrawn',
  ]),
  notes: z.string().trim().max(2000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw errors.unauthorized();
    if (!mongoose.Types.ObjectId.isValid(params.id)) throw errors.invalidInput('application id');

    const body = await req.json();
    const validation = statusUpdateSchema.safeParse(body);
    if (!validation.success)
      throw errors.badRequest(validation.error.errors[0]?.message || 'Validation failed');

    await connectDB();

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name email')
      .populate('companyId', 'name email')
      .populate('projectId', 'title');

    if (!application) throw errors.notFound('Application');

    const isApplicant = (application.applicantId as any)?._id?.toString() === session.user.id;
    const isCompany = (application.companyId as any)?._id?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (validation.data.status === 'withdrawn') {
      if (!isApplicant && !isAdmin) throw errors.forbidden();
    } else if (!isCompany && !isAdmin) {
      throw errors.forbidden();
    }

    const immutableStatuses = new Set(['accepted', 'rejected', 'withdrawn']);
    if (immutableStatuses.has(application.status) && application.status !== validation.data.status) {
      throw errors.badRequest(`Cannot change status of ${application.status} application`);
    }

    const oldStatus = application.status;
    application.status = validation.data.status;
    application.reviewNotes = validation.data.notes || application.reviewNotes;
    application.reviewedAt = new Date();
    application.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
    application.statusHistory = [
      ...(application.statusHistory || []),
      {
        status: validation.data.status,
        timestamp: new Date(),
        notes: validation.data.notes,
        updatedBy: new mongoose.Types.ObjectId(session.user.id),
      },
    ];

    await application.save();

    if (application.type === 'project' && application.projectId && validation.data.status === 'accepted') {
      await Project.findByIdAndUpdate(application.projectId, {
        $set: { status: 'in_progress', selectedApplicant: application.applicantId, startDate: new Date() },
      });
    }

    const title =
      application.type === 'project'
        ? (application.projectId as any)?.title || 'project'
        : 'position';

    await Notification.create({
      userId: isCompany ? (application.applicantId as any)._id : (application.companyId as any)._id,
      type: 'application_status',
      title: `Application ${validation.data.status}`,
      message: `Your application for ${title} is now ${validation.data.status}`,
      data: { applicationId: application._id, oldStatus, newStatus: validation.data.status },
      category: 'application',
      priority: ['accepted', 'rejected'].includes(validation.data.status) ? 'high' : 'medium',
    });

    return successResponse({
      application: {
        _id: application._id.toString(),
        status: application.status,
        reviewedAt: application.reviewedAt,
        reviewNotes: application.reviewNotes,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw errors.unauthorized();
    if (!mongoose.Types.ObjectId.isValid(params.id)) throw errors.invalidInput('application id');

    await connectDB();

    const application = await Application.findById(params.id)
      .select('status statusHistory reviewedAt reviewedBy reviewNotes applicantId companyId createdAt')
      .lean();

    if (!application) throw errors.notFound('Application');

    const isApplicant = application.applicantId?.toString() === session.user.id;
    const isCompany = application.companyId?.toString() === session.user.id;
    if (!isApplicant && !isCompany && session.user.role !== 'admin') throw errors.forbidden();

    return successResponse({
      currentStatus: application.status,
      history: application.statusHistory || [],
      reviewedAt: application.reviewedAt,
      reviewNotes: application.reviewNotes,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}