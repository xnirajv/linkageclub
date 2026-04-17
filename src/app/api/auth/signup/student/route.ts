import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { sendVerificationEmail } from '@/lib/email/verification';
import { generateToken } from '@/lib/utils/generateToken';
import { z } from 'zod';

const studentSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  college: z.string().optional(),
  graduationYear: z.string().optional(),
  degree: z.string().optional(),
  yearOfStudy: z.enum(['1st', '2nd', '3rd', '4th', 'graduate']).optional(),
  skills: z.array(z.string()).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  updatesAccepted: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = studentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fullName, email, password, skills, linkedin, github, portfolio, updatesAccepted } = validation.data;

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
      role: 'student',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      skills: Array.isArray(skills)
  ? skills.map(skill => ({
      name: skill,
      level: 'beginner',
      verified: false,
    }))
  : [],
      socialLinks: {
        linkedin,
        github,
        portfolio,
      },
      preferences: {
        newsletter: updatesAccepted || false,
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

    // Send verification email
    await sendVerificationEmail(email, verificationToken, fullName);

    // Create student profile (you might want a separate Student model)
    // For now, we'll store additional info in a metadata field or separate collection

    return NextResponse.json(
      {
        message: 'Account created successfully. Please verify your email.',
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}