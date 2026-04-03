import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const bulkActionSchema = z.object({
  applicationIds: z.array(z.string()),
  action: z.enum(['shortlist', 'reject', 'delete']),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'company') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = bulkActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const { applicationIds, action } = validation.data;

    // Verify all applications belong to this company
    const applications = await Application.find({
      _id: { $in: applicationIds },
      companyId: session.user.id,
    });

    if (applications.length !== applicationIds.length) {
      return NextResponse.json(
        { error: 'Some applications do not belong to your company' },
        { status: 403 }
      );
    }

    let updateData: any = {};
    
    switch (action) {
      case 'shortlist':
        updateData = { status: 'shortlisted' };
        break;
      case 'reject':
        updateData = { status: 'rejected' };
        break;
      case 'delete':
        // For delete, we'll soft delete or actually delete based on your policy
        await Application.deleteMany({ _id: { $in: applicationIds } });
        return NextResponse.json({
          message: `Successfully deleted ${applicationIds.length} applications`,
        });
    }

    await Application.updateMany(
      { _id: { $in: applicationIds } },
      { 
        $set: {
          ...updateData,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: `Successfully updated ${applicationIds.length} applications`,
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}