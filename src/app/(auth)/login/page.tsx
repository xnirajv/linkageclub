'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SocialAuth } from '@/components/auth/SocialAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const highlights = [
  'Access your dashboard, matches, and conversations in one place',
  'Premium workspace for talent, mentors, founders, and hiring teams',
  'Fast sign-in now, deeper profile completion later inside the dashboard',
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="premium-shell relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%)]" />

      <div className="container-custom relative flex min-h-screen items-center justify-center py-6 lg:py-10">
        <Card className="luxury-border w-full max-w-[1180px] overflow-hidden border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,246,241,0.9))] shadow-[0_50px_140px_-60px_rgba(76,95,170,0.45)] backdrop-blur-xl dark:bg-charcoal-900/78">
          <CardContent className="p-5 lg:p-6">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[30px] border border-white/60 bg-[linear-gradient(145deg,rgba(58,86,161,0.94),rgba(71,122,150,0.9)_58%,rgba(196,153,79,0.5)_100%)] p-6 text-white shadow-[0_40px_100px_-54px_rgba(52,74,134,0.72)] lg:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/82">
                  <Sparkles className="h-3.5 w-3.5" />
                  Welcome back
                </div>

                <h1 className="mt-5 max-w-xl text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.06em] text-white lg:text-[3.2rem]">
                  Sign in to your premium InternHub workspace.
                </h1>

                <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/78">
                  Continue where you left off with a calmer, sharper sign-in experience designed for modern workflows.
                </p>

                <div className="mt-8 grid gap-3">
                  {highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-[22px] border border-white/18 bg-white/10 px-4 py-3 text-sm text-white/88 backdrop-blur"
                    >
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-secondary-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-white/18 bg-black/10 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/64">Access</div>
                    <div className="mt-2 text-3xl font-semibold text-white">1 login</div>
                    <div className="mt-2 text-sm text-white/72">dashboard, projects, mentorship, and hiring</div>
                  </div>
                  <div className="rounded-[24px] border border-white/18 bg-black/10 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/64">Flow</div>
                    <div className="mt-2 text-3xl font-semibold text-white">Fast</div>
                    <div className="mt-2 text-sm text-white/72">clean sign-in with polished social options</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="rounded-[30px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,237,230,0.72))] p-5 shadow-[0_30px_90px_-52px_rgba(15,23,42,0.34)]">
                  <div className="flex items-center justify-between gap-4">
                    <Link href="/" className="inline-flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary-700 via-primary-600 to-info-600 text-sm font-bold text-white shadow-[0_24px_45px_-25px_rgba(79,70,229,0.6)]">
                        IH
                      </div>
                      <div>
                        <div className="text-sm font-semibold uppercase tracking-[0.28em] text-charcoal-900">InternHub</div>
                        <div className="text-sm text-charcoal-500">Premium talent ecosystem</div>
                      </div>
                    </Link>

                    <div className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-700 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.24)] sm:inline-flex">
                      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
                      Secure access
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                    <div>
                      <div className="rounded-full border border-secondary-200/70 bg-secondary-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-800 w-fit">
                        Sign in
                      </div>
                      <h2 className="mt-4 text-[2.1rem] font-semibold leading-none tracking-[-0.05em] text-charcoal-900 lg:text-[2.5rem]">
                        Continue to your dashboard
                      </h2>
                      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-charcoal-600">
                        New here?{' '}
                        <Link href="/signup" className="font-semibold text-primary-700 transition hover:text-info-700">
                          Create your account
                        </Link>
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-white/60 bg-white/72 p-4 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.26)]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-charcoal-500">Access panel</div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-charcoal-100">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-primary-600 via-info-500 to-secondary-500" />
                      </div>
                      <div className="mt-3 text-sm font-medium text-charcoal-900">Credentials or social login</div>
                      <div className="mt-1 text-xs leading-5 text-charcoal-500">Pick the path you prefer and continue.</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[30px] border border-white/60 bg-card/82 p-5 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:bg-charcoal-900/78 lg:p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {error ? (
                      <div className="rounded-[22px] border border-charcoal-200 bg-charcoal-100/80 px-4 py-3 text-sm text-charcoal-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-200">
                        {error}
                      </div>
                    ) : null}

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-charcoal-800 dark:text-charcoal-200">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="you@example.com"
                          className="h-12 rounded-[20px] border-white/60 bg-card/78 pl-11 shadow-sm dark:border-white/10 dark:bg-charcoal-900/70"
                          error={errors.email?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-charcoal-800 dark:text-charcoal-200">
                          Password
                        </label>
                        <Link href="/forgot-password" className="text-sm font-medium text-primary-700 hover:text-info-700 dark:text-info-300">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
                        <Input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="h-12 rounded-[20px] border-white/60 bg-card/78 pl-11 pr-11 shadow-sm dark:border-white/10 dark:bg-charcoal-900/70"
                          error={errors.password?.message}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-500 transition hover:text-primary-700 dark:text-charcoal-400 dark:hover:text-info-300"
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-charcoal-600 dark:text-charcoal-300">
                        <input
                          {...register('rememberMe')}
                          type="checkbox"
                          className="h-4 w-4 rounded border-charcoal-300 text-primary-700 focus:ring-primary-600"
                        />
                        Remember me
                      </label>
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                      Continue to dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-charcoal-200 to-transparent dark:via-charcoal-700" />
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal-400 dark:text-charcoal-400">
                      Or continue with
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-charcoal-200 to-transparent dark:via-charcoal-700" />
                  </div>

                  <SocialAuth />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
