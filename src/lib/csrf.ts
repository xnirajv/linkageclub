/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Protects state-changing operations from CSRF attacks
 */

import { randomBytes, createHmac } from 'crypto';
import { env } from './env';

const CSRF_SECRET = env.NEXTAUTH_SECRET;
const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

interface CSRFToken {
  token: string;
  timestamp: number;
}

/**
 * Generate a CSRF token
 * @param sessionId - Session identifier (user ID or session token)
 * @returns CSRF token string
 */
export function generateCSRFToken(sessionId: string): string {
  const timestamp = Date.now();
  const randomValue = randomBytes(TOKEN_LENGTH).toString('hex');
  
  // Create HMAC signature
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(`${sessionId}:${timestamp}:${randomValue}`);
  const signature = hmac.digest('hex');

  // Combine timestamp, random value, and signature
  const token = `${timestamp}.${randomValue}.${signature}`;
  
  return Buffer.from(token).toString('base64url');
}

/**
 * Verify a CSRF token
 * @param token - CSRF token to verify
 * @param sessionId - Session identifier (user ID or session token)
 * @returns true if token is valid, false otherwise
 */
export function verifyCSRFToken(token: string | null, sessionId: string): boolean {
  if (!token) {
    return false;
  }

  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split('.');
    
    if (parts.length !== 3) {
      return false;
    }

    const [timestampStr, randomValue, providedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Check if token is expired
    if (Date.now() - timestamp > TOKEN_EXPIRY) {
      return false;
    }

    // Verify signature
    const hmac = createHmac('sha256', CSRF_SECRET);
    hmac.update(`${sessionId}:${timestamp}:${randomValue}`);
    const expectedSignature = hmac.digest('hex');

    // Constant-time comparison to prevent timing attacks
    return constantTimeCompare(providedSignature, expectedSignature);
  } catch (error) {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Double Submit Cookie Pattern
 * Alternative CSRF protection for stateless applications
 */
export function generateDoubleSubmitToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Verify double submit token
 * Token in cookie should match token in request header/body
 */
export function verifyDoubleSubmitToken(
  cookieToken: string | null,
  requestToken: string | null
): boolean {
  if (!cookieToken || !requestToken) {
    return false;
  }

  return constantTimeCompare(cookieToken, requestToken);
}

/**
 * Middleware helper to extract CSRF token from request
 */
export function extractCSRFToken(headers: Headers): string | null {
  return (
    headers.get('x-csrf-token') ||
    headers.get('X-CSRF-Token') ||
    headers.get('csrf-token') ||
    null
  );
}

/**
 * Generate CSRF token for forms
 * Can be used in server components
 */
export async function getCSRFToken(sessionId: string): Promise<string> {
  return generateCSRFToken(sessionId);
}

/**
 * Validate CSRF token for API routes
 * Returns true if valid, throws error if invalid
 */
export function validateCSRFToken(
  token: string | null,
  sessionId: string
): boolean {
  if (!verifyCSRFToken(token, sessionId)) {
    throw new Error('Invalid CSRF token');
  }
  return true;
}
