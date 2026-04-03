import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Project from '@/lib/db/models/project';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

// Extended type for project with optional matchScore
type ProjectWithMatchScore = Omit<any, 'matchScore'> & {
  matchScore?: number;
};

const updateProjectSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(50).max(5000).optional(),
  category: z.string().optional(),
  skills: z.array(z.object({
    name: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    mandatory: z.boolean(),
  })).optional(),
  budget: z.object({
    type: z.enum(['fixed', 'hourly', 'milestone']),
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  duration: z.number().min(1).max(365).optional(),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    amount: z.number(),
    deadline: z.number(),
  })).optional(),
  requirements: z.array(z.string()).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Increment view count
    await Project.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    const project = await Project.findById(params.id)
      .populate('companyId', 'name avatar companyName bio location') as any;

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Calculate match score for authenticated user
    const session = await getServerSession(authOptions);
    
    // Convert to plain object
    const projectObj = project.toObject() as ProjectWithMatchScore;

    if (session) {
      const user = await User.findById(session.user.id).select('skills') as any;
      
      if (user && user.skills && user.skills.length > 0 && project.skills && project.skills.length > 0) {
        // Extract skill names from user
        const userSkills = user.skills.map((s: any) => {
          if (typeof s === 'string') return s;
          if (s && typeof s === 'object' && 'name' in s) return s.name;
          return '';
        }).filter(Boolean);
        
        // Extract skill names from project
        const projectSkills = project.skills.map((s: any) => {
          if (typeof s === 'string') return s;
          if (s && typeof s === 'object' && 'name' in s) return s.name;
          return '';
        }).filter(Boolean);
        
        // Calculate matching skills
        const matchingSkills = projectSkills.filter((s: string) => 
          userSkills.includes(s)
        );
        
        // Calculate match score
        const matchScore = projectSkills.length > 0
          ? Math.round((matchingSkills.length / projectSkills.length) * 100)
          : 0;
        
        // Add matchScore to the project object
        projectObj.matchScore = matchScore;
      }
    }

    return NextResponse.json({ project: projectObj });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = updateProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id) as any;

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user owns the project
    if (project.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update only the fields that are provided
    Object.keys(validation.data).forEach(key => {
      if (validation.data[key as keyof typeof validation.data] !== undefined) {
        project[key] = validation.data[key as keyof typeof validation.data];
      }
    });
    
    await project.save();

    return NextResponse.json({
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id) as any;

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user owns the project
    if (project.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await project.deleteOne();

    return NextResponse.json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}