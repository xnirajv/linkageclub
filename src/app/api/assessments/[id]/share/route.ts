import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const assessment = await Assessment.findById(id);
    const user = await User.findById(session.user.id);

    if (!assessment || !user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const attempt = assessment.attempts?.find(
      (a: any) => a.userId?.toString() === session.user.id && a.passed === true
    );

    if (!attempt) {
      return NextResponse.json({ error: 'No passed attempt found' }, { status: 404 });
    }

    // Generate shareable link
    const shareId = Buffer.from(
      JSON.stringify({
        assessmentId: assessment._id,
        userId: user._id,
        score: attempt.score,
        date: attempt.completedAt,
      })
    ).toString('base64url');

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/certificate/${shareId}`;

    // LinkedIn share text
    const shareText = `I just earned my ${assessment.title} certification on InternHub with a score of ${attempt.score}%! 🎉 #InternHub #Certification #SkillDevelopment`;

    return NextResponse.json({
      success: true,
      shareUrl,
      linkedInUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      twitterUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    });
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}