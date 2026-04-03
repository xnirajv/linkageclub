import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, User, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest insights, tutorials, and news from InternHub',
};

async function getBlogPosts() {
  // In a real app, this would fetch from your API/database
  return [
    {
      id: '1',
      title: '10 React Hooks Every Developer Should Know',
      slug: '10-react-hooks-every-developer-should-know',
      excerpt: 'Master React development with these essential hooks that will level up your components and improve performance.',
      content: '...',
      author: {
        name: 'Riya Sharma',
        avatar: '/images/blog/authors/riya.jpg',
        role: 'Senior Frontend Developer',
      },
      category: 'Development',
      tags: ['React', 'JavaScript', 'Web Development'],
      image: '/images/blog/react-hooks.jpg',
      publishedAt: '2024-01-15',
      readTime: 8,
      views: 1234,
      likes: 89,
    },
    {
      id: '2',
      title: 'How to Land Your First Tech Internship in 2024',
      slug: 'how-to-land-first-tech-internship-2024',
      excerpt: 'A comprehensive guide for students looking to break into tech. Learn proven strategies to stand out and get hired.',
      author: {
        name: 'Amit Kumar',
        avatar: '/images/blog/authors/amit.jpg',
        role: 'Career Coach',
      },
      category: 'Career',
      tags: ['Internship', 'Career Tips', 'Job Search'],
      image: '/images/blog/internship-guide.jpg',
      publishedAt: '2024-01-12',
      readTime: 12,
      views: 2567,
      likes: 156,
    },
    {
      id: '3',
      title: 'Understanding System Design: A Beginner\'s Guide',
      slug: 'understanding-system-design-beginners-guide',
      excerpt: 'Demystify system design concepts and learn how to architect scalable applications like a pro.',
      author: {
        name: 'Vikram Singh',
        avatar: '/images/blog/authors/vikram.jpg',
        role: 'Senior Engineer at Google',
      },
      category: 'System Design',
      tags: ['System Design', 'Architecture', 'Scalability'],
      image: '/images/blog/system-design.jpg',
      publishedAt: '2024-01-10',
      readTime: 15,
      views: 1890,
      likes: 134,
    },
    {
      id: '4',
      title: 'Mastering Node.js: Best Practices for 2024',
      slug: 'mastering-nodejs-best-practices-2024',
      excerpt: 'Stay ahead of the curve with these essential Node.js practices, patterns, and performance optimization tips.',
      author: {
        name: 'Priya Patel',
        avatar: '/images/blog/authors/priya.jpg',
        role: 'Backend Architect',
      },
      category: 'Backend',
      tags: ['Node.js', 'JavaScript', 'Backend'],
      image: '/images/blog/nodejs.jpg',
      publishedAt: '2024-01-08',
      readTime: 10,
      views: 1456,
      likes: 98,
    },
    {
      id: '5',
      title: 'The Future of AI in Recruitment',
      slug: 'future-of-ai-in-recruitment',
      excerpt: 'How artificial intelligence is transforming the way companies find and hire talent, and what it means for you.',
      author: {
        name: 'Rahul Sharma',
        avatar: '/images/blog/authors/rahul.jpg',
        role: 'CEO & Co-founder',
      },
      category: 'AI',
      tags: ['AI', 'Recruitment', 'Future of Work'],
      image: '/images/blog/ai-recruitment.jpg',
      publishedAt: '2024-01-05',
      readTime: 8,
      views: 2100,
      likes: 167,
    },
    {
      id: '6',
      title: 'Building Your Developer Portfolio: A Complete Guide',
      slug: 'building-developer-portfolio-complete-guide',
      excerpt: 'Learn how to create a standout portfolio that showcases your skills and attracts recruiters.',
      author: {
        name: 'Neha Singh',
        avatar: '/images/blog/authors/neha.jpg',
        role: 'UX Designer',
      },
      category: 'Career',
      tags: ['Portfolio', 'Personal Branding', 'Web Development'],
      image: '/images/blog/portfolio.jpg',
      publishedAt: '2024-01-03',
      readTime: 10,
      views: 1678,
      likes: 112,
    },
  ];
}

const categories = [
  { name: 'All', count: 24 },
  { name: 'Development', count: 8 },
  { name: 'Career', count: 6 },
  { name: 'AI', count: 4 },
  { name: 'System Design', count: 3 },
  { name: 'Interview Prep', count: 3 },
];

const popularTags = [
  'React',
  'JavaScript',
  'Career Tips',
  'Node.js',
  'AI',
  'System Design',
  'Internship',
  'Portfolio',
  'Interview',
  'Mentorship',
];

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="premium-shell flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,221,214,0.22),transparent_28%),linear-gradient(135deg,rgba(52,74,134,0.96),rgba(64,119,148,0.94)_56%,rgba(75,73,69,0.92))]" />
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            InternHub Blog
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Insights, tutorials, and stories from the world of tech and career development
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Input
              type="search"
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 text-charcoal-950 bg-card rounded-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-charcoal-400" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-charcoal-100/50 py-16 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Categories */}
                <Card className="p-6 dark:bg-charcoal-950/72">
                  <h3 className="font-semibold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={`/blog/category/${category.name.toLowerCase()}`}
                        className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-charcoal-100/50 dark:hover:bg-charcoal-900/60"
                      >
                        <span className="text-charcoal-700 dark:text-charcoal-200">{category.name}</span>
                        <span className="rounded-full bg-charcoal-100 px-2 py-0.5 text-sm text-charcoal-500 dark:bg-charcoal-900 dark:text-charcoal-400">
                          {category.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </Card>

                {/* Popular Tags */}
                <Card className="p-6 dark:bg-charcoal-950/72">
                  <h3 className="font-semibold text-lg mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog/tag/${tag.toLowerCase()}`}
                        className="rounded-full bg-charcoal-100 px-3 py-1 text-sm text-charcoal-700 transition-colors hover:bg-primary-100 hover:text-primary-700 dark:bg-charcoal-900 dark:text-charcoal-300 dark:hover:bg-primary-950/30 dark:hover:text-primary-300"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </Card>

                {/* Newsletter */}
                <Card className="bg-[linear-gradient(180deg,rgba(224,231,255,0.56),rgba(255,255,255,0.96))] p-6 dark:bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(31,31,31,0.92))]">
                  <h3 className="font-semibold text-lg mb-2">Newsletter</h3>
                  <p className="mb-4 text-sm text-charcoal-600 dark:text-charcoal-300">
                    Get the latest articles and resources straight to your inbox
                  </p>
                  <form className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Your email"
                      className="bg-card"
                    />
                    <Button className="w-full">Subscribe</Button>
                  </form>
                </Card>
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-charcoal-950/72">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="relative h-48">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="mb-3 flex items-center gap-2 text-sm text-charcoal-500 dark:text-charcoal-400">
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300">
                            {post.category}
                          </span>
                          <span>•</span>
                          <span>{post.readTime} min read</span>
                        </div>
                        
                        <h2 className="mb-2 line-clamp-2 text-xl font-bold text-charcoal-950 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-300">
                          {post.title}
                        </h2>
                        
                        <p className="mb-4 line-clamp-2 text-charcoal-600 dark:text-charcoal-300">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                              <Image
                                src={post.author.avatar}
                                alt={post.author.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-charcoal-950 dark:text-white">{post.author.name}</p>
                              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{post.author.role}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-charcoal-500 dark:text-charcoal-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <div className="flex gap-2">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button variant="default" className="bg-primary-600">
                    1
                  </Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">4</Button>
                  <Button variant="outline">5</Button>
                  <Button variant="outline">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
