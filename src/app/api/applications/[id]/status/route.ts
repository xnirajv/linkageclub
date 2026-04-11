import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import Project from '@/lib/db/models/project';
import Job from '@/lib/db/models/job';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { sendApplicationStatusEmail } from '@/lib/email/application';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

const statusUpdateSchema = z.object({
  status: z.enum([
    'pending',
    'reviewed',
    'shortlisted',
    'interview_scheduled',
    'interview_completed',
    'interview_cancelled',
    'accepted',
    'rejected',
    'withdrawn',
  ]),
  notes: z.string().trim().max(2000).optional(),
  sendEmail: z.boolean().default(true),
});

const batchUpdateSchema = z.object({
  applicationIds: z.array(z.string()).min(1),
  status: statusUpdateSchema.shape.status,
  notes: z.string().trim().max(2000).optional(),
  sendEmail: z.boolean().default(false),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw errors.unauthorized();
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw errors.invalidInput('application id');
    }

    const body = await req.json();
    const validation = statusUpdateSchema.safeParse(body);
    if (!validation.success) {
      throw errors.badRequest(validation.error.errors[0]?.message || 'Validation failed');
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name email')
      .populate('companyId', 'name email')
      .populate('projectId', 'title')
      .populate('jobId', 'title');

    if (!application) {
      throw errors.notFound('Application');
    }

    const isApplicant = application.applicantId?._id?.toString() === session.user.id;
    const isCompany = application.companyId?._id?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (validation.data.status === 'withdrawn') {
      if (!isApplicant && !isAdmin) {
        throw errors.forbidden();
      }
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

    if (application.type === 'project' && application.projectId?._id) {
      await Project.updateOne(
        {
          _id: application.projectId._id,
          'applications.userId': application.applicantId._id,
        },
        {
          $set: {
            'applications.$.status': validation.data.status,
            'applications.$.reviewedAt': new Date(),
            'applications.$.reviewNotes': validation.data.notes,
          },
        }
      );

      if (validation.data.status === 'accepted') {
        await Project.findByIdAndUpdate(application.projectId._id, {
          status: 'in_progress',
          selectedApplicant: application.applicantId._id,
          startDate: new Date(),
        });
      }
    }

    if (application.type === 'job' && validation.data.status === 'accepted' && application.jobId?._id) {
      const job = await Job.findById(application.jobId._id);
      if (job) {
        const hiredCount = job.applications?.filter((item: { status?: string }) => item.status === 'hired').length || 0;
        if (hiredCount >= (job.openings || 1)) {
          job.status = 'filled';
          await job.save();
        }
      }
    }

    const projectDoc = application.projectId as { _id?: mongoose.Types.ObjectId; title?: string } | null;
    const jobDoc = application.jobId as { _id?: mongoose.Types.ObjectId; title?: string } | null;
    const title = application.type === 'project' ? projectDoc?.title || 'project' : jobDoc?.title || 'job';

    try {
      await Notification.create({
        userId: isCompany ? application.applicantId._id : application.companyId._id,
        type: 'application_status',
        title: `Application ${validation.data.status}`,
        message: `Your application for ${title} is now ${validation.data.status}`,
        data: {
          applicationId: application._id,
          oldStatus,
          newStatus: validation.data.status,
          notes: validation.data.notes,
        },
        category: 'application',
        priority: ['accepted', 'rejected'].includes(validation.data.status) ? 'high' : 'medium',
      });

      if (validation.data.sendEmail) {
        const recipient = isCompany ? application.applicantId : application.companyId;
        await sendApplicationStatusEmail(
          recipient as never,
          title,
          validation.data.status,
          validation.data.notes
        );
      }
    } catch (sideEffectError) {
      console.error('Application status side effect failed:', sideEffectError);
    }

    return successResponse({
      application: {
        _id: application._id.toString(),
        status: application.status,
        reviewedAt: application.reviewedAt,
        reviewedBy: application.reviewedBy,
        reviewNotes: application.reviewNotes,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw errors.unauthorized();
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw errors.invalidInput('application id');
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .select('status statusHistory reviewedAt reviewedBy reviewNotes applicantId companyId createdAt')
      .lean();

    if (!application) {
      throw errors.notFound('Application');
    }

    const isApplicant = application.applicantId?.toString() === session.user.id;
    const isCompany = application.companyId?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isApplicant && !isCompany && !isAdmin) {
      throw errors.forbidden();
    }

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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'company') {
      throw errors.unauthorized();
    }

    const body = await req.json();
    const validation = batchUpdateSchema.safeParse(body);
    if (!validation.success) {
      throw errors.badRequest(validation.error.errors[0]?.message || 'Validation failed');
    }

    await connectDB();

    const applications = await Application.find({
      _id: { $in: validation.data.applicationIds },
      companyId: session.user.id,
    }).select('_id applicantId statusHistory');

    if (applications.length !== validation.data.applicationIds.length) {
      throw errors.forbidden();
    }

    const now = new Date();
    await Promise.all(
      applications.map(async (application) => {
        application.status = validation.data.status;
        application.reviewNotes = validation.data.notes;
        application.reviewedAt = now;
        application.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
        application.statusHistory = [
          ...(application.statusHistory || []),
          {
            status: validation.data.status,
            timestamp: now,
            notes: validation.data.notes,
            updatedBy: new mongoose.Types.ObjectId(session.user.id),
          },
        ];
        await application.save();
      })
    );

    await Notification.insertMany(
      applications.map((application) => ({
        userId: application.applicantId,
        type: 'application_status',
        title: `Application ${validation.data.status}`,
        message: `Your application status is now ${validation.data.status}`,
        data: {
          applicationId: application._id,
          newStatus: validation.data.status,
          notes: validation.data.notes,
        },
        category: 'application',
      }))
    );

    return successResponse({
      updated: applications.length,
      status: validation.data.status,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
