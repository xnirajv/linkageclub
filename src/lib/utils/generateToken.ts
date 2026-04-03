import crypto from 'crypto';

/**
 * Token generation utilities for authentication, verification, and secure links
 */

/**
 * Generate a random token for email verification, password reset, etc.
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hexadecimal token string
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a numeric token (OTP) for phone verification, 2FA, etc.
 * @param length - Number of digits (default: 6)
 * @returns Numeric token string
 */
export function generateNumericToken(length: number = 6): string {
  const digits = '0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    // Use cryptographically secure random number generation
    token += digits[crypto.randomInt(0, digits.length)];
  }
  
  return token;
}

/**
 * Generate an OTP (One-Time Password)
 * @param length - Number of digits (default: 6)
 * @returns OTP string
 */
export function generateOTP(length: number = 6): string {
  return generateNumericToken(length);
}

/**
 * Generate a time-based OTP (TOTP) for 2FA
 * @param secret - Secret key
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns TOTP string
 */
export function generateTOTP(secret: string, timestamp: number = Date.now()): string {
  const timeStep = 30 * 1000; // 30 seconds
  const counter = Math.floor(timestamp / timeStep);
  const hmac = crypto.createHmac('sha1', secret);
  const hash = hmac.update(Buffer.from(counter.toString(16).padStart(16, '0'), 'hex')).digest();
  
  const offset = hash[hash.length - 1] & 0xf;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);
  
  return (code % 1000000).toString().padStart(6, '0');
}

/**
 * Generate a JWT-like token for API authentication
 * @param payload - Data to encode
 * @param secret - Secret key
 * @param expiresIn - Expiry in seconds (default: 7 days)
 * @returns Signed token
 */
export function generateJWToken(
  payload: Record<string, any>,
  secret: string,
  expiresIn: number = 604800 // 7 days
): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };
  
  const payloadStr = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payloadStr}`)
    .digest('base64url');
  
  return `${header}.${payloadStr}.${signature}`;
}

/**
 * Generate a session token for user sessions
 * @param userId - User ID
 * @param metadata - Additional session metadata
 * @returns Session token
 */
export function generateSessionToken(
  userId: string,
  metadata: Record<string, any> = {}
): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const data = `${userId}:${timestamp}:${random}:${JSON.stringify(metadata)}`;
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate an API key for external access
 * @param prefix - Optional prefix (e.g., 'pk_live', 'sk_test')
 * @returns API key
 */
export function generateApiKey(prefix?: string): string {
  const key = crypto.randomBytes(32).toString('base64url');
  return prefix ? `${prefix}_${key}` : key;
}

/**
 * Generate a reference ID for transactions, orders, etc.
 * @param prefix - Optional prefix
 * @returns Reference ID
 */
export function generateReferenceId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  const reference = `${timestamp}-${random}`.toUpperCase();
  
  return prefix ? `${prefix}_${reference}` : reference;
}

/**
 * Generate a transaction ID for payments
 * @returns Transaction ID
 */
export function generateTransactionId(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  
  return `TXN${year}${month}${day}${random}`;
}

/**
 * Generate an invoice number
 * @param prefix - Optional prefix (default: 'INV')
 * @returns Invoice number
 */
export function generateInvoiceNumber(prefix: string = 'INV'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = crypto.randomInt(0, 10000).toString().padStart(4, '0');
  
  return `${prefix}-${year}${month}-${random}`;
}

/**
 * Generate an order ID
 * @returns Order ID
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Generate a coupon code
 * @param length - Length of code (default: 8)
 * @param prefix - Optional prefix
 * @returns Coupon code
 */
export function generateCouponCode(length: number = 8, prefix?: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters
  let code = '';
  
  for (let i = 0; i < length; i++) {
    // Use cryptographically secure random number generation
    code += chars[crypto.randomInt(0, chars.length)];
  }
  
  // Add hyphens for readability
  if (length > 4) {
    code = code.match(/.{1,4}/g)?.join('-') || code;
  }
  
  return prefix ? `${prefix}-${code}` : code;
}

/**
 * Generate a tracking number for shipments
 * @returns Tracking number
 */
export function generateTrackingNumber(): string {
  const prefix = 'SHIP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

/**
 * Generate a verification code for email/phone
 * @param type - Type of verification ('email' | 'phone')
 * @returns Verification code
 */
export function generateVerificationCode(type: 'email' | 'phone'): string {
  if (type === 'phone') {
    return generateNumericToken(6);
  }
  return generateToken(16);
}

/**
 * Generate a password reset token
 * @param userId - User ID
 * @returns Reset token
 */
export function generatePasswordResetToken(userId: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const data = `${userId}:${timestamp}:${random}`;
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate an email verification token
 * @param email - User email
 * @returns Verification token
 */
export function generateEmailVerificationToken(email: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const data = `${email}:${timestamp}:${random}`;
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a magic link token for passwordless login
 * @param email - User email
 * @returns Magic link token
 */
export function generateMagicLinkToken(email: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(32).toString('hex');
  const data = `${email}:${timestamp}:${random}`;
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a shareable link ID
 * @param resourceId - Resource ID
 * @param type - Resource type
 * @returns Share ID
 */
export function generateShareId(resourceId: string, type: string): string {
  const prefix = type.slice(0, 2).toUpperCase();
  const random = crypto.randomBytes(6).toString('base64url');
  return `${prefix}_${resourceId.slice(-6)}_${random}`;
}

/**
 * Generate a webhook secret for secure callbacks
 * @returns Webhook secret
 */
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('base64url')}`;
}

/**
 * Generate an invite code for referrals
 * @param userId - User ID
 * @returns Invite code
 */
export function generateInviteCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  const data = `${userId.slice(-4)}${timestamp}${random}`.toUpperCase();
  
  return data.match(/.{1,4}/g)?.join('-') || data;
}

/**
 * Verify a token's validity and expiry
 * @param token - Token to verify
 * @param secret - Secret key (for JWT)
 * @param maxAge - Maximum age in milliseconds
 * @param createdAt - Token creation timestamp
 * @returns Boolean indicating if token is valid
 */
export function verifyToken(
  token: string,
  secret?: string,
  maxAge?: number,
  createdAt?: number
): boolean {
  if (maxAge && createdAt) {
    const age = Date.now() - createdAt;
    if (age > maxAge) return false;
  }
  
  // JWT verification
  if (secret && token.includes('.')) {
    try {
      const [header, payload, signature] = token.split('.');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64url');
      
      if (signature !== expectedSignature) return false;
      
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return false;
      
      return true;
    } catch {
      return false;
    }
  }
  
  return true;
}

/**
 * Extract expiration from token
 * @param token - JWT token
 * @returns Expiration timestamp or null
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Token generator factory
 */
export const TokenGenerator = {
  random: generateToken,
  numeric: generateNumericToken,
  otp: generateOTP,
  totp: generateTOTP,
  jwt: generateJWToken,
  session: generateSessionToken,
  apiKey: generateApiKey,
  reference: generateReferenceId,
  transaction: generateTransactionId,
  invoice: generateInvoiceNumber,
  order: generateOrderId,
  coupon: generateCouponCode,
  tracking: generateTrackingNumber,
  verification: generateVerificationCode,
  passwordReset: generatePasswordResetToken,
  emailVerification: generateEmailVerificationToken,
  magicLink: generateMagicLinkToken,
  shareId: generateShareId,
  webhook: generateWebhookSecret,
  invite: generateInviteCode,
  verify: verifyToken,
  getExpiry: getTokenExpiry,
};