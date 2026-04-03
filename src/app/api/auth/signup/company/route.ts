import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { sendVerificationEmail } from '@/lib/email/verification';
import { z } from 'zod';
import { generateToken } from '@/lib/utils/generateToken';

const companySchema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  website: z.string().url(),
  industry: z.string(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  location: z.string().min(2),
  description: z.string().min(100),
  foundedYear: z.string(),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const data: any = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    const validation = companySchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { companyName, email, password, website, location, description, linkedin, twitter } = validation.data;

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
      name: companyName,
      email,
      password: hashedPassword,
      role: 'company',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      bio: description,
      location,
      socialLinks: {
        linkedin,
        twitter,
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

    // Handle logo upload
    const logoFile = formData.get('logo') as File;
    if (logoFile) {
      // Upload logo to cloud storage
      // const logoUrl = await uploadFile(logoFile, 'company-logos');
      // await User.updateOne({ _id: user._id }, { avatar: logoUrl });
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken, companyName);

    // Create company profile (you might want a separate Company model)
    // Store additional company info in a separate collection

    return NextResponse.json(
      {
        message: 'Company account created successfully. Please verify your email.',
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Company signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}