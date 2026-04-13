import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(['project', 'job', 'all']).default('all'),
  status: z.string().optional(),
  role: z.enum(['applicant', 'company']).optional(),
  projectId: z.string().optional(),
  jobId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw errors.unauthorized();
    }

    const queryParams = listQuerySchema.parse({
      page: req.nextUrl.searchParams.get('page') ?? undefined,
      limit: req.nextUrl.searchParams.get('limit') ?? undefined,
      type: req.nextUrl.searchParams.get('type') ?? undefined,
      status: req.nextUrl.searchParams.get('status') ?? undefined,
      role: req.nextUrl.searchParams.get('role') ?? undefined,
      projectId: req.nextUrl.searchParams.get('projectId') ?? undefined,
      jobId: req.nextUrl.searchParams.get('jobId') ?? undefined,
    });

    await connectDB();

    const query: Record<string, unknown> = {};

    if (queryParams.role === 'applicant') {
      query.applicantId = session.user.id;
    } else if (queryParams.role === 'company') {
      query.companyId = session.user.id;
    } else {
      query.$or = [{ applicantId: session.user.id }, { companyId: session.user.id }];
    }

    if (queryParams.type !== 'all') {
      query.type = queryParams.type;
    }

    if (queryParams.status) {
      query.status = queryParams.status;
    }

    if (queryParams.projectId) {
      query.projectId = queryParams.projectId;
    }

    if (queryParams.jobId) {
      query.jobId = queryParams.jobId;
    }

    const skip = (queryParams.page - 1) * queryParams.limit;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('applicantId', 'name avatar trustScore location skills experience')
        .populate('companyId', 'name avatar companyName')
        .populate('projectId', 'title budget category')
        .populate('jobId', 'title salary')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(queryParams.limit)
        .lean(),
      Application.countDocuments(query),
    ]);

    return successResponse({
      applications: applications.map((application) => ({
        ...application,
        _id: application._id.toString(),
      })),
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
