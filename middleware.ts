import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getAllowedOrigins() {
  const configuredOrigins = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return new Set(appUrl ? [appUrl, ...configuredOrigins] : configuredOrigins);
}

function getClientIdentifier(req: NextRequest): string {
  return req.ip || req.headers.get('x-forwarded-for') || 'unknown';
}

function rateLimit(req: NextRequest): boolean {
  const now = Date.now();
  const identifier = getClientIdentifier(req);
  const current = requestCounts.get(identifier);

  if (!current || current.resetTime <= now) {
    requestCounts.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  current.count += 1;
  return current.count <= RATE_LIMIT;
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
}

function applyCorsHeaders(req: NextRequest, response: NextResponse) {
  const origin = req.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, X-CSRF-Token'
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
}

function isPublicApi(pathname: string): boolean {
  const publicApiPrefixes = ['/api/auth', '/api/projects', '/api/jobs', '/api/mentors', '/api/search', '/api/health'];
  return publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/') && req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    applySecurityHeaders(response);
    applyCorsHeaders(req, response);
    return response;
  }

  if (pathname.startsWith('/api/') && !rateLimit(req)) {
    const response = new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Reset': (Math.ceil(Date.now() / 1000) + 60).toString(),
        },
      }
    );

    applySecurityHeaders(response);
    applyCorsHeaders(req, response);
    return response;
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (pathname.startsWith('/dashboard') && !token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(url);
    applySecurityHeaders(response);
    applyCorsHeaders(req, response);
    return response;
  }

  if (pathname.startsWith('/dashboard') && token) {
    const role = token.role as string | undefined;
    const segments = pathname.split('/');
    const dashboardRole = segments[2];

    if (role && dashboardRole && dashboardRole !== role && role !== 'admin') {
      const response = NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
      applySecurityHeaders(response);
      applyCorsHeaders(req, response);
      return response;
    }
  }

  if (pathname.startsWith('/api/admin')) {
    if (!token) {
      const response = NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      applySecurityHeaders(response);
      applyCorsHeaders(req, response);
      return response;
    }

    if (token.role !== 'admin') {
      const response = NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      applySecurityHeaders(response);
      applyCorsHeaders(req, response);
      return response;
    }
  }

  if (pathname.startsWith('/api/') && !isPublicApi(pathname) && !token) {
    const response = NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    applySecurityHeaders(response);
    applyCorsHeaders(req, response);
    return response;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  applyCorsHeaders(req, response);
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
