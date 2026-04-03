'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, ArrowRight, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils/cn';

const navigation = [
  { title: 'Platform', href: '/', description: 'Overview of the ecosystem' },
  { title: 'Companies', href: '/companies', description: 'Hire vetted talent faster' },
  { title: 'Mentors', href: '/mentors', description: 'Monetize expertise with premium mentorship' },
  { title: 'Founders', href: '/founders', description: 'Build teams and find co-founders' },
  { title: 'Pricing', href: '/pricing', description: 'Plans built for scale' },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const dashboardHref = session?.user?.role
    ? `/dashboard/${session.user.role === 'admin' ? 'admin' : session.user.role}`
    : '/dashboard';

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 sm:px-5">
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between rounded-[28px] px-4 py-3 transition-all duration-300 sm:px-5 sm:py-3.5',
          isScrolled
            ? 'glass-card luxury-border'
            : 'border border-white/35 bg-card/48 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-charcoal-900/48'
        )}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-info-500 to-secondary-500 text-sm font-bold text-white shadow-[0_18px_34px_-20px_rgba(99,102,241,0.8)]">
            IH
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-charcoal-900 dark:text-white">
              InternHub
            </div>
            <div className="hidden items-center gap-1 text-xs text-charcoal-500 sm:flex dark:text-charcoal-400">
              <Sparkles className="h-3.5 w-3.5 text-primary-500" />
              Premium talent ecosystem
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                  active
                    ? 'bg-gradient-to-r from-primary-500/15 to-secondary-500/15 text-primary-700 shadow-sm dark:text-primary-300'
                    : 'text-charcoal-700 hover:bg-card/70 hover:text-primary-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800/80 dark:hover:text-primary-300'
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {session ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={dashboardHref}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="interactive-ring inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-card/70 text-charcoal-900 shadow-sm lg:hidden dark:border-white/10 dark:bg-charcoal-900/80 dark:text-white"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="glass-card luxury-border mx-auto mt-3 max-w-7xl rounded-[28px] p-4 lg:hidden">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl border border-transparent bg-card/70 px-4 py-3 text-sm text-charcoal-800 transition hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700 dark:bg-charcoal-900/60 dark:text-charcoal-100 dark:hover:border-primary-700 dark:hover:bg-charcoal-800"
              >
                <div className="font-semibold">{item.title}</div>
                <div className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">{item.description}</div>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <ThemeToggle />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {session ? (
              <>
                <Button asChild variant="outline">
                  <Link href={dashboardHref}>Dashboard</Link>
                </Button>
                <Button variant="default" onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Create account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
