'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Cycle = 'monthly' | 'yearly';

type PricingPlan = {
  name: string;
  description: string;
  price: Record<Cycle, string>;
  items: readonly string[];
  href: string;
  featured?: boolean;
};

const studentPlans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'For discovering the platform and building initial momentum.',
    price: { monthly: 'Free', yearly: 'Free' },
    items: ['Profile setup', 'Core learning access', 'Basic applications'],
    href: '/signup?role=student&plan=starter',
  },
  {
    name: 'Pro',
    description: 'For serious learners who want premium visibility and support.',
    price: { monthly: '₹499', yearly: '₹3,999' },
    items: ['Advanced assessments', 'Priority applications', 'Mentor session access'],
    href: '/signup?role=student&plan=pro',
    featured: true,
  },
  {
    name: 'Premium',
    description: 'For students optimizing aggressively for outcomes and guidance.',
    price: { monthly: '₹999', yearly: '₹7,999' },
    items: ['Unlimited premium access', 'Mock interviews', 'Career acceleration tools'],
    href: '/signup?role=student&plan=premium',
  },
];

const companyPlans: PricingPlan[] = [
  {
    name: 'Startup',
    description: 'For lean teams hiring occasionally but wanting strong presentation.',
    price: { monthly: '₹1,999', yearly: '₹17,999' },
    items: ['Project and job posts', 'Core AI matching', 'Hiring dashboard'],
    href: '/signup?role=company&plan=startup',
  },
  {
    name: 'Business',
    description: 'For growing companies running multi-role hiring at speed.',
    price: { monthly: '₹4,999', yearly: '₹44,999' },
    items: ['Advanced filtering', 'Priority support', 'Team workflows'],
    href: '/signup?role=company&plan=business',
    featured: true,
  },
  {
    name: 'Enterprise',
    description: 'For larger orgs with custom workflows and premium support needs.',
    price: { monthly: 'Custom', yearly: 'Custom' },
    items: ['Dedicated support', 'Custom hiring programs', 'High-volume access'],
    href: '/contact?subject=enterprise',
  },
];

function PlanCard({
  name,
  description,
  price,
  items,
  href,
  featured,
}: {
  name: string;
  description: string;
  price: string;
  items: readonly string[];
  href: string;
  featured?: boolean;
}) {
  return (
    <Card
      className={
        featured
          ? 'luxury-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(232,236,245,0.9)_100%)] dark:bg-[linear-gradient(180deg,rgba(35,32,28,0.95)_0%,rgba(36,49,79,0.86)_100%)]'
          : 'luxury-border'
      }
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-charcoal-900 dark:text-white">{name}</h3>
          {featured && (
            <span className="rounded-full bg-secondary-500 px-3 py-1 text-xs font-semibold text-charcoal-950">
              Popular
            </span>
          )}
        </div>
        <div className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-charcoal-900 dark:text-white">{price}</div>
        <p className="mt-3 text-sm leading-7 text-charcoal-600 dark:text-charcoal-300">{description}</p>
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item} className="flex gap-3 text-sm text-charcoal-700 dark:text-charcoal-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-info-600" />
              {item}
            </div>
          ))}
        </div>
        <Button asChild className="mt-6 w-full" variant={featured ? 'default' : 'outline'}>
          <Link href={href}>{featured ? 'Choose plan' : 'Get started'}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<Cycle>('monthly');

  const student = useMemo(
    () =>
      studentPlans.map((plan) => ({
        ...plan,
        displayPrice: plan.price[billingCycle],
      })),
    [billingCycle]
  );

  const company = useMemo(
    () =>
      companyPlans.map((plan) => ({
        ...plan,
        displayPrice: plan.price[billingCycle],
      })),
    [billingCycle]
  );

  return (
    <div className="premium-shell">
      <section className="container-custom relative z-10 py-12 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-charcoal-900/70 dark:text-info-300">
            <Sparkles className="h-3.5 w-3.5" />
            Transparent pricing
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-charcoal-900 sm:text-6xl dark:text-white">
            Premium plans for ambitious talent and high-growth teams.
          </h1>
          <p className="mt-6 text-lg leading-8 text-charcoal-600 dark:text-charcoal-300">
            Choose a plan built for your stage. Every tier is designed to keep the experience clean, modern, and conversion-focused.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="luxury-border inline-flex rounded-full bg-card/70 p-1.5 backdrop-blur dark:bg-charcoal-900/70">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                billingCycle === 'monthly'
                  ? 'bg-primary-700 text-white shadow'
                  : 'text-charcoal-600 hover:text-primary-700 dark:text-charcoal-300 dark:hover:text-info-300'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                billingCycle === 'yearly'
                  ? 'bg-primary-700 text-white shadow'
                  : 'text-charcoal-600 hover:text-primary-700 dark:text-charcoal-300 dark:hover:text-info-300'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
      </section>

      <section className="container-custom relative z-10 py-8 lg:py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-secondary-700 dark:text-secondary-300">Students</p>
          <h2 className="mt-3 text-3xl font-semibold text-charcoal-900 dark:text-white">Plans for learning, proof, and career momentum</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {student.map((plan) => (
            <PlanCard
              key={plan.name}
              name={plan.name}
              description={plan.description}
              price={plan.displayPrice}
              items={plan.items}
              href={plan.href}
              featured={plan.featured}
            />
          ))}
        </div>
      </section>

      <section className="container-custom relative z-10 py-12 lg:py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-secondary-700 dark:text-secondary-300">Companies</p>
          <h2 className="mt-3 text-3xl font-semibold text-charcoal-900 dark:text-white">Plans for polished hiring and better shortlists</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {company.map((plan) => (
            <PlanCard
              key={plan.name}
              name={plan.name}
              description={plan.description}
              price={plan.displayPrice}
              items={plan.items}
              href={plan.href}
              featured={plan.featured}
            />
          ))}
        </div>
      </section>

      <section className="container-custom relative z-10 py-4 pb-16 lg:pb-24">
        <Card className="luxury-border overflow-hidden bg-[linear-gradient(145deg,rgba(52,74,134,0.94)_0%,rgba(64,119,148,0.92)_100%)] text-white shadow-[0_30px_90px_-36px_rgba(52,74,134,0.72)]">
          <CardContent className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">Need a custom setup?</p>
              <h2 className="mt-3 text-3xl font-semibold">We can tailor plans for enterprise hiring, cohorts, and founder programs.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">
                If you’re running large teams, premium education programs, or custom talent initiatives, we’ll shape the workflow around you.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
