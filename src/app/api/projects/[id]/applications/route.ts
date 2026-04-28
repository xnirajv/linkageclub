import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import Project from '@/lib/db/models/project';
import Application from '@/lib/db/models/application';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

const querySchema = z.object({
  status: z.enum([
    'pending', 'reviewed', 'shortlisted', 'interview_scheduled',
    'interview_completed', 'interview_cancelled', 'accepted', 'rejected', 'withdrawn',
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw errors.unauthorized();
    if (!mongoose.Types.ObjectId.isValid(params.id)) throw errors.invalidInput('project id');

    const queryParams = querySchema.parse({
      status: req.nextUrl.searchParams.get('status') ?? undefined,
      page: req.nextUrl.searchParams.get('page') ?? undefined,
      limit: req.nextUrl.searchParams.get('limit') ?? undefined,
    });

    await connectDB();

    const project = await Project.findById(params.id).select('companyId title');
    if (!project) throw errors.notFound('Project');

    if (project.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      throw errors.forbidden();
    }

    const filter: Record<string, unknown> = { projectId: params.id, type: 'project' };
    if (queryParams.status) filter.status = queryParams.status;

    const skip = (queryParams.page - 1) * queryParams.limit;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('applicantId', 'name email avatar trustScore skills location')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(queryParams.limit)
        .lean(),
      Application.countDocuments(filter),
    ]);

    return successResponse({
      project: { _id: project._id.toString(), title: project.title },
      applications: applications.map((app) => ({ ...app, _id: app._id.toString() })),
      pagination: {
        page: queryParams.page,
        limit: queryParams.limit,
        total,
        pages: Math.ceil(total / queryParams.limit),
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}