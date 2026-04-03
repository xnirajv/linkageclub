import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
  HelpCircle,
  BookOpen,
  Users,
  MessageCircle,
  FileText,
  Video,
  Mail,
  MessageSquare,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers to common questions and get support',
};

const categories = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'New to InternHub? Start here',
    articles: 12,
    href: '/help/getting-started',
  },
  {
    icon: Users,
    title: 'For Students',
    description: 'Learn, verify, and earn',
    articles: 24,
    href: '/help/students',
  },
  {
    icon: FileText,
    title: 'For Companies',
    description: 'Hire the best talent',
    articles: 18,
    href: '/help/companies',
  },
  {
    icon: Video,
    title: 'For Mentors',
    description: 'Share your expertise',
    articles: 15,
    href: '/help/mentors',
  },
  {
    icon: MessageCircle,
    title: 'Payments & Billing',
    description: 'Invoices, refunds, withdrawals',
    articles: 10,
    href: '/help/payments',
  },
  {
    icon: HelpCircle,
    title: 'Account & Settings',
    description: 'Manage your profile',
    articles: 14,
    href: '/help/account',
  },
];

const popularArticles = [
  {
    title: 'How to create an account',
    href: '/help/articles/how-to-create-account',
    views: 1234,
  },
  {
    title: 'Understanding Trust Score',
    href: '/help/articles/trust-score-explained',
    views: 987,
  },
  {
    title: 'How to apply for projects',
    href: '/help/articles/applying-for-projects',
    views: 876,
  },
  {
    title: 'Payment methods accepted',
    href: '/help/articles/payment-methods',
    views: 765,
  },
  {
    title: 'Withdrawing your earnings',
    href: '/help/articles/withdraw-earnings',
    views: 654,
  },
];

export default function HelpPage() {
  return (
    <div className="premium-shell pb-16">
      <section className="container-custom relative z-10 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Help Center
          </div>
          <h1 className="mt-6 text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
            How can we help you today?
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-charcoal-600 dark:text-charcoal-300">
            Search articles, guides, tutorials, and support topics across the entire InternHub ecosystem.
          </p>

          <div className="relative mx-auto mt-10 max-w-2xl">
            <Input
              type="search"
              placeholder="Search for articles, tutorials, guides..."
              className="h-14 rounded-[24px] pl-12 pr-4 text-base"
            />
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal-400" />
          </div>
        </div>
      </section>

      <section className="container-custom relative z-10 py-8">
        <div className="mb-8 text-center">
          <h2 className="section-heading">Browse by category</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.title} href={category.href}>
                <Card className="luxury-border card-hover group h-full cursor-pointer p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-200 dark:bg-primary-500/15 dark:text-primary-300 dark:group-hover:bg-primary-500/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-300">
                        {category.title}
                      </h3>
                      <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300">
                        {category.description}
                      </p>
                      <p className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-300">
                        {category.articles} articles
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-charcoal-400 transition-colors group-hover:text-primary-600 dark:text-charcoal-400 dark:group-hover:text-primary-300" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-custom relative z-10 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-2xl font-bold">Popular articles</h2>
            <div className="space-y-4">
              {popularArticles.map((article) => (
                <Link key={article.title} href={article.href} className="block group">
                  <Card className="card-hover p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-charcoal-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-300">
                        {article.title}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-charcoal-500 dark:text-charcoal-400">
                          {article.views.toLocaleString()} views
                        </span>
                        <ChevronRight className="h-4 w-4 text-charcoal-400 group-hover:text-primary-600 dark:text-charcoal-400 dark:group-hover:text-primary-300" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link href="/help/articles">View all articles</Link>
              </Button>
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold">Still need help?</h2>
            <Card className="luxury-border p-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Live Chat</h3>
                    <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
                      Chat with our support team in real time.
                    </p>
                    <Button size="sm" className="mt-3">Start Chat</Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Support</h3>
                    <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
                      Get a response within 24 hours.
                    </p>
                    <Button size="sm" variant="outline" asChild className="mt-3">
                      <Link href="/contact">Send Email</Link>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Community</h3>
                    <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
                      Ask the community for help and shared advice.
                    </p>
                    <Button size="sm" variant="outline" asChild className="mt-3">
                      <Link href="/community">Visit Community</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-custom relative z-10 py-10">
        <div className="mb-12 text-center">
          <h2 className="section-heading">Video tutorials</h2>
          <p className="mx-auto mt-4 max-w-2xl text-charcoal-600 dark:text-charcoal-300">
            Learn how to make the most of InternHub with short video guides.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative h-48 bg-charcoal-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700">
                    <Video className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-charcoal-900 dark:text-white">Getting Started with InternHub</h3>
                <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300">5:30 minutes</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/help/tutorials">View all tutorials</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
