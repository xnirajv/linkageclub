import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Please use role-specific endpoints: /student, /company, /mentor, /founder' },
    { status: 404 }
  );
}