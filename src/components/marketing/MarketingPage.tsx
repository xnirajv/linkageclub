import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type MarketingStat = {
  label: string;
  value: string;
};

type MarketingFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: 'primary' | 'secondary' | 'info' | 'charcoal';
};

type MarketingStep = {
  title: string;
  description: string;
};

type MarketingTestimonial = {
  name: string;
  role: string;
  quote: string;
};

type MarketingPlan = {
  name: string;
  price: string;
  description: string;
  featured?: boolean;
  items: string[];
  href: string;
};

export interface MarketingPageProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  heroPanelTitle: string;
  heroPanelBody: string;
  heroBullets: string[];
  stats: MarketingStat[];
  featuresTitle: string;
  features: MarketingFeature[];
  stepsTitle: string;
  steps: MarketingStep[];
  testimonialTitle: string;
  testimonials: MarketingTestimonial[];
  plansTitle?: string;
  plans?: MarketingPlan[];
}

const accentStyles: Record<MarketingFeature['accent'], string> = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
  secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-500/15 dark:text-secondary-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  charcoal: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200',
};

export function MarketingPage({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  heroPanelTitle,
  heroPanelBody,
  heroBullets,
  stats,
  featuresTitle,
  features,
  stepsTitle,
  steps,
  testimonialTitle,
  testimonials,
  plansTitle,
  plans,
}: MarketingPageProps) {
  return (
    <div className="premium-shell">
      <section className="container-custom relative z-10 py-10 sm:py-14 lg:py-20">
        <div className="absolute inset-x-0 top-6 -z-10 hidden h-[420px] rounded-[48px] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_36%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.14),transparent_34%)] blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="animate-enter">
            <div className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.05em] text-charcoal-900 sm:text-6xl lg:text-7xl dark:text-white">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal-600 dark:text-charcoal-300">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={primaryCta.href}>
                  {primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {secondaryCta ? (
                <Button asChild size="lg" variant="outline">
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <Card key={stat.label} className="luxury-border card-hover gradient-card animate-enter" style={{ animationDelay: `${index * 120}ms` }}>
                  <CardContent className="p-5">
                    <div className="text-3xl font-semibold text-charcoal-900 dark:text-white">{stat.value}</div>
                    <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="luxury-border gradient-card animate-enter overflow-hidden" style={{ animationDelay: '180ms' }}>
            <CardContent className="relative p-8 lg:p-10">
              <div className="animate-aurora absolute inset-0 opacity-80">
                <div className="absolute -left-16 top-0 h-32 w-32 rounded-full bg-primary-500/20 blur-3xl" />
                <div className="absolute right-0 top-10 h-36 w-36 rounded-full bg-info-500/15 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-secondary-500/20 blur-3xl" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="eyebrow">
                    <span className="status-dot" />
                    Premium flow
                  </div>
                  <div className="rounded-full bg-charcoal-900 px-3 py-1 text-xs font-semibold text-white dark:bg-card dark:text-charcoal-900">
                    Live
                  </div>
                </div>
                <h2 className="mt-6 text-3xl font-semibold text-charcoal-900 dark:text-white">{heroPanelTitle}</h2>
                <p className="mt-4 text-base leading-7 text-charcoal-600 dark:text-charcoal-300">{heroPanelBody}</p>
                <div className="mt-8 grid gap-3">
                  {heroBullets.map((item, index) => (
                    <div
                      key={item}
                      className="glass-card animate-enter flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-charcoal-700"
                      style={{ animationDelay: `${220 + index * 120}ms` }}
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                      <span className="dark:text-charcoal-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container-custom relative z-10 py-12 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-600 dark:text-primary-300">Core capabilities</p>
            <h2 className="section-heading mt-3">{featuresTitle}</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ title: featureTitle, description: featureDescription, icon: Icon, accent }, index) => (
            <Card key={featureTitle} className="luxury-border card-hover animate-enter overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className={`inline-flex rounded-2xl p-3 ${accentStyles[accent]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-charcoal-900 dark:text-white">{featureTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-charcoal-600 dark:text-charcoal-300">{featureDescription}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-custom relative z-10 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <Card className="overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,#4f46e5_0%,#3b82f6_46%,#8b5cf6_100%)] text-white shadow-[0_30px_90px_-36px_rgba(99,102,241,0.55)]">
            <CardContent className="p-8 lg:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">How it works</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">{stepsTitle}</h2>
              <p className="mt-4 text-base leading-7 text-white/80">
                Designed to feel calm, fast, and high-trust for people making important career and hiring decisions.
              </p>
            </CardContent>
          </Card>
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <Card key={step.title} className="luxury-border card-hover animate-enter" style={{ animationDelay: `${index * 120}ms` }}>
                <CardContent className="flex gap-5 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(99,102,241,0.65)]">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal-900 dark:text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-charcoal-600 dark:text-charcoal-300">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {plans && plans.length > 0 ? (
        <section className="container-custom relative z-10 py-12 lg:py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-600 dark:text-primary-300">Plans</p>
            <h2 className="section-heading mt-3">{plansTitle}</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`luxury-border card-hover animate-enter ${plan.featured ? 'bg-[linear-gradient(180deg,rgba(224,231,255,0.72)_0%,rgba(255,255,255,0.96)_100%)] dark:bg-[linear-gradient(180deg,rgba(79,70,229,0.16)_0%,rgba(31,31,31,0.96)_100%)]' : ''}`}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-charcoal-900 dark:text-white">{plan.name}</h3>
                    {plan.featured ? (
                      <div className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-1 text-xs font-semibold text-white">
                        Popular
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-charcoal-900 dark:text-white">{plan.price}</div>
                  <p className="mt-3 text-sm leading-7 text-charcoal-600 dark:text-charcoal-300">{plan.description}</p>
                  <div className="mt-5 space-y-3">
                    {plan.items.map((item) => (
                      <div key={item} className="flex gap-3 text-sm text-charcoal-700 dark:text-charcoal-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <Button asChild className="mt-6 w-full" variant={plan.featured ? 'default' : 'outline'}>
                    <Link href={plan.href}>{plan.featured ? 'Choose plan' : 'Learn more'}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-custom relative z-10 py-12 lg:py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-600 dark:text-primary-300">Testimonials</p>
          <h2 className="section-heading mt-3">{testimonialTitle}</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.name} className="luxury-border card-hover animate-enter" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex gap-1 text-secondary-500">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-5 text-sm leading-7 text-charcoal-700 dark:text-charcoal-200">
                  <span aria-hidden="true">&ldquo;</span>
                  {testimonial.quote}
                  <span aria-hidden="true">&rdquo;</span>
                </p>
                <div className="mt-6">
                  <div className="font-semibold text-charcoal-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-sm text-charcoal-500 dark:text-charcoal-400">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
