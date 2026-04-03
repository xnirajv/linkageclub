import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/utils/sendEmail';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(5),
  message: z.string().min(20),
  type: z.enum(['general', 'sales', 'support', 'partnership']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = contactSchema.parse(body);

    const contactRecipient =
      process.env.CONTACT_EMAIL ||
      process.env.SUPPORT_EMAIL ||
      process.env.SMTP_FROM ||
      'support@internhub.com';

    const submission = await sendEmail({
      to: contactRecipient,
      replyTo: payload.email,
      subject: `[Contact:${payload.type}] ${payload.subject}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Phone: ${payload.phone || 'Not provided'}`,
        `Type: ${payload.type}`,
        '',
        payload.message,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #4B4945;">
          <h1 style="color: #344A86;">New contact form submission</h1>
          <p><strong>Name:</strong> ${payload.name}</p>
          <p><strong>Email:</strong> ${payload.email}</p>
          <p><strong>Phone:</strong> ${payload.phone || 'Not provided'}</p>
          <p><strong>Inquiry type:</strong> ${payload.type}</p>
          <p><strong>Subject:</strong> ${payload.subject}</p>
          <div style="margin-top: 24px; padding: 20px; border-radius: 16px; background: #E1DDD6;">
            <p style="margin: 0; white-space: pre-wrap;">${payload.message}</p>
          </div>
        </div>
      `,
    });

    if (!submission.success) {
      return NextResponse.json(
        { error: submission.error || 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid contact form data',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    console.error('Contact form submission failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
