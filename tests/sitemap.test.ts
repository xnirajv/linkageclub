import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

describe('SEO metadata routes', () => {
  it('generates public sitemap routes without legacy auth paths', () => {
    const routes = sitemap();
    const urls = routes.map((route) => route.url);

    expect(urls).toContain('https://internhub.com/companies');
    expect(urls).not.toContain('https://internhub.com/login');
    expect(urls).not.toContain('https://internhub.com/signup');
    expect(urls).not.toContain('https://internhub.com/auth/login');
    expect(urls).not.toContain('https://internhub.com/for-companies');
  });

  it('blocks private paths in robots metadata', () => {
    const meta = robots();
    const disallow = Array.isArray(meta.rules) ? [] : meta.rules.disallow;

    expect(disallow).toContain('/api/');
    expect(disallow).toContain('/dashboard/');
    expect(disallow).toContain('/login');
  });
});
