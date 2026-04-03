import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

type Accent = 'primary' | 'secondary' | 'info' | 'charcoal';

const accentMap: Record<Accent, string> = {
  primary: 'from-primary-700 to-info-600 text-white shadow-[0_24px_70px_-34px_rgba(52,74,134,0.72)]',
  secondary: 'from-secondary-400 to-secondary-600 text-charcoal-950 shadow-[0_24px_70px_-34px_rgba(194,150,75,0.65)]',
  info: 'from-info-500 to-primary-700 text-white shadow-[0_24px_70px_-34px_rgba(64,119,148,0.7)]',
  charcoal: 'from-charcoal-700 to-charcoal-900 text-white shadow-[0_24px_70px_-34px_rgba(75,73,69,0.72)]',
};

const softAccentMap: Record<Accent, string> = {
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-info-300',
  secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/25 dark:text-secondary-200',
  info: 'bg-info-50 text-info-700 dark:bg-info-950/40 dark:text-info-300',
  charcoal: 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-100',
};

export interface PremiumDashboardMetric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: Accent;
  meta?: string;
  href?: string;
}

interface DashboardHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  accent?: Accent;
  actions?: Array<{ label: string; href: string; variant?: 'default' | 'outline' | 'secondary' }>;
  stats?: Array<{ label: string; value: string }>;
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  accent = 'primary',
  actions = [],
  stats = [],
}: DashboardHeroProps) {
  return (
    <Card className={cn('overflow-hidden border-none bg-gradient-to-br', accentMap[accent])}>
      <CardContent className="p-7 md:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-card/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]">
              {eyebrow}
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] md:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">{description}</p>
            {actions.length > 0 && (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {actions.map((action) => (
                  <Button
                    key={action.href}
                    asChild
                    variant={action.variant || 'outline'}
                    className={cn(
                      action.variant === 'default'
                        ? 'bg-card text-charcoal-950 hover:bg-card/90'
                        : action.variant === 'secondary'
                          ? 'bg-secondary-500 text-charcoal-950 hover:bg-secondary-400'
                          : 'border-white/25 bg-card/10 text-white hover:bg-card/15'
                    )}
                  >
                    <Link href={action.href}>
                      {action.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {stats.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[24px] border border-white/15 bg-card/10 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardMetricGrid({
  metrics,
  columns = 4,
}: {
  metrics: PremiumDashboardMetric[];
  columns?: 3 | 4 | 6;
}) {
  const gridClass =
    columns === 6
      ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6'
      : columns === 3
        ? 'grid-cols-1 md:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';

  return (
    <div className={cn('grid gap-4', gridClass)}>
      {metrics.map(({ label, value, icon: Icon, accent = 'primary', meta, href }) => {
        const body = (
          <Card className="card-hover luxury-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-semibold tracking-[-0.03em] text-charcoal-900 dark:text-white">{value}</div>
                  <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{label}</div>
                  {meta ? <div className="mt-3 text-xs font-medium text-charcoal-600 dark:text-charcoal-300">{meta}</div> : null}
                </div>
                <div className={cn('rounded-2xl p-3', softAccentMap[accent])}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );

        return href ? (
          <Link key={label} href={href}>
            {body}
          </Link>
        ) : (
          <div key={label}>{body}</div>
        );
      })}
    </div>
  );
}

export function DashboardSection({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('luxury-border overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-charcoal-900 dark:text-white">{title}</h2>
            {subtitle ? <p className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">{subtitle}</p> : null}
          </div>
          {action ? (
            <Button asChild size="sm" variant="outline">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : null}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
