/**
 * Security Sanitization Utilities
 * Prevents XSS, NoSQL injection, and other security vulnerabilities
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this before rendering any user-generated HTML content
 */
export function sanitizeHTML(
  html: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: string[];
  }
): string {
  const defaultConfig = {
    ALLOWED_TAGS: [
      'p',
      'br',
      'b',
      'i',
      'em',
      'strong',
      'a',
      'ul',
      'ol',
      'li',
      'code',
      'pre',
      'blockquote',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };

  const config = options
    ? {
        ALLOWED_TAGS: options.allowedTags || defaultConfig.ALLOWED_TAGS,
        ALLOWED_ATTR: options.allowedAttributes || defaultConfig.ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
      }
    : defaultConfig;

  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitize input to prevent NoSQL injection
 * Removes MongoDB operators like $, $ne, $gt, etc.
 */
export function sanitizeMongoInput(input: unknown): unknown {
  if (typeof input === 'string') {
    // Remove MongoDB operators
    return input.replace(/\$|\.|\{|\}/g, '');
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeMongoInput);
  }

  if (input && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(input)) {
      // Skip keys that start with $ or contain .
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitized[key] = sanitizeMongoInput(value);
      }
    }
    
    return sanitized;
  }

  return input;
}

/**
 * Sanitize search query for safe regex usage
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  // Escape special regex characters
  return query
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\$/g, '') // Remove $ operator
    .trim()
    .substring(0, 200); // Limit length
}

/**
 * Sanitize filename for safe file operations
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars
    .replace(/\.{2,}/g, '.') // Prevent directory traversal
    .substring(0, 255); // Limit length
}

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 */
export function sanitizeURL(url: string, allowedDomains: string[] = []): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // If allowedDomains specified, check domain
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(
        (domain) =>
          parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        return null;
      }
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Remove null bytes from string (prevents injection attacks)
 */
export function removeNullBytes(str: string): string {
  return str.replace(/\0/g, '');
}

/**
 * Validate and sanitize pagination parameters
 */
export function sanitizePagination(params: {
  page?: string | number;
  limit?: string | number;
  maxLimit?: number;
}): { page: number; limit: number } {
  const maxLimit = params.maxLimit || 100;
  
  let page: number = typeof params.page === 'string' ? parseInt(params.page, 10) : params.page ?? 1;
  let limit: number = typeof params.limit === 'string' ? parseInt(params.limit, 10) : params.limit ?? 10;

  page = Number.isNaN(page) || page < 1 ? 1 : Math.floor(page);
  limit = Number.isNaN(limit) || limit < 1 ? 10 : Math.min(Math.floor(limit), maxLimit);

  return { page, limit };
}

/**
 * Sanitize sort parameters to prevent injection
 */
export function sanitizeSortParams(
  sort: string | undefined,
  allowedFields: string[]
): { field: string; order: 1 | -1 } | null {
  if (!sort) {
    return null;
  }

  const parts = sort.split(':');
  const field = parts[0];
  const order = parts[1] === 'desc' ? -1 : 1;

  // Only allow whitelisted fields
  if (!allowedFields.includes(field)) {
    return null;
  }

  return { field, order };
}

/**
 * Strip HTML tags completely (for plain text)
 */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize object keys to prevent prototype pollution
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  allowedKeys?: string[]
): Partial<T> {
  const sanitized: Partial<T> = {};
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

  for (const [key, value] of Object.entries(obj)) {
    // Skip dangerous keys
    if (dangerousKeys.includes(key)) {
      continue;
    }

    // If allowedKeys specified, only include those
    if (allowedKeys && !allowedKeys.includes(key)) {
      continue;
    }

    sanitized[key as keyof T] = value as T[keyof T];
  }

  return sanitized;
}

/**
 * Escape characters for use in JSON
 */
export function escapeJSON(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhoneNumber(phone: string): string | null {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid length (between 10-15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return null;
  }

  return cleaned;
}
