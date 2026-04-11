import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import Project from '@/lib/db/models/project';
import User from '@/lib/db/models/user';
import Application from '@/lib/db/models/application';
import SavedProject from '@/lib/db/models/savedProject';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

const updateProjectSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(50).max(5000).optional(),
  category: z.string().optional(),
  skills: z.array(
    z.object({
      name: z.string(),
      level: z.enum(['beginner', 'intermediate', 'advanced']),
      mandatory: z.boolean(),
    })
  ).optional(),
  budget: z.object({
    type: z.enum(['fixed', 'hourly', 'milestone']),
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().optional(),
  }).optional(),
  duration: z.number().min(1).max(365).optional(),
  milestones: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      amount: z.number().min(0),
      deadline: z.number().min(1),
    })
  ).optional(),
  requirements: z.array(z.string()).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']).optional(),
  visibility: z.enum(['public', 'private']).optional(),
});

function getSkillNames(skills: unknown): string[] {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills
    .map((skill) => {
      if (typeof skill === 'string') {
        return skill;
      }

      if (skill && typeof skill === 'object' && 'name' in skill) {
        return String((skill as { name?: unknown }).name || '');
      }

      return '';
    })
    .filter(Boolean);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw errors.invalidInput('project id');
    }

    await connectDB();

    const session = await getServerSession(authOptions);

    const project = await Project.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('companyId', 'name avatar companyName bio location')
      .lean();

    if (!project) {
      throw errors.notFound('Project');
    }

    let isSaved = false;
    let hasApplied = false;
    let matchScore = 0;

    if (session?.user?.id) {
      const [savedProject, existingApplication, user] = await Promise.all([
        SavedProject.findOne({ userId: session.user.id, projectId: params.id }).select('_id').lean(),
        Application.findOne({
          applicantId: session.user.id,
          projectId: params.id,
          type: 'project',
        }).select('_id').lean(),
        User.findById(session.user.id).select('skills').lean(),
      ]);

      isSaved = Boolean(savedProject);
      hasApplied = Boolean(existingApplication);

      const userSkills = getSkillNames(user?.skills);
      const projectSkills = getSkillNames(project.skills);
      const matchingSkills = projectSkills.filter((skill) => userSkills.includes(skill));
      matchScore = projectSkills.length > 0 ? Math.round((matchingSkills.length / projectSkills.length) * 100) : 0;
    }

    return successResponse({
      project: {
        ...project,
        _id: project._id.toString(),
        isSaved,
        hasApplied,
        matchScore,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

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
      throw errors.invalidInput('project id');
    }

    const body = await req.json();
    const validation = updateProjectSchema.safeParse(body);
    if (!validation.success) {
      throw errors.badRequest(validation.error.errors[0]?.message || 'Validation failed');
    }

    await connectDB();

    const project = await Project.findById(params.id);
    if (!project) {
      throw errors.notFound('Project');
    }

    if (project.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      throw errors.forbidden();
    }

    Object.entries(validation.data).forEach(([key, value]) => {
      if (value !== undefined) {
        (project as unknown as Record<string, unknown>)[key] = value;
      }
    });

    await project.save();

    return successResponse({
      project,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw errors.unauthorized();
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      throw errors.invalidInput('project id');
    }

    await connectDB();

    const project = await Project.findById(params.id);
    if (!project) {
      throw errors.notFound('Project');
    }

    if (project.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      throw errors.forbidden();
    }

    await project.deleteOne();
    await Promise.all([
      Application.deleteMany({ projectId: params.id, type: 'project' }),
      SavedProject.deleteMany({ projectId: params.id }),
    ]);

    return successResponse({
      deleted: true,
      projectId: params.id,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
