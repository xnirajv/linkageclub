import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { sendVerificationEmail } from '@/lib/email/verification';
import { generateToken } from '@/lib/utils/generateToken';
import { z } from 'zod';

const founderSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  startupName: z.string().min(2),
  startupStage: z.string(),
  industry: z.string(),
  lookingFor: z.array(z.string()),
  cofounderRole: z.string().optional(),
  startupDescription: z.string().min(100).max(500),  // ✅ FIX: max 500 chars (user model limit)
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = founderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { 
      fullName, email, password, startupDescription, website, linkedin 
    } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Create user
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: 'founder',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      bio: startupDescription.slice(0, 500),  // ✅ FIX: Ensure max 500 chars
      socialLinks: {
        linkedin,
        portfolio: website,
      },
      preferences: {
        newsletter: true,
      },
      stats: {
        projectsCompleted: 0,
        totalEarnings: 0,
        averageRating: 0,
        reviewsCount: 0,
        sessionsAttended: 0,
        daysActive: 1,
      },
    });

    // TODO: Store startupName, startupStage, industry, lookingFor, cofounderRole in a separate FounderProfile collection

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, fullName);
    } catch (error) {
      console.error('Founder email send failed:', error);
    }

    return NextResponse.json(
      {
        message: 'Founder account created successfully. Please verify your email.',
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Founder signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}