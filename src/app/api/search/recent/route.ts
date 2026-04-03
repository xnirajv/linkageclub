import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

// This would typically be stored in Redis or a separate collection
// For now, we'll use a simple in-memory store (not production ready)
const recentSearches = new Map();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userSearches = recentSearches.get(session.user.id) || [];
    
    return NextResponse.json({ searches: userSearches });
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { query, type } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const userSearches = recentSearches.get(session.user.id) || [];
    
    // Add new search to beginning, remove if exists
    const filtered = userSearches.filter((s: any) => s.query !== query);
    filtered.unshift({ query, type, timestamp: new Date() });
    
    // Keep only last 10 searches
    recentSearches.set(session.user.id, filtered.slice(0, 10));

    return NextResponse.json({ message: 'Search recorded' });
  } catch (error) {
    console.error('Error recording search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    recentSearches.delete(session.user.id);

    return NextResponse.json({ message: 'Recent searches cleared' });
  } catch (error) {
    console.error('Error clearing recent searches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}