import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const profileSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  headline: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().max(120).optional(),
  companySize: z.string().max(60).optional(),
  foundedYear: z.union([z.string(), z.number()]).optional(),
  companyType: z.string().max(120).optional(),
  logo: z.string().url().optional().or(z.literal('')),

  skills: z.array(
    z.object({
      name: z.string(),
      level: z.string(),
      verified: z.boolean().optional(),
    })
  ).optional(),

  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      startYear: z.string(),
      endYear: z.string(),
      grade: z.string().optional(),
    })
  ).optional(),

  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      description: z.string().optional(),
      current: z.boolean().optional(),
    })
  ).optional(),

  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
  }).optional(),

  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    newsletter: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
  }).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select('-password -emailVerificationToken -resetPasswordToken');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user is a mentor, fetch mentor profile
    let mentorProfile = null;
    if (user.role === 'mentor') {
      mentorProfile = await Mentor.findOne({ userId: user._id });
    }

    return NextResponse.json({
      user,
      mentorProfile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    if (validation.data.email) {
      const existing = await User.findOne({
        email: validation.data.email.toLowerCase(),
        _id: { $ne: session.user.id },
      }).select('_id');

      if (existing) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 409 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: validation.data },
      { new: true }
    ).select('-password -emailVerificationToken -resetPasswordToken');

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
