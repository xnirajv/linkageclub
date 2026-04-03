import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Calendar, User, ArrowLeft } from 'lucide-react';

interface TagPageProps {
  params: {
    tag: string;
  };
}

export function generateMetadata({ params }: TagPageProps): Metadata {
  return {
    title: `#${params.tag} Articles`,
    description: `Browse all articles tagged with #${params.tag}`,
  };
}

async function getTagPosts(tag: string) {
  // In a real app, this would fetch from your API/database
  const tags = {
    react: {
      name: 'React',
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
          title: 'Understanding useEffect: A Complete Guide',
          slug: 'understanding-useeffect-complete-guide',
          excerpt: 'Deep dive into the useEffect hook...',
          image: '/images/blog/useeffect.jpg',
          author: 'Riya Sharma',
          publishedAt: '2024-01-08',
          readTime: 10,
        },
      ],
    },
    javascript: {
      name: 'JavaScript',
      posts: [
        {
          id: '3',
          title: 'Mastering JavaScript Closures',
          slug: 'mastering-javascript-closures',
          excerpt: 'Understand one of JavaScript\'s most powerful concepts...',
          image: '/images/blog/javascript.jpg',
          author: 'Priya Patel',
          publishedAt: '2024-01-05',
          readTime: 12,
        },
      ],
    },
  };

  return tags[tag as keyof typeof tags];
}

export default async function TagPage({ params }: TagPageProps) {
  const tagData = await getTagPosts(params.tag);

  if (!tagData) {
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
            #{tagData.name}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Articles tagged with #{tagData.name}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 bg-charcoal-100/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tagData.posts.map((post) => (
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