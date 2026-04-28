import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import Project from '@/lib/db/models/project';
import Application from '@/lib/db/models/application';
import User from '@/lib/db/models/user';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'company') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const companyId = session.user.id;

    const [projects, applications, user] = await Promise.all([
      Project.find({ companyId }).select('title status budget duration milestones selectedApplicant createdAt applicationsCount').lean(),
      Application.find({ companyId, type: 'project' }).populate('applicantId', 'name trustScore').populate('projectId', 'title').sort({ submittedAt: -1 }).limit(5).lean(),
      User.findById(companyId).select('name email').lean(),
    ]);

    const activeProjects = projects.filter((p: any) => p.status === 'open' || p.status === 'in_progress');
    const pendingApplications = applications.filter((a: any) => a.status === 'pending');
    const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget?.max || p.budget?.min || 0), 0);

    const pipeline = {
      new: applications.filter((a: any) => a.status === 'pending').length,
      reviewing: applications.filter((a: any) => a.status === 'reviewed').length,
      interview: applications.filter((a: any) => ['interview_scheduled', 'interview_completed'].includes(a.status)).length,
      offer: applications.filter((a: any) => a.status === 'shortlisted').length,
      hired: applications.filter((a: any) => a.status === 'accepted').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: { name: user?.name, email: user?.email },
        stats: {
          activeProjects: activeProjects.length,
          openPositions: projects.filter((p: any) => p.status === 'open').length,
          totalApplicants: applications.length,
          totalBudget,
          pendingReview: pendingApplications.length,
        },
        activeProjects: activeProjects.slice(0, 3).map((p: any) => ({
          _id: p._id,
          title: p.title,
          status: p.status,
          budget: p.budget,
          duration: p.duration,
          applicationsCount: p.applicationsCount,
          selectedApplicant: p.selectedApplicant,
          milestones: p.milestones,
          createdAt: p.createdAt,
        })),
        recentApplications: applications.map((a: any) => ({
          _id: a._id,
          status: a.status,
          submittedAt: a.submittedAt,
          applicantId: a.applicantId,
          projectId: a.projectId,
          proposedAmount: a.proposedAmount,
          proposedDuration: a.proposedDuration,
        })),
        pipeline,
        recommendations: [],
      },
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}