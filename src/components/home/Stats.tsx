'use client';

import * as React from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Building, IndianRupee, Award, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface StatItem {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  color: string;
}

const stats: StatItem[] = [
  {
    icon: Users,
    value: 10000,
    label: 'Active Students',
    suffix: '+',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Building,
    value: 500,
    label: 'Partner Companies',
    suffix: '+',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: IndianRupee,
    value: 25000000,
    label: 'Total Earnings',
    prefix: '₹',
    suffix: '+',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Award,
    value: 5000,
    label: 'Projects Completed',
    suffix: '+',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: TrendingUp,
    value: 94,
    label: 'Success Rate',
    suffix: '%',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: Clock,
    value: 50000,
    label: 'Hours Mentored',
    suffix: '+',
    color: 'from-indigo-500 to-indigo-600',
  },
];

function Counter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
    return;
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-3xl font-bold md:text-4xl">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="bg-card py-16 dark:bg-charcoal-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className={cn(
                    'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r text-white',
                    stat.color
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                    {stat.label}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}