import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Job from '@/lib/db/models/job';
import Application from '@/lib/db/models/application';
import User from '@/lib/db/models/user';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import { uploadFile } from '@/lib/utils/upload';
import { sendNewApplicationEmail, sendApplicationReceivedEmail } from '@/lib/email/application';
import mongoose from 'mongoose';


const applySchema = z.object({
  resume: z.string().optional(),
  coverLetter: z.string().max(2000).optional(),
  answers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  expectedSalary: z.number().min(0).optional(),
  startDate: z.string().optional(),
  noticePeriod: z.number().min(0).max(90).optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
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

    if (session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can apply to jobs' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File;
    const coverLetter = formData.get('coverLetter') as string;
    const answers = formData.get('answers') ? JSON.parse(formData.get('answers') as string) : undefined;
    const expectedSalary = formData.get('expectedSalary') ? Number(formData.get('expectedSalary')) : undefined;
    const startDate = formData.get('startDate') as string;
    const noticePeriod = formData.get('noticePeriod') ? Number(formData.get('noticePeriod')) : undefined;
    const currentCompany = formData.get('currentCompany') as string;
    const currentRole = formData.get('currentRole') as string;
    const additionalInfo = formData.get('additionalInfo') as string;

    const validation = applySchema.safeParse({
      coverLetter,
      answers,
      expectedSalary,
      startDate,
      noticePeriod,
      currentCompany,
      currentRole,
      additionalInfo,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const job = await Job.findById(params.id)
      .populate('companyId', 'name email') as any;

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'published') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    const existingApplication = await Application.findOne({
      jobId: job._id,
      applicantId: session.user.id,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id).select('skills') as any;

    const userSkills = user?.skills?.map((s: any) => {
      if (typeof s === 'string') return s;
      if (s?.name) return s.name;
      return '';
    }).filter(Boolean) || [];
    
    const requiredSkills = job.skills
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

    let resumeUrl = '';
    if (resumeFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resumeFile.type)) {
        return NextResponse.json(
          { error: 'Please upload a PDF or DOC file' },
          { status: 400 }
        );
      }

      if (resumeFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 5MB' },
          { status: 400 }
        );
      }

      resumeUrl = await uploadFile(resumeFile, `resumes/${session.user.id}`);
    } else {
      const userProfile = await User.findById(session.user.id).select('resume') as any;
      
      if (!userProfile?.resume) {
        return NextResponse.json(
          { error: 'Resume is required' },
          { status: 400 }
        );
      }
      resumeUrl = userProfile.resume;
    }

    // Create application with all fields
    const applicationData = {
      type: 'job' as const,
      jobId: job._id,
      applicantId: new mongoose.Types.ObjectId(session.user.id),
      companyId: job.companyId._id,
      resume: resumeUrl,
      coverLetter,
      answers,
      expectedSalary,
      startDate,
      noticePeriod,
      currentCompany,
      currentRole,
      additionalInfo,
      status: 'pending',
      matchScore,
      matchedSkills,
      missingSkills,
      submittedAt: new Date(),
    };

    const application = await Application.create(applicationData);

    // Add to job's applications array
    job.applications.push({
      userId: new mongoose.Types.ObjectId(session.user.id),
      applicationId: application._id,
      status: 'pending',
      submittedAt: new Date(),
    });
    job.applicationsCount = job.applications.length;
    await job.save();

    // Create notification for company
    await Notification.create({
      userId: job.companyId._id,
      type: 'new_application',
      title: 'New Job Application',
      message: `${session.user.name} has applied to ${job.title}`,
      data: {
        jobId: job._id,
        applicationId: application._id,
        applicantId: session.user.id,
        applicantName: session.user.name,
        matchScore,
      },
      link: `/dashboard/company/jobs/${job._id}/applications`,
      category: 'application',
      priority: 'high',
    });

    // Send email to company (using sendNewApplicationEmail)
    try {
      await sendNewApplicationEmail(
        job.companyId.email,
        session.user.name,
        job.title,
        application._id.toString()
      );
    } catch (emailError) {
      console.error('Failed to send new application email to company:', emailError);
    }

    // Send email to applicant (using sendApplicationReceivedEmail)
    try {
      // Create a user object with string _id (matches the User type from types/user)
      const applicantUser = {
        _id: session.user.id, // Use the string ID directly, not new ObjectId()
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      };

      // Use type assertion to satisfy the compiler
      await sendApplicationReceivedEmail(
        applicantUser as any,
        application as any,
        job.title
      );
    } catch (emailError) {
      console.error('Failed to send application received email to applicant:', emailError);
    }

    // Create notification for applicant
    await Notification.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      type: 'application_submitted',
      title: 'Application Submitted',
      message: `Your application for ${job.title} has been submitted successfully`,
      data: {
        jobId: job._id,
        applicationId: application._id,
      },
      link: `/dashboard/student/jobs/my-applications`,
      category: 'application',
    });

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        status: application.status,
        matchScore: (application as any).matchScore,
      },
    });
  } catch (error) {
    console.error('Error applying to job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      jobId: params.id,
      applicantId: session.user.id,
    }).select('status submittedAt matchScore') as any;

    return NextResponse.json({
      hasApplied: !!application,
      application: application ? {
        id: application._id,
        status: application.status,
        submittedAt: application.submittedAt,
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