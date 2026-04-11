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

const projectSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50).max(5000),
  category: z.string(),
  skills: z.array(
    z.object({
      name: z.string(),
      level: z.enum(['beginner', 'intermediate', 'advanced']),
      mandatory: z.boolean().default(true),
    })
  ),
  budget: z.object({
    type: z.enum(['fixed', 'hourly', 'milestone']),
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('INR'),
  }).refine((budget) => budget.max >= budget.min, {
    message: 'Budget max must be greater than or equal to min',
    path: ['max'],
  }),
  duration: z.number().min(1).max(365),
  milestones: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      amount: z.number().min(0),
      deadline: z.number().min(1),
    })
  ).optional(),
  requirements: z.array(z.string()),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  visibility: z.enum(['public', 'private']).default('public'),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().optional(),
  skills: z.array(z.string()).default([]),
  minBudget: z.coerce.number().min(0).default(0),
  maxBudget: z.coerce.number().min(0).default(1000000),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']).default('open'),
  search: z.string().trim().optional(),
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

export async function GET(req: NextRequest) {
  try {
    const raw = {
      page: req.nextUrl.searchParams.get('page') ?? undefined,
      limit: req.nextUrl.searchParams.get('limit') ?? undefined,
      category: req.nextUrl.searchParams.get('category') ?? undefined,
      skills: req.nextUrl.searchParams.getAll('skills'),
      minBudget: req.nextUrl.searchParams.get('minBudget') ?? undefined,
      maxBudget: req.nextUrl.searchParams.get('maxBudget') ?? undefined,
      experienceLevel: req.nextUrl.searchParams.get('experienceLevel') ?? undefined,
      status: req.nextUrl.searchParams.get('status') ?? undefined,
      search: req.nextUrl.searchParams.get('search') ?? undefined,
    };

    const queryParams = listQuerySchema.parse(raw);

    await connectDB();

    const query: Record<string, unknown> = {
      status: queryParams.status,
      visibility: 'public',
    };

    if (queryParams.category) {
      query.category = queryParams.category;
    }

    if (queryParams.skills.length > 0) {
      query['skills.name'] = { $in: queryParams.skills };
    }

    query['budget.min'] = { $lte: queryParams.maxBudget };
    query['budget.max'] = { $gte: queryParams.minBudget };

    if (queryParams.experienceLevel) {
      query.experienceLevel = queryParams.experienceLevel;
    }

    if (queryParams.search) {
      const pattern = new RegExp(escapeRegex(queryParams.search), 'i');
      const matchingCompanies = await User.find({
        $or: [
          { name: pattern },
          { companyName: pattern },
        ],
      }).select('_id').lean();

      query.$or = [
        { title: pattern },
        { description: pattern },
        { companyId: { $in: matchingCompanies.map((company) => company._id) } },
      ];
    }

    const skip = (queryParams.page - 1) * queryParams.limit;
    const [projects, total, session] = await Promise.all([
      Project.find(query)
        .populate('companyId', 'name avatar companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(queryParams.limit)
        .lean(),
      Project.countDocuments(query),
      getServerSession(authOptions),
    ]);

    let savedIds = new Set<string>();
    let appliedIds = new Set<string>();
    let userSkills: string[] = [];

    if (session?.user?.id) {
      const [savedProjects, appliedProjects, user] = await Promise.all([
        SavedProject.find({ userId: session.user.id }).select('projectId').lean(),
        Application.find({
          applicantId: session.user.id,
          type: 'project',
          projectId: { $in: projects.map((project) => project._id) },
        }).select('projectId').lean(),
        User.findById(session.user.id).select('skills').lean(),
      ]);

      savedIds = new Set(savedProjects.map((item) => item.projectId.toString()));
      appliedIds = new Set(appliedProjects.map((item) => item.projectId?.toString()).filter(Boolean) as string[]);
      userSkills = getSkillNames(user?.skills);
    }

    const serializedProjects = projects.map((project) => {
      const projectSkills = getSkillNames(project.skills);
      const matchingSkills = projectSkills.filter((skill) => userSkills.includes(skill));
      const matchScore = projectSkills.length > 0 ? Math.round((matchingSkills.length / projectSkills.length) * 100) : 0;
      const projectId = project._id.toString();

      return {
        ...project,
        _id: projectId,
        isSaved: savedIds.has(projectId),
        hasApplied: appliedIds.has(projectId),
        matchScore,
      };
    });

    return successResponse({
      projects: serializedProjects,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'company') {
      throw errors.unauthorized();
    }

    const body = await req.json();
    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      throw errors.badRequest(validation.error.errors[0]?.message || 'Validation failed');
    }

    await connectDB();

    const project = await Project.create({
      ...validation.data,
      companyId: new mongoose.Types.ObjectId(session.user.id),
      status: 'open',
      applications: [],
      applicationsCount: 0,
      views: 0,
    });

    return successResponse(
      {
        project,
      },
      201
    );
  } catch (error) {
    return handleAPIError(error);
  }
}
