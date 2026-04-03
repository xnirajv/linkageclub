import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Project, { IProject } from '@/lib/db/models/project';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import mongoose from 'mongoose';

// Define extended type for project with matchScore
interface IProjectWithMatchScore {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  companyId: mongoose.Types.ObjectId | any;
  category: string;
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    mandatory: boolean;
  }>;
  budget: {
    type: 'fixed' | 'hourly' | 'milestone';
    min: number;
    max: number;
    currency: string;
  };
  duration: number;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    deadline: number;
    status: 'pending' | 'in_progress' | 'completed' | 'approved';
  }>;
  requirements: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  visibility: 'public' | 'private';
  applications: Array<{
    userId: mongoose.Types.ObjectId;
    proposedAmount: number;
    proposedDuration: number;
    coverLetter: string;
    attachments: string[];
    status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
    submittedAt: Date;
    reviewedAt?: Date;
    reviewNotes?: string;
  }>;
  selectedApplicant?: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  reviews: Array<{
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  tags: string[];
  views: number;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
  matchScore?: number;
}

const projectSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50).max(5000),
  category: z.string(),
  skills: z.array(z.object({
    name: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    mandatory: z.boolean().default(true),
  })),
  budget: z.object({
    type: z.enum(['fixed', 'hourly', 'milestone']),
    min: z.number().min(0),
    max: z.number().min(0),
  }),
  duration: z.number().min(1).max(365),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    amount: z.number(),
    deadline: z.number(),
  })).optional(),
  requirements: z.array(z.string()),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  visibility: z.enum(['public', 'private']).default('public'),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const skills = searchParams.getAll('skills');
    const minBudget = parseInt(searchParams.get('minBudget') || '0');
    const maxBudget = parseInt(searchParams.get('maxBudget') || '1000000');
    const experienceLevel = searchParams.get('experienceLevel');
    const status = searchParams.get('status') || 'open';
    const search = searchParams.get('search');

    const query: any = { status };

    if (category) {
      query.category = category;
    }

    if (skills.length > 0) {
      query['skills.name'] = { $in: skills };
    }

    if (minBudget || maxBudget) {
      query['budget.min'] = { $gte: minBudget };
      query['budget.max'] = { $lte: maxBudget };
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const projects = await Project.find(query)
      .populate('companyId', 'name avatar companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit) as (mongoose.Document & IProject)[];

    const total = await Project.countDocuments(query);

    // Get match scores for authenticated user
    const session = await getServerSession(authOptions);
    let userSkills: string[] = [];

    if (session) {
      const user = await User.findById(session.user.id).select('skills') as any;
      if (user && user.skills) {
        userSkills = user.skills.map((s: any) => {
          if (typeof s === 'string') return s;
          if (s && typeof s === 'object' && 'name' in s) return s.name;
          return '';
        }).filter(Boolean);
      }
    }

    // Map projects with match scores
    const projectsWithMatch: IProjectWithMatchScore[] = projects.map(project => {
      const projectObj = project.toObject() as IProjectWithMatchScore;
      
      if (session && userSkills.length > 0 && project.skills && project.skills.length > 0) {
        // Extract project skill names
        const projectSkillNames = project.skills.map(s => s.name);
        
        // Calculate matching skills
        const matchingSkills = projectSkillNames.filter(skillName => 
          userSkills.includes(skillName)
        );
        
        // Calculate match score
        const matchScore = Math.round((matchingSkills.length / projectSkillNames.length) * 100);
        
        // Add matchScore to the project object
        projectObj.matchScore = matchScore;
      }

      return projectObj;
    });

    return NextResponse.json({
      projects: projectsWithMatch,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'company') {
      return NextResponse.json(
        { error: 'Only companies can post projects' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.create({
      ...validation.data,
      companyId: session.user.id,
      status: 'open',
      applications: [],
      views: 0,
    });

    return NextResponse.json({
      message: 'Project created successfully',
      project,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}