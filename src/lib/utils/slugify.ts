/**
 * Slugify utility for generating URL-friendly slugs from strings
 */

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @param options - Optional configuration
 * @returns URL-friendly slug
 */
export function slugify(
  text: string,
  options: {
    separator?: string;
    lowercase?: boolean;
    maxLength?: number;
    removeStopWords?: boolean;
    transliterate?: boolean;
  } = {}
): string {
  const {
    separator = '-',
    lowercase = true,
    maxLength = 100,
    removeStopWords = false,
    transliterate = true,
  } = options;

  if (!text) return '';

  let slug = text;

  // Transliterate special characters
  if (transliterate) {
    slug = transliterateText(slug);
  }

  // Convert to lowercase if specified
  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Remove stop words if specified
  if (removeStopWords) {
    slug = removeStopWordsFromText(slug);
  }

  // Replace non-alphanumeric characters with separator
  slug = slug.replace(/[^a-z0-9]+/gi, separator);

  // Remove leading and trailing separators
  slug = slug.replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

  // Truncate to max length
  if (maxLength > 0 && slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(new RegExp(`${separator}[^${separator}]*$`), '');
  }

  return slug;
}

/**
 * Generate a unique slug by appending a number or random string
 * @param baseSlug - The base slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[] = []
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Try appending numbers first
  for (let i = 1; i <= 100; i++) {
    const numberedSlug = `${baseSlug}-${i}`;
    if (!existingSlugs.includes(numberedSlug)) {
      return numberedSlug;
    }
  }

  // Fallback to random string
  const randomSlug = `${baseSlug}-${generateRandomString(6)}`;
  return randomSlug;
}

/**
 * Generate a slug from a title for SEO-friendly URLs
 * @param title - The title to slugify
 * @param id - Optional ID to append
 * @returns SEO-friendly slug
 */
export function generateSeoSlug(title: string, id?: string): string {
  const baseSlug = slugify(title, {
    maxLength: 60,
    removeStopWords: true,
  });

  if (id) {
    return `${baseSlug}-${id}`;
  }

  return baseSlug;
}

/**
 * Generate a slug for a user profile
 * @param name - User's name
 * @param userId - User's ID
 * @returns Profile slug
 */
export function generateProfileSlug(name: string, userId: string): string {
  const nameSlug = slugify(name, { maxLength: 30 });
  return `${nameSlug}-${userId.slice(-6)}`;
}

/**
 * Generate a slug for a project
 * @param title - Project title
 * @param projectId - Project ID
 * @returns Project slug
 */
export function generateProjectSlug(title: string, projectId: string): string {
  const titleSlug = slugify(title, { maxLength: 40 });
  return `${titleSlug}-${projectId.slice(-8)}`;
}

/**
 * Generate a slug for a job posting
 * @param title - Job title
 * @param company - Company name
 * @param jobId - Job ID
 * @returns Job slug
 */
export function generateJobSlug(title: string, company: string, jobId: string): string {
  const titleSlug = slugify(title, { maxLength: 30 });
  const companySlug = slugify(company, { maxLength: 20 });
  return `${titleSlug}-at-${companySlug}-${jobId.slice(-6)}`;
}

/**
 * Generate a slug for a blog post
 * @param title - Blog post title
 * @param date - Publication date
 * @returns Blog post slug
 */
export function generateBlogSlug(title: string, date?: Date): string {
  const titleSlug = slugify(title, { maxLength: 50 });
  
  if (date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}/${titleSlug}`;
  }
  
  return titleSlug;
}

/**
 * Generate a slug for a category
 * @param name - Category name
 * @returns Category slug
 */
export function generateCategorySlug(name: string): string {
  return slugify(name, { maxLength: 30 });
}

/**
 * Generate a slug for a tag
 * @param name - Tag name
 * @returns Tag slug
 */
export function generateTagSlug(name: string): string {
  return slugify(name, { maxLength: 20 });
}

/**
 * Extract ID from a slug
 * @param slug - The slug containing an ID
 * @param pattern - Pattern to extract ID (default: last segment after last hyphen)
 * @returns Extracted ID or null
 */
export function extractIdFromSlug(slug: string, pattern?: RegExp): string | null {
  if (pattern) {
    const match = slug.match(pattern);
    return match ? match[1] : null;
  }

  // Default: extract last segment after last hyphen
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if last part looks like an ID (alphanumeric, reasonable length)
  if (/^[a-f0-9]{6,}$/i.test(lastPart)) {
    return lastPart;
  }
  
  return null;
}

/**
 * Check if a slug is valid
 * @param slug - The slug to validate
 * @returns Boolean indicating if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
}

/**
 * Generate a random string for fallback slugs
 * @param length - Length of random string
 * @returns Random string
 */
function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Transliterate special characters to ASCII
 * @param text - Text to transliterate
 * @returns Transliterated text
 */
function transliterateText(text: string): string {
  const charMap: Record<string, string> = {
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
    'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'å': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ø': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ů': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ç': 'c', 'ć': 'c', 'č': 'c',
    'ñ': 'n',
    'ł': 'l',
    'đ': 'd',
    'ř': 'r',
    'š': 's',
    'ť': 't',
    'ž': 'z',
    'æ': 'ae', 'œ': 'oe',
    '©': 'c',
    '®': 'r',
    '™': 'tm',
    '€': 'euro',
    '£': 'pound',
    '$': 'dollar',
    '¥': 'yen',
    '₹': 'rupee',
    '&': 'and',
    '@': 'at',
    '#': 'hash',
    '%': 'percent',
  };

  return text.replace(/[^a-zA-Z0-9\s-]/g, (char) => charMap[char] || char);
}

/**
 * Remove common stop words from text
 * @param text - Text to process
 * @returns Text without stop words
 */
function removeStopWordsFromText(text: string): string {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'up', 'down', 'is', 'are', 'was',
    'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could',
  ]);

  return text.split(' ').filter(word => !stopWords.has(word.toLowerCase())).join(' ');
}

/**
 * Batch slugify multiple strings
 * @param items - Array of strings to slugify
 * @param options - Slugify options
 * @returns Array of slugs
 */
export function batchSlugify(
  items: string[],
  options?: Parameters<typeof slugify>[1]
): string[] {
  return items.map(item => slugify(item, options));
}

/**
 * Create a slug factory for consistent slug generation
 * @param prefix - Prefix for all slugs
 * @param options - Default slugify options
 * @returns Slug factory functions
 */
export function createSlugFactory(prefix: string, options: Parameters<typeof slugify>[1] = {}) {
  return {
    /**
     * Create a slug with the factory prefix
     */
    create: (text: string, suffix?: string): string => {
      const baseSlug = slugify(text, options);
      const prefixSlug = slugify(prefix, options);
      
      if (suffix) {
        const suffixSlug = slugify(suffix, options);
        return `${prefixSlug}-${baseSlug}-${suffixSlug}`;
      }
      
      return `${prefixSlug}-${baseSlug}`;
    },

    /**
     * Check if a slug belongs to this factory
     */
    belongsToFactory: (slug: string): boolean => {
      const prefixSlug = slugify(prefix, options);
      return slug.startsWith(prefixSlug);
    },

    /**
     * Extract the base part from a factory slug
     */
    extractBase: (slug: string): string | null => {
      const prefixSlug = slugify(prefix, options);
      if (!slug.startsWith(prefixSlug)) return null;
      
      const withoutPrefix = slug.substring(prefixSlug.length + 1);
      const parts = withoutPrefix.split('-');
      return parts[0] || null;
    },
  };
}