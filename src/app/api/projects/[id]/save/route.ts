import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import Project from '@/lib/db/models/project';
import SavedProject from '@/lib/db/models/savedProject';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw errors.unauthorized();
    if (!mongoose.Types.ObjectId.isValid(params.id)) throw errors.invalidInput('project id');

    await connectDB();

    const project = await Project.findById(params.id).select('_id status');
    if (!project) throw errors.notFound('Project');

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const projectId = new mongoose.Types.ObjectId(params.id);

    const existing = await SavedProject.findOne({ userId, projectId }).select('_id');

    if (existing) {
      await SavedProject.deleteOne({ _id: existing._id });
      return successResponse({ saved: false, projectId: params.id });
    }

    await SavedProject.create({ userId, projectId, savedAt: new Date() });

    return successResponse({ saved: true, projectId: params.id });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw errors.unauthorized();
    if (!mongoose.Types.ObjectId.isValid(params.id)) throw errors.invalidInput('project id');

    await connectDB();

    const saved = await SavedProject.exists({ userId: session.user.id, projectId: params.id });

    return successResponse({ saved: Boolean(saved), projectId: params.id });
  } catch (error) {
    return handleAPIError(error);
  }
}