import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Job from '@/lib/db/models/job';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50).max(5000),
  responsibilities: z.array(z.string()).min(1),
  requirements: z.array(z.string()).min(1),
  preferredQualifications: z.array(z.string()).optional(),
  location: z.string(),
  type: z.enum(['full-time', 'part-time', 'internship', 'contract', 'remote']),
  experience: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    level: z.enum(['fresher', 'junior', 'mid', 'senior', 'lead']),
  }),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('INR'),
    period: z.enum(['month', 'year', 'hour']).default('year'),
  }),
  skills: z.array(z.object({
    name: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    mandatory: z.boolean().default(true),
  })),
  benefits: z.array(z.string()).optional(),
  department: z.string().optional(),
  openings: z.number().min(1).default(1),
  questions: z.array(z.object({
    question: z.string(),
    type: z.enum(['text', 'multiple-choice', 'yes-no']),
    options: z.array(z.string()).optional(),
    required: z.boolean().default(true),
  })).optional(),
  deadline: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.getAll('type');
    const location = searchParams.get('location');
    const minSalary = parseInt(searchParams.get('minSalary') || '0');
    const maxSalary = parseInt(searchParams.get('maxSalary') || '10000000');
    const experience = searchParams.get('experience');
    const skills = searchParams.getAll('skills');
    const search = searchParams.get('search');

    const query: any = { status: 'published' };

    if (type.length > 0) {
      query.type = { $in: type };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minSalary || maxSalary) {
      query['salary.min'] = { $gte: minSalary };
      query['salary.max'] = { $lte: maxSalary };
    }

    if (experience) {
      query['experience.level'] = experience;
    }

    if (skills.length > 0) {
      query['skills.name'] = { $in: skills };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('companyId', 'name avatar companyName isVerified')
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
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
        { error: 'Only companies can post jobs' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = jobSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const job = await Job.create({
      ...validation.data,
      companyId: session.user.id,
      postedBy: session.user.id,
      postedAt: new Date(),
      status: 'published',
      applications: [],
      views: 0,
      isVerified: false, // Will be verified by admin
    });

    return NextResponse.json({
      message: 'Job posted successfully',
      job,
    }, { status: 201 });
  } catch (error) {
    console.error('Error posting job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}