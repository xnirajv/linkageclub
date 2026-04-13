import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import Project from '@/lib/db/models/project';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

const querySchema = z.object({
  type: z.enum(['all', 'active', 'completed']).default('all'),
  role: z.enum(['student', 'company']).default('student'),
});

type ProjectWithApplicationStatus = Record<string, unknown> & {
  _id: mongoose.Types.ObjectId | string;
  applicationStatus?: string;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.id !== params.userId && session.user.role !== 'admin')) {
      throw errors.unauthorized();
    }

    if (!mongoose.Types.ObjectId.isValid(params.userId)) {
      throw errors.invalidInput('user id');
    }

    const queryParams = querySchema.parse({
      type: req.nextUrl.searchParams.get('type') ?? undefined,
      role: req.nextUrl.searchParams.get('role') ?? undefined,
    });

    await connectDB();

    let projects: ProjectWithApplicationStatus[] = [];

    if (queryParams.role === 'company') {
      const companyQuery: Record<string, unknown> = { companyId: params.userId };

      if (queryParams.type === 'active') {
        companyQuery.status = { $in: ['open', 'in_progress'] };
      } else if (queryParams.type === 'completed') {
        companyQuery.status = 'completed';
      }

      const foundProjects = await Project.find(companyQuery)
        .populate('companyId', 'name avatar companyName')
        .sort({ createdAt: -1 })
        .lean();

      projects = foundProjects as ProjectWithApplicationStatus[];
    } else {
      const applications = await Application.find({
        applicantId: params.userId,
        type: 'project',
      }).select('projectId status');

      const validApplications = applications.filter((application) => application.projectId);
      const projectIds = validApplications.map((application) => application.projectId);

      if (projectIds.length === 0) {
        return successResponse({ projects: [] });
      }

      const studentQuery: Record<string, unknown> = { _id: { $in: projectIds } };

      if (queryParams.type === 'active') {
        studentQuery.status = { $in: ['open', 'in_progress'] };
      } else if (queryParams.type === 'completed') {
        studentQuery.status = 'completed';
      }

      const foundProjects = await Project.find(studentQuery)
        .populate('companyId', 'name avatar companyName')
        .sort({ createdAt: -1 })
        .lean();

      projects = foundProjects.map((project) => {
        const application = validApplications.find(
          (item) => item.projectId?.toString() === project._id.toString()
        );

        return {
          ...(project as ProjectWithApplicationStatus),
          applicationStatus: application?.status,
        };
      });
    }

    return successResponse({
      projects: projects.map((project) => ({
        ...project,
        _id:
          typeof project._id === 'string'
            ? project._id
            : project._id.toString(),
      })),
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
