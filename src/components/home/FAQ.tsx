'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { AccordionWrapper } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

const faqItems = [
  {
    id: '1',
    title: 'Is InternHub really free for students?',
    content: 'Yes! InternHub offers a free plan that includes access to learning resources, basic assessments, project browsing, and community features. Premium features like advanced assessments and mentor sessions are available at affordable prices.',
  },
  {
    id: '2',
    title: 'How does the Trust Score work?',
    content: 'Trust Score is a 0-100 rating based on your verified skills, project completion, reviews, activity, and profile verification. Higher scores increase your visibility and chances of getting selected for projects and jobs.',
  },
  {
    id: '3',
    title: 'Can companies really hire students full-time?',
    content: 'Absolutely! Many companies use InternHub to find both freelancers for projects and full-time employees. Students can showcase their skills through verified assessments and project work, making them attractive hires.',
  },
  {
    id: '4',
    title: 'How do payments work for projects?',
    content: 'Project payments are held securely in escrow. When a milestone is completed and approved by the company, the payment is released to the student. All transactions are processed through Razorpay for security.',
  },
  {
    id: '5',
    title: 'What kind of mentorship can I get?',
    content: 'Our mentors are industry experts from top companies like Google, Amazon, and Microsoft. You can book 1-on-1 sessions for technical guidance, interview prep, career advice, and code reviews.',
  },
  {
    id: '6',
    title: 'Is there a money-back guarantee?',
    content: 'Yes! We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, contact support within 30 days for a full refund.',
  },
  {
    id: '7',
    title: 'How do I get verified?',
    content: 'You can get verified by completing skill assessments, connecting your LinkedIn/GitHub, submitting your portfolio, and verifying your email and phone number. Each verification step boosts your Trust Score.',
  },
  {
    id: '8',
    title: 'Can I use InternHub if I\'m not from a tech background?',
    content: 'Yes! Our learning paths start from basics and gradually advance. Many successful students have transitioned from non-tech backgrounds through our platform.',
  },
];

export function FAQ() {
  return (
    <section className="bg-card py-20 dark:bg-charcoal-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Badge variant="skill" className="mb-4">
            Got Questions?
          </Badge>
          <h2 className="text-3xl font-bold text-charcoal-950 sm:text-4xl dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-charcoal-600 dark:text-charcoal-300">
            Find answers to common questions about InternHub
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <AccordionWrapper
            type="single"
            collapsible
            items={faqItems.map(item => ({
              id: item.id,
              title: item.title,
              content: <p className="text-charcoal-600 dark:text-charcoal-400">{item.content}</p>,
            }))}
            className="space-y-4"
          />
        </motion.div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 p-8 dark:from-gray-800 dark:to-gray-800">
            <HelpCircle className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400" />
            <h3 className="mt-4 text-xl font-semibold text-charcoal-950 dark:text-white">
              Still have questions?
            </h3>
            <p className="mt-2 text-charcoal-600 dark:text-charcoal-400">
              Can't find the answer you're looking for? Please chat with our friendly team.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/help">Visit Help Center</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}