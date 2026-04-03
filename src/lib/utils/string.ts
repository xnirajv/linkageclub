/**
 * Generate random string
 */
export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number, ellipsis: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + ellipsis;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert to camelCase
 */
export function camelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

/**
 * Convert to snake_case
 */
export function snakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '_');
}

/**
 * Convert to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-');
}

/**
 * Convert to PascalCase
 */
export function pascalCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^./, chr => chr.toUpperCase());
}

/**
 * Strip HTML tags
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => htmlEntities[char]);
}

/**
 * Unescape HTML special characters
 */
export function unescapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, entity => htmlEntities[entity]);
}

/**
 * Count words in string
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).length;
}

/**
 * Count characters in string
 */
export function charCount(str: string, includeSpaces: boolean = true): number {
  if (includeSpaces) return str.length;
  return str.replace(/\s/g, '').length;
}

/**
 * Reverse string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Check if string is palindrome
 */
export function isPalindrome(str: string): boolean {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === reverse(clean);
}

/**
 * Extract numbers from string
 */
export function extractNumbers(str: string): number[] {
  return (str.match(/\d+/g) || []).map(Number);
}

/**
 * Extract emails from string
 */
export function extractEmails(str: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return str.match(emailRegex) || [];
}

/**
 * Extract URLs from string
 */
export function extractUrls(str: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return str.match(urlRegex) || [];
}

/**
 * Mask string (e.g., for credit card)
 */
export function mask(str: string, visibleCount: number = 4, maskChar: string = '*'): string {
  if (str.length <= visibleCount) return str;
  const maskedLength = str.length - visibleCount;
  return maskChar.repeat(maskedLength) + str.slice(-visibleCount);
}

/**
 * Format phone number
 */
export function formatPhone(phone: string, country: string = 'IN'): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (country === 'IN') {
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }
  
  return phone;
}