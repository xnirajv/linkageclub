'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Users,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  type: z.enum(['general', 'sales', 'support', 'partnership']),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: 'general',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'support@internhub.com',
      description: 'We respond within 24 hours',
      href: 'mailto:support@internhub.com',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+91 98765 43210',
      description: 'Mon-Fri, 9AM-6PM IST',
      href: 'tel:+919876543210',
    },
    {
      icon: MapPin,
      label: 'Office',
      value: 'Bengaluru, Karnataka',
      description: 'India',
      href: 'https://maps.google.com/?q=Bengaluru',
    },
    {
      icon: Clock,
      label: 'Hours',
      value: '24/7 Support',
      description: 'Live chat always available',
    },
  ];

  const departments = [
    {
      icon: MessageSquare,
      title: 'General Inquiries',
      email: 'info@internhub.com',
      response: 'Within 24 hours',
    },
    {
      icon: Briefcase,
      title: 'Sales',
      email: 'sales@internhub.com',
      response: 'Within 12 hours',
    },
    {
      icon: Users,
      title: 'Partnerships',
      email: 'partners@internhub.com',
      response: 'Within 48 hours',
    },
    {
      icon: Mail,
      title: 'Support',
      email: 'help@internhub.com',
      response: 'Within 4 hours',
    },
  ];

  if (isSubmitted) {
    return (
      <div className="premium-shell py-16 sm:py-20">
        <div className="container-custom">
          <Card className="luxury-border mx-auto max-w-2xl p-10 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-500/15">
                <CheckCircle className="h-16 w-16 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Message Sent!</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-charcoal-600 dark:text-charcoal-300">
              Thank you for reaching out. Our team will get back to you within 24 hours.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
              <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                Send Another Message
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-shell pb-16">
      <section className="container-custom relative z-10 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Contact InternHub
          </div>
          <h1 className="mt-6 text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
            Get in touch with the team behind the premium talent ecosystem.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-charcoal-600 dark:text-charcoal-300">
            Have a question about hiring, partnerships, mentorship, or platform support? Send us a message and we will respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="container-custom relative z-10 pb-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {contactInfo.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="luxury-border card-hover p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="font-semibold">{item.label}</h3>
                {item.href ? (
                  <a href={item.href} className="mt-2 inline-block font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300">
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-2 font-medium text-charcoal-900 dark:text-white">{item.value}</p>
                )}
                <p className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">{item.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container-custom relative z-10 py-8">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="luxury-border p-8">
            <h2 className="text-2xl font-bold">Send us a message</h2>
            <p className="mt-3 text-sm text-charcoal-500 dark:text-charcoal-400">
              Share your context and we will route it to the right team.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-charcoal-800 dark:text-charcoal-200">
                    Your Name *
                  </label>
                  <Input id="name" {...register('name')} placeholder="John Doe" error={errors.name?.message} />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-charcoal-800 dark:text-charcoal-200">
                    Email Address *
                  </label>
                  <Input id="email" {...register('email')} type="email" placeholder="john@example.com" error={errors.email?.message} />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-charcoal-800 dark:text-charcoal-200">
                    Phone Number
                  </label>
                  <Input id="phone" {...register('phone')} placeholder="+91 98765 43210" error={errors.phone?.message} />
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-charcoal-800 dark:text-charcoal-200">
                    Subject *
                  </label>
                  <Input id="subject" {...register('subject')} placeholder="What is this about?" error={errors.subject?.message} />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="mb-2 block text-sm font-medium text-charcoal-800 dark:text-charcoal-200">
                  Inquiry Type *
                </label>
                <select
                  id="type"
                  {...register('type')}
                  className="interactive-ring flex h-12 w-full rounded-2xl border border-white/55 bg-card/72 px-4 py-3 text-sm text-charcoal-900 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-charcoal-900/72 dark:text-white"
                >
                  <option value="general">General Inquiry</option>
                  <option value="sales">Sales</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-charcoal-800 dark:text-charcoal-200">
                  Message *
                </label>
                <Textarea id="message" {...register('message')} placeholder="Tell us more about your inquiry..." rows={6} error={errors.message?.message} />
                <p className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">Minimum 20 characters</p>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="luxury-border p-8">
              <h3 className="text-xl font-bold">Department contacts</h3>
              <div className="mt-6 space-y-6">
                {departments.map((dept) => {
                  const Icon = dept.icon;
                  return (
                    <div key={dept.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-charcoal-900 dark:text-white">{dept.title}</h4>
                        <a href={`mailto:${dept.email}`} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-300">
                          {dept.email}
                        </a>
                        <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">Response: {dept.response}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="luxury-border p-8">
              <h4 className="font-medium text-charcoal-900 dark:text-white">Office hours</h4>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-charcoal-600 dark:text-charcoal-300">Monday - Friday</span>
                  <span className="font-medium text-charcoal-900 dark:text-white">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-charcoal-600 dark:text-charcoal-300">Saturday</span>
                  <span className="font-medium text-charcoal-900 dark:text-white">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-charcoal-600 dark:text-charcoal-300">Sunday</span>
                  <span className="font-medium text-charcoal-900 dark:text-white">Closed</span>
                </div>
              </div>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href="/help">Visit Help Center</Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-custom relative z-10 py-10">
        <Card className="luxury-border overflow-hidden p-4">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">Visit our office</h2>
            <p className="mt-2 text-charcoal-600 dark:text-charcoal-300">
              We are headquartered in Bengaluru, the heart of India&apos;s tech ecosystem.
            </p>
          </div>
          <div className="overflow-hidden rounded-[24px] shadow-medium">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124425.2459976659!2d77.5098755142578!3d12.953945614333564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1705123456789!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="InternHub Office Location"
              className="w-full"
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
