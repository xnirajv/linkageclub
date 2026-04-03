import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth/options';
import { APIError, handleAPIError, validationError } from './errors';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

function attachSessionUser(req: NextRequest, session: Awaited<ReturnType<typeof getServerSession>>) {
  const authenticatedReq = req as AuthenticatedRequest;
  authenticatedReq.user = (session as { user?: AuthenticatedRequest['user'] } | null)?.user;
  return authenticatedReq;
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        throw new APIError('You must be logged in to access this resource', 401, 'UNAUTHORIZED');
      }

      return await handler(attachSessionUser(req, session));
    } catch (error) {
      return handleAPIError(error);
    }
  };
}

export function withRole(roles: string | string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest): Promise<NextResponse> => {
      try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
          throw new APIError('You must be logged in to access this resource', 401, 'UNAUTHORIZED');
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(session.user.role)) {
          throw new APIError('You do not have permission to access this resource', 403, 'FORBIDDEN');
        }

        return await handler(attachSessionUser(req, session));
      } catch (error) {
        return handleAPIError(error);
      }
    };
  };
}

export function withValidation<T extends z.ZodTypeAny>(schema: T) {
  return (
    handler: (req: AuthenticatedRequest, data: z.infer<T>) => Promise<NextResponse>
  ) => {
    return async (req: AuthenticatedRequest): Promise<NextResponse> => {
      try {
        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
          const details = parsed.error.errors.reduce((acc, err) => {
            const path = err.path.join('.') || 'root';
            acc[path] = err.message;
            return acc;
          }, {} as Record<string, string>);

          throw validationError(details);
        }

        return await handler(req, parsed.data);
      } catch (error) {
        if (error instanceof SyntaxError) {
          return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        return handleAPIError(error);
      }
    };
  };
}

export async function errorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}

export function getPaginationParams(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(Number.parseInt(searchParams.get('limit') || '20', 10), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function getSearchParams(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      const currentValue = params[arrayKey];
      params[arrayKey] = Array.isArray(currentValue)
        ? [...currentValue, value]
        : [value];
      return;
    }

    params[key] = value;
  });

  return params;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function withRateLimit(
  maxRequests = 100,
  windowMs = 15 * 60 * 1000
) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: AuthenticatedRequest): Promise<NextResponse> => {
      const identifier = req.user?.id || req.ip || 'anonymous';
      const now = Date.now();
      const record = rateLimitMap.get(identifier);

      if (record && now < record.resetAt) {
        if (record.count >= maxRequests) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil((record.resetAt - now) / 1000)),
              },
            }
          );
        }

        record.count += 1;
      } else {
        rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
      }

      return await handler(req);
    };
  };
}
