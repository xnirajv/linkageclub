import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Calendar, User, ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  return {
    title: `${params.category} Articles`,
    description: `Browse all articles in the ${params.category} category`,
  };
}

async function getCategoryPosts(category: string) {
  // In a real app, this would fetch from your API/database
  const categories = {
    development: {
      name: 'Development',
      description: 'Tutorials and insights on software development',
      posts: [
        {
          id: '1',
          title: '10 React Hooks Every Developer Should Know',
          slug: '10-react-hooks-every-developer-should-know',
          excerpt: 'Master React development with these essential hooks...',
          image: '/images/blog/react-hooks.jpg',
          author: 'Riya Sharma',
          publishedAt: '2024-01-15',
          readTime: 8,
        },
        {
          id: '2',
          title: 'Understanding System Design: A Beginner\'s Guide',
          slug: 'understanding-system-design-beginners-guide',
          excerpt: 'Demystify system design concepts...',
          image: '/images/blog/system-design.jpg',
          author: 'Vikram Singh',
          publishedAt: '2024-01-10',
          readTime: 15,
        },
      ],
    },
    career: {
      name: 'Career',
      description: 'Career advice, tips, and guidance',
      posts: [
        {
          id: '3',
          title: 'How to Land Your First Tech Internship in 2024',
          slug: 'how-to-land-first-tech-internship-2024',
          excerpt: 'A comprehensive guide for students...',
          image: '/images/blog/internship-guide.jpg',
          author: 'Amit Kumar',
          publishedAt: '2024-01-12',
          readTime: 12,
        },
      ],
    },
  };

  return categories[category as keyof typeof categories];
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryData = await getCategoryPosts(params.category);

  if (!categoryData) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-white/90 hover:text-white mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {categoryData.name}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            {categoryData.description}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 bg-charcoal-100/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryData.posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    <h2 className="text-xl font-bold mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-charcoal-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}