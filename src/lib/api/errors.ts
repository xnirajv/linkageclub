import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { MongooseError } from 'mongoose';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  timestamp?: string;
}

export function handleAPIError(error: unknown): NextResponse<ErrorResponse> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details: unknown = undefined;

  if (error instanceof APIError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'API_ERROR';
    details = isDevelopment ? error.details : undefined;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
    details = isDevelopment
      ? error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))
      : undefined;
  } else if (error instanceof MongooseError) {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    if (error.name === 'ValidationError') {
      message = 'Database validation error';
    } else if (error.name === 'CastError') {
      message = 'Invalid ID format';
    } else if (error.name === 'MongoServerError') {
      if ((error as any).code === 11000) {
        message = 'Duplicate entry';
        code = 'DUPLICATE_ERROR';
      }
    } else {
      message = isDevelopment ? error.message : 'Database error';
    }
    details = isDevelopment ? error.message : undefined;
  } else if (error instanceof Error) {
    message = isDevelopment ? error.message : 'Internal server error';
    details = isDevelopment ? error.stack : undefined;
  } else if (typeof error === 'string') {
    message = error;
  }

  if (isDevelopment) {
    console.error('API Error:', { message, code, statusCode, error });
  }

  return NextResponse.json(
    { success: false, error: message, code, details, timestamp: new Date().toISOString() },
    { status: statusCode }
  );
}

export function successResponse<T>(data: T, statusCode: number = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status: statusCode });
}

// ✅ ADD: validationError function
export function validationError(errors: Record<string, string>): APIError {
  return new APIError('Validation failed', 400, 'VALIDATION_ERROR', errors);
}

export const errors = {
  unauthorized: () => new APIError('Unauthorized', 401, 'UNAUTHORIZED'),
  forbidden: () => new APIError('Forbidden', 403, 'FORBIDDEN'),
  notFound: (resource?: string) =>
    new APIError(resource ? `${resource} not found` : 'Resource not found', 404, 'NOT_FOUND'),
  badRequest: (message: string) => new APIError(message, 400, 'BAD_REQUEST'),
  conflict: (message: string) => new APIError(message, 409, 'CONFLICT'),
  tooManyRequests: () => new APIError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED'),
  invalidInput: (field: string) => new APIError(`Invalid ${field}`, 400, 'INVALID_INPUT'),
  serverError: (message?: string) =>
    new APIError(message || 'Internal server error', 500, 'INTERNAL_ERROR'),
};