import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://internhub.com';
  
  const routes = [
    '',
    '/about',
    '/pricing',
    '/contact',
    '/blog',
    '/help',
    '/login',
    '/signup',
    '/companies',
    '/mentors',
    '/founders',
    '/legal/terms',
    '/legal/privacy',
    '/legal/refund',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
