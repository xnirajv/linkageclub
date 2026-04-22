import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Assessment from '@/lib/db/models/assessment';
import User from '@/lib/db/models/user';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = JSON.parse(Buffer.from(id, 'base64url').toString());

    await connectDB();

    const assessment = await Assessment.findById(decoded.assessmentId);
    const user = await User.findById(decoded.userId);

    if (!assessment || !user) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Generate HTML view for sharing
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate - ${assessment.title}</title>
        <meta property="og:title" content="${assessment.title} Certificate" />
        <meta property="og:description" content="${user.name} scored ${decoded.score}% on ${assessment.title}" />
        <meta property="og:image" content="${process.env.NEXT_PUBLIC_APP_URL}/og-certificate.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <style>
          body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #f5f0eb 0%, #e8e0d8 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .certificate {
            max-width: 900px;
            width: 100%;
            background: white;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            border: 10px solid #344A86;
            border-radius: 20px;
            text-align: center;
          }
          h1 { color: #344A86; font-size: 48px; margin-bottom: 10px; }
          h2 { color: #407794; font-size: 24px; margin-bottom: 30px; }
          .name { font-size: 36px; color: #2c3e50; margin: 30px 0; font-weight: bold; }
          .score { font-size: 24px; color: #27ae60; margin: 20px 0; }
          .date { color: #7f8c8d; margin-top: 40px; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #95a5a6; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>CERTIFICATE</h1>
          <h2>OF COMPLETION</h2>
          <p>This is to certify that</p>
          <div class="name">${user.name}</div>
          <p>has successfully completed</p>
          <div class="score">${assessment.title}</div>
          <p>with a score of <strong>${decoded.score}%</strong></p>
          <div class="date">Date: ${new Date(decoded.date).toLocaleDateString()}</div>
          <div class="footer">InternHub - Verified Assessment</div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Share view error:', error);
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }
}