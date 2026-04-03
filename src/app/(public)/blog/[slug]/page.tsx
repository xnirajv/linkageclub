import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tag,
  Clock,
  Heart,
  Bookmark,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

async function getBlogPost(slug: string) {
  // In a real app, this would fetch from your API/database
  const posts = {
    '10-react-hooks-every-developer-should-know': {
      id: '1',
      title: '10 React Hooks Every Developer Should Know',
      slug: '10-react-hooks-every-developer-should-know',
      content: `
        <p>React Hooks revolutionized how we build components in React. They allow us to use state and other React features without writing a class. In this comprehensive guide, we'll explore the 10 most essential hooks that every React developer should master.</p>

        <h2>1. useState - The Foundation</h2>
        <p>The useState hook is the most fundamental hook. It lets you add state to functional components. Here's a simple example:</p>
        <pre><code>const [count, setCount] = useState(0);</code></pre>

        <h2>2. useEffect - Side Effects Made Easy</h2>
        <p>useEffect handles side effects in your components. From data fetching to subscriptions, it's your go-to hook for anything that happens outside the component render cycle.</p>

        <h2>3. useContext - Avoid Prop Drilling</h2>
        <p>Context provides a way to pass data through the component tree without having to pass props down manually at every level.</p>

        <h2>4. useReducer - Complex State Logic</h2>
        <p>When useState isn't enough, useReducer shines. It's perfect for managing complex state logic that involves multiple sub-values or when the next state depends on the previous one.</p>

        <h2>5. useCallback - Memoize Functions</h2>
        <p>useCallback returns a memoized callback that only changes if one of the dependencies has changed. This is useful when passing callbacks to optimized child components.</p>

        <h2>6. useMemo - Memoize Values</h2>
        <p>Similar to useCallback, useMemo memoizes expensive computations. It only recomputes the memoized value when one of the dependencies has changed.</p>

        <h2>7. useRef - Mutable References</h2>
        <p>useRef returns a mutable ref object whose .current property is initialized to the passed argument. It's perfect for accessing DOM elements or keeping mutable values that don't cause re-renders.</p>

        <h2>8. useLayoutEffect - Synchronous Effects</h2>
        <p>useLayoutEffect fires synchronously after all DOM mutations. Use this to read layout from the DOM and synchronously re-render.</p>

        <h2>9. useImperativeHandle - Customize Ref Exposures</h2>
        <p>useImperativeHandle customizes the instance value that is exposed to parent components when using ref.</p>

        <h2>10. useDebugValue - Debug Custom Hooks</h2>
        <p>useDebugValue can be used to display a label for custom hooks in React DevTools.</p>

        <h2>Conclusion</h2>
        <p>Mastering these hooks will make you a more effective React developer. Start incorporating them into your projects today and watch your components become more powerful and maintainable.</p>
      `,
      excerpt: 'Master React development with these essential hooks that will level up your components and improve performance.',
      author: {
        name: 'Riya Sharma',
        avatar: '/images/blog/authors/riya.jpg',
        role: 'Senior Frontend Developer',
        bio: 'Riya is a senior frontend developer with 5+ years of experience building scalable React applications. She loves sharing knowledge and mentoring junior developers.',
      },
      category: 'Development',
      tags: ['React', 'JavaScript', 'Web Development', 'Hooks'],
      image: '/images/blog/react-hooks.jpg',
      publishedAt: '2024-01-15',
      readTime: 8,
      views: 1234,
      likes: 89,
      comments: 24,
    },
    // Add more posts as needed
  };

  return posts[slug as keyof typeof posts];
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = [
    {
      title: 'Understanding useEffect: A Complete Guide',
      slug: 'understanding-useeffect-complete-guide',
      image: '/images/blog/useeffect.jpg',
    },
    {
      title: 'React Performance Optimization Tips',
      slug: 'react-performance-optimization-tips',
      image: '/images/blog/performance.jpg',
    },
    {
      title: 'Building Custom Hooks: Best Practices',
      slug: 'building-custom-hooks-best-practices',
      image: '/images/blog/custom-hooks.jpg',
    },
  ];

  return (
    <div className="premium-shell flex min-h-screen flex-col">
      {/* Back Button */}
      <div className="border-b border-white/55 bg-charcoal-100/50 dark:border-white/10 dark:bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-charcoal-600 hover:text-charcoal-950 dark:text-charcoal-300 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-white/90 mb-4">
                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
                  {post.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime} min read
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {post.title}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl">
                {post.excerpt}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="bg-card/70 py-12 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                {/* Author Mini */}
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm">{post.author.name}</p>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{post.author.role}</p>
                </div>

                {/* Share Buttons */}
                <div>
                  <p className="mb-2 text-sm font-medium text-charcoal-700 dark:text-charcoal-200">Share</p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Twitter className="mr-2 h-4 w-4" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Heart className="mr-2 h-4 w-4" />
                    Like ({post.likes})
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="lg:col-span-7">
              <article className="prose prose-lg max-w-none prose-headings:text-charcoal-950 prose-p:text-charcoal-700 prose-strong:text-charcoal-950 prose-code:text-primary-700 prose-pre:bg-charcoal-950 prose-pre:text-white dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-charcoal-300 dark:prose-strong:text-white dark:prose-code:text-primary-300">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </article>

              {/* Tags */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-charcoal-400" />
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${tag.toLowerCase()}`}
                      className="rounded-full bg-charcoal-100 px-3 py-1 text-sm text-charcoal-700 transition-colors hover:bg-primary-100 hover:text-primary-700 dark:bg-charcoal-900 dark:text-charcoal-300 dark:hover:bg-primary-950/30 dark:hover:text-primary-300"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Author Card */}
              <Card className="mt-8 p-6">
                <div className="flex gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      About {post.author.name}
                    </h3>
                    <p className="mb-3 text-charcoal-600 dark:text-charcoal-300">{post.author.bio}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Follow
                      </Button>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Comments Section */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-6">
                  Comments ({post.comments})
                </h3>
                
                {/* Comment Form */}
                <Card className="p-6 mb-6">
                  <textarea
                    placeholder="Share your thoughts..."
                    className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={4}
                  />
                  <div className="flex justify-end mt-3">
                    <Button>Post Comment</Button>
                  </div>
                </Card>

                {/* Comments List */}
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="font-medium">User Name</span>
                              <span className="text-xs text-charcoal-500 ml-2">
                                2 days ago
                              </span>
                            </div>
                            <Button variant="ghost" size="sm">
                              Reply
                            </Button>
                          </div>
                          <p className="text-charcoal-700 dark:text-charcoal-300">
                            Great article! Very helpful for beginners like me.
                            Thanks for sharing!
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Related Posts */}
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <h3 className="font-semibold text-lg mb-4">Related Posts</h3>
                <div className="space-y-4">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      className="block group"
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-32">
                          <Image
                            src={related.image}
                            alt={related.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary-600">
                            {related.title}
                          </h4>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Newsletter */}
                <Card className="mt-6 bg-[linear-gradient(180deg,rgba(224,231,255,0.56),rgba(255,255,255,0.96))] p-4 dark:bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(31,31,31,0.92))]">
                  <h4 className="font-semibold mb-2">Get Updates</h4>
                  <p className="mb-3 text-sm text-charcoal-600 dark:text-charcoal-300">
                    Join our newsletter for the latest articles
                  </p>
                  <form className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Your email"
                      className="bg-card text-sm"
                    />
                    <Button size="sm" className="w-full">
                      Subscribe
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
