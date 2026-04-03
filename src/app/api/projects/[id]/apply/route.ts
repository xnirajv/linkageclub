import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Project from '@/lib/db/models/project';
import Application from '@/lib/db/models/application';
import User from '@/lib/db/models/user';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import { uploadFile } from '@/lib/utils/upload';
import { sendNewApplicationEmail } from '@/lib/email/application'; // Fix: import correct function
import mongoose from 'mongoose';

const applySchema = z.object({
  proposedAmount: z.number().min(0),
  proposedDuration: z.number().min(1),
  coverLetter: z.string().min(20).max(2000),
  portfolio: z.string().url().optional(),
  attachments: z.array(z.string()).optional(),
  additionalInfo: z.string().optional(),
});

export async function POST(
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

    // Only students can apply
    if (session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can apply to projects' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const proposedAmount = Number(formData.get('proposedAmount'));
    const proposedDuration = Number(formData.get('proposedDuration'));
    const coverLetter = formData.get('coverLetter') as string;
    const portfolio = formData.get('portfolio') as string;
    const additionalInfo = formData.get('additionalInfo') as string;
    const attachments = formData.getAll('attachments') as File[];

    // Validate input
    const validation = applySchema.safeParse({
      proposedAmount,
      proposedDuration,
      coverLetter,
      portfolio,
      additionalInfo,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    // Get project details
    const project = await Project.findById(params.id)
      .populate('companyId', 'name email') as any;

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project is still accepting applications
    if (project.status !== 'open') {
      return NextResponse.json(
        { error: 'This project is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      projectId: project._id,
      applicantId: session.user.id,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this project' },
        { status: 400 }
      );
    }

    // Validate proposed amount against budget
    if (proposedAmount < project.budget.min || proposedAmount > project.budget.max) {
      return NextResponse.json(
        { error: `Proposed amount must be between ${project.budget.min} and ${project.budget.max}` },
        { status: 400 }
      );
    }

    // Validate proposed duration
    if (proposedDuration > project.duration) {
      return NextResponse.json(
        { error: `Proposed duration cannot exceed ${project.duration} days` },
        { status: 400 }
      );
    }

    // Get user profile to check skills match
    const user = await User.findById(session.user.id).select('skills') as any;

    // Calculate match score
    const userSkills = user?.skills?.map((s: any) => {
      if (typeof s === 'string') return s;
      if (s?.name) return s.name;
      return '';
    }).filter(Boolean) || [];
    
    const requiredSkills = project.skills
      .filter((s: any) => s.mandatory)
      .map((s: any) => s.name);

    const matchedSkills = requiredSkills.filter((skill: string) => 
      userSkills.includes(skill)
    );
    const missingSkills = requiredSkills.filter((skill: string) => 
      !userSkills.includes(skill)
    );

    const matchScore = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    // Handle attachments upload
    const attachmentUrls: string[] = [];
    if (attachments && attachments.length > 0) {
      // Validate total size (max 10MB)
      const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Total attachment size must be less than 10MB' },
          { status: 400 }
        );
      }

      for (const file of attachments) {
        const url = await uploadFile(file, `projects/${project._id}/applications/${session.user.id}`);
        attachmentUrls.push(url);
      }
    }

    // Create application
    const application = await Application.create({
      type: 'project',
      projectId: project._id,
      applicantId: new mongoose.Types.ObjectId(session.user.id),
      companyId: project.companyId._id,
      proposedAmount,
      proposedDuration,
      coverLetter,
      portfolio,
      attachments: attachmentUrls,
      additionalInfo,
      status: 'pending',
      matchScore,
      matchedSkills,
      missingSkills,
      submittedAt: new Date(),
    });

    // Add to project's applications array
    project.applications.push({
      userId: new mongoose.Types.ObjectId(session.user.id),
      applicationId: application._id,
      proposedAmount,
      proposedDuration,
      coverLetter,
      attachments: attachmentUrls,
      status: 'pending',
      submittedAt: new Date(),
    });
    project.applicationsCount = project.applications.length;
    await project.save();

    // Create notification for company
    await Notification.create({
      userId: project.companyId._id,
      type: 'new_application',
      title: 'New Project Application',
      message: `${session.user.name} has applied to ${project.title}`,
      data: {
        projectId: project._id,
        applicationId: application._id,
        applicantId: session.user.id,
        applicantName: session.user.name,
        proposedAmount,
        proposedDuration,
        matchScore,
      },
      link: `/dashboard/company/projects/${project._id}/applications`,
      category: 'application',
      priority: 'high',
    });

    // Send email to company - Fix: use sendNewApplicationEmail
    try {
      await sendNewApplicationEmail(
        project.companyId.email,
        session.user.name,
        project.title,
        application._id.toString()
      );
    } catch (emailError) {
      console.error('Failed to send email to company:', emailError);
    }

    // Create notification for applicant
    await Notification.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      type: 'application_submitted',
      title: 'Application Submitted',
      message: `Your application for ${project.title} has been submitted successfully`,
      data: {
        projectId: project._id,
        applicationId: application._id,
        proposedAmount,
        proposedDuration,
      },
      link: `/dashboard/student/projects/my-applications`,
      category: 'application',
    });

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        status: application.status,
        matchScore: (application as any).matchScore, // Use type assertion
        proposedAmount: application.proposedAmount,
        proposedDuration: application.proposedDuration,
      },
    });
  } catch (error) {
    console.error('Error applying to project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get application status for this project
export async function GET(
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

    const application = await Application.findOne({
      projectId: params.id,
      applicantId: session.user.id,
    }).select('status submittedAt proposedAmount proposedDuration matchScore') as any;

    return NextResponse.json({
      hasApplied: !!application,
      application: application ? {
        id: application._id,
        status: application.status,
        submittedAt: application.submittedAt,
        proposedAmount: application.proposedAmount,
        proposedDuration: application.proposedDuration,
        matchScore: application.matchScore,
      } : null,
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}