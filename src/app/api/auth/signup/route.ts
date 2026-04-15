import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { sendVerificationEmail } from '@/lib/email/verification';
import { generateToken } from '@/lib/utils/generateToken';
import { z } from 'zod';
import { getUniqueUsername } from '@/lib/utils/username';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['student', 'company', 'mentor', 'founder']),
  // Additional fields based on role will be in separate endpoints
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

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
    const username = await getUniqueUsername(name, User);


    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Create user
    const user = await User.create({
      name,
      email,
      username: username,
      password: hashedPassword,
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      emailVerified: false,
      trustScore: 0,
      skills: [],
      badges: [],
      socialLinks: {},
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        newsletter: false,
        theme: 'system',
      },
      verification: {
        email: false,
        phone: false,
        id: false,
        linkedin: false,
        github: false,
      },
      stats: {
        projectsCompleted: 0,
        totalEarnings: 0,
        averageRating: 0,
        reviewsCount: 0,
        sessionsAttended: 0,
        daysActive: 1,
      },
      lastActive: new Date(),
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, name);

    return NextResponse.json(
      {
        message: 'Account created successfully. Please verify your email.',
        userId: user._id,
        role: user.role,
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