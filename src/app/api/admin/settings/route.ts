import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

// This would typically be stored in a Settings collection
let platformSettings = {
  platform: {
    name: 'InternHub',
    description: 'India\'s first AI-powered tech talent ecosystem',
    maintenance: false,
    maintenanceMessage: '',
  },
  features: {
    assessments: true,
    projects: true,
    jobs: true,
    mentors: true,
    community: true,
    aiMatching: true,
  },
  pricing: {
    platformFee: 10, // percentage
    assessmentCommission: 20, // percentage
    mentorCommission: 15, // percentage
  },
  email: {
    welcomeEmail: true,
    applicationEmails: true,
    paymentEmails: true,
    newsletterEnabled: true,
  },
  security: {
    requireEmailVerification: true,
    requirePhoneVerification: false,
    maxLoginAttempts: 5,
    sessionTimeout: 30, // minutes
  },
  limits: {
    maxProjectsPerCompany: 10,
    maxJobsPerCompany: 10,
    maxAssessmentsPerStudent: 50,
    maxFileSize: 10, // MB
  },
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(platformSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Deep merge the settings
    platformSettings = {
      ...platformSettings,
      ...body,
      platform: { ...platformSettings.platform, ...body.platform },
      features: { ...platformSettings.features, ...body.features },
      pricing: { ...platformSettings.pricing, ...body.pricing },
      email: { ...platformSettings.email, ...body.email },
      security: { ...platformSettings.security, ...body.security },
      limits: { ...platformSettings.limits, ...body.limits },
    };

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: platformSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}