import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MongoServerError } from 'mongodb';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import Project from '@/lib/db/models/project';
import Application from '@/lib/db/models/application';
import User from '@/lib/db/models/user';
import Notification from '@/lib/db/models/notification';
import { errors, handleAPIError, successResponse } from '@/lib/api/errors';

const applySchema = z.object({
  proposedAmount: z.number().min(0),
  proposedDuration: z.number().int().min(1),
  coverLetter: z.string().trim().min(20).max(2000),
  portfolio: z.string().url().optional(),
  attachments: z.array(z.string()).max(5).optional().default([]),
  additionalInfo: z.string().trim().max(2000).optional(),
});

function getSkillNames(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];
  return skills
    .map((s) => {
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object' && 'name' in s) return String((s as any).name || '');
      return '';
    })
    .filter(Boolean);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) throw errors.unauthorized();
    if (session.user.role !== 'student') throw errors.forbidden();
    if (!mongoose.Types.ObjectId.isValid(params.id)) throw errors.invalidInput('project id');

    const body = await req.json();
    const validation = applySchema.safeParse(body);
    if (!validation.success) {
      throw errors.badRequest(validation.error.errors[0]?.message || 'Validation failed');
    }

    await connectDB();

    const project = await Project.findById(params.id).populate('companyId', 'name email').lean();
    if (!project) throw errors.notFound('Project');

    const company = project.companyId as { _id: mongoose.Types.ObjectId; email?: string; name?: string };

    if (project.status !== 'open') throw errors.badRequest('Project is no longer accepting applications');
    if (company._id.toString() === session.user.id) throw errors.badRequest('Cannot apply to own project');

    const { proposedAmount, proposedDuration, coverLetter, portfolio, attachments, additionalInfo } =
      validation.data;

    if (proposedAmount < project.budget.min || proposedAmount > project.budget.max) {
      throw errors.badRequest(`Amount must be between ${project.budget.min} and ${project.budget.max}`);
    }
    if (proposedDuration > project.duration) {
      throw errors.badRequest(`Duration cannot exceed ${project.duration} days`);
    }

    const [user] = await Promise.all([User.findById(session.user.id).select('skills name').lean()]);

    const userSkills = getSkillNames(user?.skills);
    const requiredSkills = (Array.isArray(project.skills) ? project.skills : [])
      .filter((s) => s.mandatory)
      .map((s) => s.name);
    const matchedSkills = requiredSkills.filter((s) => userSkills.includes(s));
    const missingSkills = requiredSkills.filter((s) => !userSkills.includes(s));
    const matchScore =
      requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 100) : 0;

    let application;
    try {
      application = await Application.create({
        type: 'project',
        projectId: new mongoose.Types.ObjectId(params.id),
        applicantId: new mongoose.Types.ObjectId(session.user.id),
        companyId: new mongoose.Types.ObjectId(company._id),
        proposedAmount,
        proposedDuration,
        coverLetter,
        portfolio,
        attachments,
        additionalInfo,
        status: 'pending',
        matchScore,
        matchedSkills,
        missingSkills,
        submittedAt: new Date(),
      });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw errors.conflict('You have already applied to this project');
      }
      throw error;
    }

    await Project.updateOne(
      { _id: params.id, 'applications.userId': { $ne: session.user.id } },
      {
        $push: {
          applications: {
            userId: new mongoose.Types.ObjectId(session.user.id),
            proposedAmount,
            proposedDuration,
            coverLetter,
            attachments,
            status: 'pending',
            submittedAt: new Date(),
          },
        },
        $inc: { applicationsCount: 1 },
      }
    );

    try {
      await Notification.create({
        userId: company._id,
        type: 'new_application',
        title: 'New Project Application',
        message: `${session.user.name} has applied to ${project.title}`,
        data: { projectId: project._id, applicationId: application._id, matchScore },
        link: `/dashboard/company/my-projects/${project._id}/applications`,
        category: 'application',
        priority: 'high',
      });
    } catch {
      // Non-critical
    }

    return successResponse(
      {
        application: {
          _id: application._id,
          status: application.status,
          matchScore: application.matchScore,
          hasApplied: true,
        },
      },
      201
    );
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

    const application = await Application.findOne({
      projectId: params.id,
      applicantId: session.user.id,
      type: 'project',
    })
      .select('status submittedAt proposedAmount proposedDuration matchScore')
      .lean();

    return successResponse({
      hasApplied: Boolean(application),
      application: application ? { ...application, _id: application._id.toString() } : null,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}