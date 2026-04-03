'use client';

import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Overview', href: '/' },
      { label: 'Companies', href: '/companies' },
      { label: 'Mentors', href: '/mentors' },
      { label: 'Founders', href: '/founders' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Help Center', href: '/help' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Refund Policy', href: '/legal/refund' },
    ],
  },
];

const contacts = [
  { icon: Mail, label: 'support@internhub.com', href: 'mailto:support@internhub.com' },
  { icon: Phone, label: '+91 98765 43210', href: 'tel:+919876543210' },
  { icon: MapPin, label: 'Bengaluru, India', href: 'https://maps.google.com/?q=Bengaluru' },
];

export function Footer() {
  return (
    <footer className="premium-shell relative mt-24 overflow-hidden border-t border-white/40 bg-transparent dark:border-white/10">
      <div className="container-custom relative z-10 py-16">
        <div className="glass-card luxury-border mb-12 rounded-[32px] p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Ready to scale faster
              </div>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight text-charcoal-900 md:text-4xl dark:text-white">
                A premium ecosystem for learning, hiring, mentoring, and building teams.
              </h2>
              <p className="mt-4 max-w-2xl text-base text-charcoal-600 dark:text-charcoal-300">
                InternHub connects verified talent, serious operators, and high-signal opportunities in one polished product experience.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
              <ThemeToggle />
              <Button asChild size="lg">
                <Link href="/signup">
                  Start free
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Talk to us</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-info-500 to-secondary-500 text-sm font-bold text-white">
                IH
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.28em] text-charcoal-900 dark:text-white">InternHub</div>
                <div className="text-sm text-charcoal-500 dark:text-charcoal-400">Premium talent ecosystem</div>
              </div>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-7 text-charcoal-600 dark:text-charcoal-300">
              Built for modern teams that care about trust, velocity, and quality. Every surface is designed to help talent and companies make better decisions faster.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {contacts.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="glass-card rounded-2xl px-4 py-4 text-sm text-charcoal-700 transition hover:-translate-y-0.5 hover:border-primary-100 hover:text-primary-700 dark:text-charcoal-200 dark:hover:border-primary-700 dark:hover:text-primary-300"
                >
                  <Icon className="mb-2 h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-charcoal-900 dark:text-white">
                  {column.title}
                </h3>
                <div className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-sm text-charcoal-600 transition hover:text-primary-700 dark:text-charcoal-300 dark:hover:text-info-300"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/45 pt-6 text-sm text-charcoal-500 dark:border-white/10 dark:text-charcoal-400 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} InternHub. Designed for ambitious builders.</p>
          <p>Light and dark experiences tuned for premium hiring, learning, and mentoring flows.</p>
        </div>
      </div>
    </footer>
  );
}
