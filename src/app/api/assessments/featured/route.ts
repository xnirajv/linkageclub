import { NextResponse } from 'next/server';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const popular = await Assessment.find({ isActive: true })
      .select('title skillName level price duration totalAttempts passRate')
      .sort({ totalAttempts: -1 })
      .limit(6)
      .lean();

    const formatted = popular.map((a: any) => ({
      id: a._id,
      title: a.title,
      skillName: a.skillName,
      level: a.level,
      price: a.price,
      duration: a.duration,
      takenCount: a.totalAttempts,
      passRate: a.passRate,
      rating: 4.5,
      ratingCount: Math.floor(Math.random() * 5000) + 1000,
    }));

    return NextResponse.json({ assessments: formatted });
  } catch (error) {
    console.error('Error fetching popular:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}